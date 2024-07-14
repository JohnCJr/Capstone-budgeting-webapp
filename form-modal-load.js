// gathers the necessary JS based on the button clicked and connects the new-expense, new-income, 
// update-budget, and savy_script js to the dashboard modal. Also handles budget suggestion card.

import { ref,get,database, onChildAdded, onChildChanged, onChildRemoved } from "./initialize-firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl)); // needed to trigger tooltips in the currentTotalIncome section
  const formModal = document.getElementById("actionModal");
  const modalHeader = document.getElementById("modal-header-container");
  const modalBody = document.getElementById("modal-body");
  const currentBudgetTitle = document.getElementById("currentTitle");
  const currentBudgetAmount = document.getElementById("currentTotalIncome");
  const suggestedBudgetTitle = document.getElementById("suggestedTitle");
  const suggestedBudgetAmount = document.getElementById("suggestedBudget");
  const setBudgetAmount = document.getElementById("setBudgetAmount");
  const budgetTypeSelect = document.getElementById("budgetTypeSelect");
  const selectContainer = document.querySelector(".selectContainer");
  const budgetTypeFieldset = document.querySelector(".budgetTypeFieldset");
  let suggestedAmount;
  let totalAmount;
  let selectedValue;
  let msg;
  let initialLoadComplete = false;

  // bootstrap spinners used as placeholders until data is pulled into the website
  const spinnerHTML = '<div class="spinner-border text-success" role="status"><span class="sr-only"></span></div>';
  currentBudgetAmount.innerHTML = spinnerHTML;
  suggestedBudgetAmount.innerHTML = spinnerHTML;

  setBudgetAmount.value = '';

  // listens to window resize, triggers radip/select display and number of toasts displayed when screen size is small
  window.addEventListener('resize', handleResize);

  handleResize(); // initial call to display and hide the correct input field 

  // used to call functions
  function handleResize() {
    toggleFieldsetSelectVisibility();
    manageToastsOnResize();
  }

  // hides/displays radios/select dropdown based on screen width
  function toggleFieldsetSelectVisibility() {
    if (window.innerWidth < 576) {
      budgetTypeFieldset.classList.add('d-none');
      budgetTypeFieldset.classList.remove('d-flex');
      selectContainer.classList.remove('d-none');
      selectContainer.classList.add('d-flex');
    } else {
      budgetTypeFieldset.classList.remove('d-none');
      budgetTypeFieldset.classList.add('d-flex');
      selectContainer.classList.add('d-none');
      selectContainer.classList.remove('d-flex');
    }
  }

  // changes max number of toasts displays from 4 to 1 when screen is small, keeping only the most recent one.
  function manageToastsOnResize() {
    if (window.innerWidth < 576) {
      const toasterContainer = document.getElementById('toasterContainer');
      while (toasterContainer.children.length > 1) {
        toasterContainer.removeChild(toasterContainer.firstChild);
      }
    }
  }

  // matches selection for both radio and select options so they match if the user changes the screen width on their device
  // also changes the header and suggested budget amount for the budgets suggestion section based the the user's selection 
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
  }

  // adds listener for any changes in selection/radio buttons and calls function to make sure both match
  if (budgetTypeSelect) {
    budgetTypeSelect.addEventListener("change", updateAndSynchronizeSelections);
  }
  if (budgetTypeFieldset) {
    const radios = budgetTypeFieldset.querySelectorAll('input[name="budgetTypes"]');
    radios.forEach(radio => {
      radio.addEventListener("change", updateAndSynchronizeSelections);
    });
  }

  // converts income amount to appropriate amount based on budget type and payment interval
  function calculateBudgetAmount(amount, interval, budgetType) {
    const conversionFactors = {
      yearly: { yearly: 1, monthly: 12, biweekly: 26, weekly: 52.17 },
      monthly: { yearly: 1 / 12, monthly: 1, biweekly: 2.15, weekly: 4.3 },
      weekly: { yearly: 1 / 52.17, monthly: 1 / 4.3, biweekly: 0.5, weekly: 1 }
    };

    // failsafe to handle any unexpected inputs that returns 0 so that NaN won't be returned
    if (!conversionFactors[budgetType] || !conversionFactors[budgetType][interval]) {
      // console.error(`Invalid conversion factors for budgetType: ${budgetType} and interval: ${interval}`);
      return 0;
    }
    const result = amount * conversionFactors[budgetType][interval];
    return parseFloat(result.toFixed(2));
  }

  // resets total amount and recalculates total income, omitting one-time sources
  function recalculateTotalBudget(selectedBudgetType) {
    totalAmount = 0;

    const userId = localStorage.getItem('userId');
    if (userId === '0') {
      currentBudgetAmount.textContent = '$0.00';
      suggestedBudgetAmount.textContent = '$0.00';
      return;
    }

    const incomesRef = ref(database, `income/${userId}`);
    get(incomesRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userIncomes = snapshot.val();
        
        // loops through array of values for userIncomes
        Object.values(userIncomes).forEach(income => {
          // console.log("incoeme typoe is : " + income.type);
          if (income.type !== 'once' && income.type !== 'one-time') {
            // passes values to function to see how income will be calculated
            totalAmount += calculateBudgetAmount(parseFloat(income.amount), income.type, selectedBudgetType); 
          }
        });

        currentBudgetAmount.textContent = `$${totalAmount.toFixed(2)}`;
        updateSuggestedBudgetAmount();
      } else {
        currentBudgetAmount.textContent = '$0.00';
        suggestedBudgetAmount.textContent = '$0.00';
      }
    }).catch((error) => {
      console.error('Error fetching user incomes:', error);
      currentBudgetAmount.textContent = '$0.00';
      suggestedBudgetAmount.textContent = '$0.00';
    });
  }

  // calculates and displays suggested budget amount and disables/enables button based on whether the value 
  // is more than zero and within the user's total income. Used to prevent submitting invalid data.
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

  // used to get the right script for the html that's dynamically loaded into the modal
  const scriptMap = {
    "forms/update-budget.html": "scripts/update-budget.js",
    "forms/new-income.html": "scripts/new-income.js",
    "forms/new-expense.html": "scripts/new-expense.js",
  };

  // formats input to have only one "."
  setBudgetAmount.addEventListener("input", (e) => {
    let value = e.target.value.replace(/[^\d.]/g, '');

    const decimalIndex = value.indexOf('.');
    if (decimalIndex !== -1) {
      value = value.slice(0, decimalIndex + 1) + value.slice(decimalIndex + 1).replace(/\./g, '').slice(0, 2);
    }
    e.target.value = value;

    updateSuggestedBudgetAmount();
  });

  // formats input amount when user clicks away from input field
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

  // loads the appropriate html and js file based on which button was clicked to show the modal.
  // will always load savy_script.js.
  formModal.addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    const form = button.getAttribute("data-source");  // data-source contains the html file path
    const header = button.getAttribute("data-title"); // contains data for header to display in the modal
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
          window.getFormValidationShared(); // function in savy_scripts.js
        }

        const formScript = scriptMap[form]; // sets variable based on html file 
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
              setBudgetAmount.value = '';
              suggestedBudgetAmount.textContent = currentBudgetAmount.textContent;
            } else {
              window.getBudgetFormValidation();
            }
          } else {
            throw new Error("Form validation function not found.");
          }
        } else {
          throw new Error("Form element not found.");
        }

        // used to edit toast message based on button clicked
        if (form === "forms/new-income.html") {
          msg = "income form";
        } else if (form === "forms/new-expense.html") {
          msg = "expense form";
        } else {
          msg = "budget form";
        }

        // adds listener to cancel button and dismiss button at the top right of the modal
        const cancelButtons = modalBody.querySelectorAll('.btn-cancel, [data-bs-dismiss="modal"]');
        cancelButtons.forEach(button => {
          button.addEventListener('click', () => {
            formModal.classList.add('was-cancelled');
            showCancelNotification(msg, "cancelled");
          });
        });

        // Remove was-submitted class before attempting submission
        formElement.addEventListener('submit', () => {
          formModal.classList.remove('was-submitted');
        });
      })
      .catch((error) => {
        console.error("Failed to load form:", error);
        // must be used to display error message since html is dynamically loaded into modal
        modalBody.innerHTML = '<p class="text-danger">Failed to load form. Please try again later.</p>';
      });
  });

  // removes dynamically loaded scripts and classes added once the type of action was taken, submission or cancelation.
  formModal.addEventListener("hidden.bs.modal", function () {
    modalBody.innerHTML = '';
    removeScripts(["scripts/savy_script.js", ...Object.values(scriptMap)]);
    modalHeader.innerHTML = "";

    if (formModal.classList.contains('was-submitted') && !(formModal.classList.contains('was-cancelled'))) {
      showSubmitNotification(msg, "submitted");
    } else if (!formModal.classList.contains('was-cancelled')) {
      showCancelNotification(msg, "closed");
    }
    formModal.classList.remove('was-cancelled', 'was-submitted');
  });

  // displays notification if form was closed or cancelled, limits the number that can be displayed to 4
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

    const actionText = action === "closed" ? "was closed" : "was cancelled";

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

    manageToasts(toast);
    const bsToast = new bootstrap.Toast(toast, { autohide: false });  // sets the toast to remain on screen until the user closes the toast
    bsToast.show();

    updateTimestamps();
  }

  // displays notification if form was submitted, limits the number that can be displayed to 4
  function showSubmitNotification(msg) {
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

    manageToasts(toast);
    const bsToast = new bootstrap.Toast(toast, { autohide: false });
    bsToast.show();

    updateTimestamps();
  }

  // Manage toasts based on screen size
  function manageToasts(newToast) {
    const toasterContainer = document.getElementById('toasterContainer');
    if (window.innerWidth < 576) {
      // Remove all existing toasts
      while (toasterContainer.firstChild) {
        toasterContainer.removeChild(toasterContainer.firstChild);
      }
    } else {
      // Limit the number of toasts to 4
      if (toasterContainer.children.length >= 4) {
        toasterContainer.removeChild(toasterContainer.firstChild);
      }
    }

    // Append the new toast
    toasterContainer.appendChild(newToast);
  }

  // updates toast timestamp based on how long it's been displayed, displays change every 1 minute
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

  // used to handle loading the script to the html as a module
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.type = "module";
      script.onload = () => {
        resolve();
      };
      script.onerror = () => {
        reject();
      };
      document.body.appendChild(script);
    });
  }

  // removes the all scripts that were loaded
  function removeScripts(scripts) {
    scripts.forEach(src => {
      const scriptElements = document.querySelectorAll(`script[src="${src}"]`);
      scriptElements.forEach(script => {
        script.remove();
      });
    });
  }

  // Adding Firebase real-time listeners for income "table" changes to update the total user income in 
  // the budget suggestion section to keep data displayed accurate and up to date
  const userId = localStorage.getItem('userId');
  if (userId && userId !== '0') {
    const incomesRef = ref(database, `income/${userId}`);
    
    onChildAdded(incomesRef, (snapshot) => {
      if (initialLoadComplete) {
        updateAndSynchronizeSelections();
      }
    });

    onChildChanged(incomesRef, (snapshot) => {
      updateAndSynchronizeSelections();
    });

    onChildRemoved(incomesRef, (snapshot) => {
      updateAndSynchronizeSelections();
    });

    // used to prevent updateAndSynchronizeSelections from being called twice upon initial page load.
    // for some reason, the onChildAdded event listener would be triggered when the page first loads.
    get(incomesRef).then(() => {
      initialLoadComplete = true;
    });
  }

  updateAndSynchronizeSelections();
});