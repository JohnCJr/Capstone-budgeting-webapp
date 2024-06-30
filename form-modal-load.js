// gathers the necessary JS based on the button clicked and connects the new-expense, new-income, 
// update-budget, and savy_script js to the dashboard modal

// must update include toast for successful submission

import { ref,get,database, onChildAdded, onChildChanged, onChildRemoved } from "./initialize-firebase.js";

function logWindowWidth() {
  console.log(`Window width: ${window.innerWidth}px`);
}

// Log the window width when the page loads
window.addEventListener('load', logWindowWidth);

// Log the window width whenever the window is resized
window.addEventListener('resize', logWindowWidth);

document.addEventListener("DOMContentLoaded", () => {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  const formModal = document.getElementById("actionModal");
  const modalHeader = document.getElementById("modal-header-container");
  const modalBody = document.getElementById("modal-body");
  const currentBudgetTitle = document.getElementById("currentTitle");
  const currentBudgetAmount = document.getElementById("currentTotalIncome");
  const suggestedBudgetTitle = document.getElementById("suggestedTitle");
  const suggestedBudgetAmount = document.getElementById("suggestedBudget");
  const setBudgetAmount = document.getElementById("setBudgetAmount");
  const budgetTypeSelect = document.getElementById("budgetTypeSelect");
  const budgetTypeFieldset = document.querySelector(".budgetTypeFieldset");
  let suggestedAmount;
  let totalAmount;
  let selectedValue;
  let msg;

  let initialLoadComplete = false;

  setBudgetAmount.value = '';

  function updateAndSynchronizeSelections() {
    const selectedRadio = document.querySelector('input[name="budgetTypes"]:checked');
    if (window.innerWidth < 576) {
      selectedValue = budgetTypeSelect.value;
      selectedRadio.value = budgetTypeSelect.value;
      const radio = document.querySelector(`input[name="budgetTypes"][value="${selectedValue}"]`);
      if (radio) radio.checked = true;
    } else {
      selectedValue = selectedRadio.value;
      budgetTypeSelect.value = selectedRadio.value;
    }

    currentBudgetTitle.textContent = `Current ${selectedValue} income`;
    suggestedBudgetTitle.textContent = `Suggested ${selectedValue} budget`;

    recalculateTotalBudget(selectedValue);
    console.log('recalculateTotalBudget is being called from updateAndSynchronizeSelections');
  }

  if (budgetTypeSelect) {
    budgetTypeSelect.addEventListener("change", updateAndSynchronizeSelections);
  }

  if (budgetTypeFieldset) {
    const radios = budgetTypeFieldset.querySelectorAll('input[name="budgetTypes"]');
    radios.forEach(radio => {
      radio.addEventListener("change", updateAndSynchronizeSelections);
    });
  }

  function calculateBudgetAmount(amount, interval, budgetType) {
    const conversionFactors = {
      yearly: {
        yearly: 1,
        monthly: 12,
        biweekly: 26,
        weekly: 52.17
      },
      monthly: {
        yearly: 1 / 12,
        monthly: 1,
        biweekly: 2.15,
        weekly: 4.3
      },
      weekly: {
        yearly: 1 / 52.17,
        monthly: 1 / 4.3,
        biweekly: 0.5,
        weekly: 1
      }
    };

    const result = amount * conversionFactors[budgetType][interval];
    return parseFloat(result.toFixed(2));
  }

  function recalculateTotalBudget(selectedBudgetType) {
    console.log('recalculateTotalBudget is being called');
    totalAmount = 0;

    const userId = localStorage.getItem('userId');
    if (userId === '0') {
      console.log('User is not logged in');
      return;
    }

    const incomesRef = ref(database, `income/${userId}`);
    get(incomesRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userIncomes = snapshot.val();

        Object.values(userIncomes).forEach(income => {
          if (income.type !== 'once') {
            totalAmount += calculateBudgetAmount(parseFloat(income.amount), income.type, selectedBudgetType);
          }
        });

        currentBudgetAmount.textContent = `$${totalAmount.toFixed(2)}`;
        updateSuggestedBudgetAmount();
      } else {
        console.log('No incomes found for user');
        currentBudgetAmount.textContent = '$0.00';
      }
    }).catch((error) => {
      console.error('Error fetching user incomes:', error);
      currentBudgetAmount.textContent = '$0.00';
    });
  }

  function updateSuggestedBudgetAmount() {
    const budgetAmount = parseFloat(setBudgetAmount.value) || 0;
    suggestedAmount = (totalAmount - budgetAmount).toFixed(2);
    suggestedBudgetAmount.textContent = `$${suggestedAmount}`;

    if (budgetAmount > 0 && budgetAmount <= totalAmount) {
      setBudgetButton.disabled = false;
    } else {
      setBudgetButton.disabled = true;
    }
  }

  setBudgetAmount.addEventListener("input", updateSuggestedBudgetAmount);

  const scriptMap = {
    "forms/update-budget.html": "scripts/update-budget.js",
    "forms/new-income.html": "scripts/new-income.js",
    "forms/new-expense.html": "scripts/new-expense.js",
  };

  setBudgetAmount.addEventListener("input", (e) => {
    let value = e.target.value.replace(/[^\d.]/g, '');

    const decimalIndex = value.indexOf('.');
    if (decimalIndex !== -1) {
      value = value.slice(0, decimalIndex + 1) + value.slice(decimalIndex + 1).replace(/\./g, '').slice(0, 2);
    }
    e.target.value = value;

    updateSuggestedBudgetAmount();
  });

  setBudgetAmount.addEventListener('blur', function () {
    let value = this.value;
    value = value.replace(/^0+(?=\d)/, '');
    if (value) {
      if (value.indexOf(".") == 0) {
        value = "0" + value;
      }
      if (!value.includes('.')) {
        value += '.00';
      } else if (value.split('.')[1].length === 1) {
        value += '0';
      } else if (value.split('.')[1].length === 0) {
        value += '00';
      }
    }
    this.value = value;
  });

  formModal.addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    const form = button.getAttribute("data-source");
    const header = button.getAttribute("data-title");
    const buttonId = button.id;

    modalHeader.innerHTML = header;

    modalBody.innerHTML = '';
    removeScripts(["scripts/savy_script.js", ...Object.values(scriptMap)]);

    fetch(form)
      .then((response) => response.text())
      .then((data) => {
        modalBody.innerHTML = data;

        return loadScript("scripts/savy_script.js");
      })
      .then(() => {
        if (typeof window.getFormValidationShared === "function") {
          window.getFormValidationShared();
        }

        const formScript = scriptMap[form];
        return loadScript(formScript);
      })
      .then(() => {
        const formElement = document.querySelector("form");
        if (formElement) {
          if (form === "forms/new-income.html" && typeof window.getIncomeFormValidation === "function") {
            window.getIncomeFormValidation();
          } else if (form === "forms/new-expense.html" && typeof window.getExpenseFormValidation === "function") {
            window.getExpenseFormValidation();
          } else if (form === "forms/update-budget.html" && typeof window.getBudgetFormValidation === "function") {
            if (buttonId === 'setBudgetButton') {
              window.getBudgetFormValidation(suggestedAmount, selectedValue);
            } else {
              window.getBudgetFormValidation();
            }
          } else {
            throw new Error("Form validation function not found.");
          }
        } else {
          throw new Error("Form element not found.");
        }

        if (form === "forms/new-income.html") {
          msg = "income form";
        } else if (form === "forms/new-expense.html") {
          msg = "expense form";
        } else {
          msg = "budget form";
        }

        const cancelButtons = modalBody.querySelectorAll('.btn-cancel, [data-bs-dismiss="modal"]');
        cancelButtons.forEach(button => {
          button.addEventListener('click', () => {
            formModal.classList.add('was-cancelled');
            showCancelNotification(msg, "cancelled");
          });
        });

        formElement.addEventListener('submit', () => {
          formModal.classList.add('was-submitted');
        });
      })
      .catch((error) => {
        console.error("Failed to load form:", error);
        modalBody.innerHTML = '<p class="text-danger">Failed to load form. Please try again later.</p>';
      });
  });

  formModal.addEventListener("hidden.bs.modal", function () {
    modalBody.innerHTML = '';
    removeScripts(["scripts/savy_script.js", ...Object.values(scriptMap)]);
    modalHeader.innerHTML = "";

    if (formModal.classList.contains('was-submitted')) {
      showSubmitNotification(msg, "submitted");
    } else if (!formModal.classList.contains('was-cancelled')) {
      showCancelNotification(msg, "closed");
    }
    formModal.classList.remove('was-cancelled', 'was-submitted');
  });

  function showCancelNotification(msg, action) {
    const toasterContainer = document.getElementById('toasterContainer');
    if (toasterContainer.children.length >= 4) {
      toasterContainer.removeChild(toasterContainer.firstChild);
    }

    const timestamp = new Date();
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-bg-warning border-0';
    toast.role = 'alert';
    toast.ariaLive = 'assertive';
    toast.ariaAtomic = 'true';

    const actionText = action === "closed" ? "was closed" : "action was cancelled";

    toast.innerHTML = `
      <div class="toast-header">
        <img src="images/logo.jpg" class="rounded me-2" width="50px" alt="...">
        <strong class="me-auto">Notification</strong>
        <small class="text-body-secondary" data-timestamp="${timestamp.toISOString()}">just now</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        The ${msg} ${actionText}.
      </div>
    `;

    toasterContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { autohide: false });
    bsToast.show();

    updateTimestamps();
  }

  function showSubmitNotification(msg, action) {
    const toasterContainer = document.getElementById('toasterContainer');
    if (toasterContainer.children.length >= 4) {
      toasterContainer.removeChild(toasterContainer.firstChild);
    }

    const timestamp = new Date();
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-bg-success border-0';
    toast.role = 'alert';
    toast.ariaLive = 'assertive';
    toast.ariaAtomic = 'true';

    const actionText = "was successfully submitted";

    toast.innerHTML = `
      <div class="toast-header">
        <img src="images/logo.jpg" class="rounded me-2" width="50px" alt="...">
        <strong class="me-auto">Notification</strong>
        <small class="text-body-secondary" data-timestamp="${timestamp.toISOString()}">just now</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        The ${msg} ${actionText}.
      </div>
    `;

    toasterContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { autohide: false });
    bsToast.show();

    updateTimestamps();
  }

  function updateTimestamps() {
    const toasts = document.querySelectorAll('.toast small[data-timestamp]');
    toasts.forEach((small) => {
      const timestamp = new Date(small.getAttribute('data-timestamp'));
      const now = new Date();
      const diffInMinutes = Math.floor((now - timestamp) / 60000);

      let timeText = '';
      if (diffInMinutes < 1) {
        timeText = `just now`;
      } else {
        timeText = `${diffInMinutes} minutes ago`;
      }

      small.textContent = timeText;
    });

    setTimeout(updateTimestamps, 60000);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.type = "module";
      script.onload = () => {
        console.log(`${src} loaded successfully`);
        resolve();
      };
      script.onerror = () => {
        console.error(`Failed to load ${src}`);
        reject();
      };
      document.body.appendChild(script);
    });
  }

  function removeScripts(scripts) {
    scripts.forEach(src => {
      const scriptElements = document.querySelectorAll(`script[src="${src}"]`);
      scriptElements.forEach(script => {
        console.log(`Removing script: ${src}`);
        script.remove();
      });
    });
  }

  // Adding Firebase listeners for income changes
  const userId = localStorage.getItem('userId');
  if (userId && userId !== '0') {
    const incomesRef = ref(database, `income/${userId}`);
    
    onChildAdded(incomesRef, (snapshot) => {
      if (initialLoadComplete) {
        updateAndSynchronizeSelections();
        console.log('updateAndSynchronizeSelections is being called from onChildAdded');
      }
    });

    onChildChanged(incomesRef, (snapshot) => {
      updateAndSynchronizeSelections();
      console.log('updateAndSynchronizeSelections is being called from onChildChanged');
    });

    onChildRemoved(incomesRef, (snapshot) => {
      updateAndSynchronizeSelections();
      console.log('updateAndSynchronizeSelections is being called from onChildRemoved');
    });

    // used to prevent updateAndSynchronizeSelections from being called twice upon initial page load.
    // for some reason, the onChildAdded event listener would be triggered when the page first loads.
    get(incomesRef).then(() => {
      initialLoadComplete = true;
    });
  }

  updateAndSynchronizeSelections();
});