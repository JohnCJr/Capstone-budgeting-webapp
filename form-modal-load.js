// gathers the necessary JS based on the button clicked and connects the new-expense, new-income, 
// update-budget, and savy_script js to the dashboard modal

// must update include toast for successful submission

document.addEventListener("DOMContentLoaded", () => {
  const formModal = document.getElementById("actionModal");
  const modalHeader = document.getElementById("modal-header-container");
  const modalBody = document.getElementById("modal-body");
  let msg;

  const scriptMap = {
    "forms/update-budget.html": "scripts/update-budget.js",
    "forms/new-income.html": "scripts/new-income.js",
    "forms/new-expense.html": "scripts/new-expense.js",
  };

  formModal.addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    const form = button.getAttribute("data-source");
    const header = button.getAttribute("data-title");

    modalHeader.innerHTML = header;

    // Clear previous modal content and remove previously added scripts
    modalBody.innerHTML = '';
    removeScripts(["scripts/savy_script.js", ...Object.values(scriptMap)]);

    fetch(form)
      .then((response) => response.text())
      .then((data) => {
        modalBody.innerHTML = data;

        // Load the shared script first
        return loadScript("scripts/savy_script.js");
      })
      .then(() => {
        // Ensure the function from the first script is defined
        if (typeof window.getFormValidationShared === "function") {
          window.getFormValidationShared(); // Initialize the shared script
        }

        // Load the form-specific script
        const formScript = scriptMap[form];
        return loadScript(formScript);
      })
      .then(() => {
        // Ensure the form element exists before calling the specific validation function
        const formElement = document.querySelector("form"); // or use the specific ID of the form
        if (formElement) {
          if (form === "forms/new-income.html" && typeof window.getIncomeFormValidation === "function") {
            window.getIncomeFormValidation();
          } else if (form === "forms/new-expense.html" && typeof window.getExpenseFormValidation === "function") {
            window.getExpenseFormValidation();
          } else if (form === "forms/update-budget.html" && typeof window.getBudgetFormValidation === "function") {
            window.getBudgetFormValidation();
          } else {
            throw new Error("Form validation function not found.");
          }
        } else {
          throw new Error("Form element not found.");
        }

        // Determine message type for notifications
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

        // Add event listener for form submission
        formElement.addEventListener('submit', () => {
          formModal.classList.add('was-submitted');
        });
      })
      .catch((error) => {
        console.error("Failed to load form:", error);
        modalBody.innerHTML =
          '<p class="text-danger">Failed to load form. Please try again later.</p>';
      });
  });

  formModal.addEventListener("hidden.bs.modal", function () {
    console.log("Modal hidden. Cleaning up scripts and content.");
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
});