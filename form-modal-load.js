// gathers the necessary JS based on the button clicked and connects the new-expense, new-income, 
// update-budget, and savy_script js to the dashboard modal

// must update include toast for successful submission

document.addEventListener("DOMContentLoaded", () => {
  const formModal = document.getElementById("actionModal");
  const modalHeader = document.getElementById("modal-header-container");
  const modalBody = document.getElementById("modal-body");
  let msg;

  formModal.addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    const form = button.getAttribute("data-source");
    const header = button.getAttribute("data-title");

    // A dictionary that associates an html file with their respective js script
    const scriptMap = {
      "forms/update-budget.html": "scripts/update-budget.js",
      "forms/new-income.html": "scripts/new-income.js",
      "forms/new-expense.html": "scripts/new-expense.js",
    };

    modalHeader.innerHTML = header; // Adds header contained in the data of the button clicked by the user

    fetch(form) // Fetches data source, html file associated with the button clicked
      .then((response) => response.text()) // Converts to text
      .then((data) => {
        modalBody.innerHTML = data; // Loads the text data retrieved into the element with the modal-body id

        // Load the shared script first
        return loadScript("scripts/savy_script.js");
      })
      .then(() => {
        // Ensure the function from the first script is defined
        if (typeof window.getFormValidation === "function") {
          window.getFormValidation(); // Initialize the shared script
        }
        // Load the form-specific script
        return loadScript(scriptMap[form]);
      })
      .then(() => {
        // Initialize the form-specific script
        if (typeof window.getFormValidation === "function") {
          window.getFormValidation();
        }

        if (form === "forms/new-income.html") {
          msg = "income form";
        }
        else if (form === "forms/new-expense.html"){
          msg = "expense form";
        }
        else {
          msg = "budget form"
        }

        // Add event listener for cancel buttons within the modal
        const cancelButtons = modalBody.querySelectorAll('.btn-cancel, [data-bs-dismiss="modal"]');
        cancelButtons.forEach(button => {
          button.addEventListener('click', () => showCancelNotification(msg, "cancelled"));
        });
      })
      .catch((error) => {
        console.error("Failed to load form:", error);
        modalBody.innerHTML =
          '<p class="text-danger">Failed to load form. Please try again later.</p>';
      });
  });

  // Add event listener for the close button in the modal header
  const closeButton = formModal.querySelector('.btn-close');
  closeButton.addEventListener('click', () => showCancelNotification(`${msg}`, "closed"));

  // Function to display a cancel notification
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

    // converts time into a string to be used to display time elapsed 
    toast.innerHTML = `
      <div class="toast-header">
        <img src="images/logo.jpg" class="rounded me-2 " width="50px" alt="...">
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
        timeText = `just now`;  // default when less than a minute elapsed
      } else {
        timeText = `${diffInMinutes} minutes ago`;
      }

      small.textContent = timeText; // inserts text of time elapsed since the toast was made
    });

    setTimeout(updateTimestamps, 60000); // Update timestamps every minute
  }
});

// function used to dynaimically load the forms into the dashboard page
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    if (src !== "scripts/savy_script.js") {
      script.type = "module";
    }
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
