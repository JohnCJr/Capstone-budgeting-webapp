// This set of code is intended to validate a user's attempt to submit a new source of income
import { auth, onAuthStateChanged, getDatabase, ref, push, update } from '/initialize-firebase.js'; // Adjust the path if necessary
import { sanitize } from '/sanitizeStrings.js'; // Import the sanitize function


function getIncomeFormValidation() {
  const incomeForm = document.getElementById("newIncome");
  const errorMessage = document.getElementById("new-income-error-msg");
  const incomeSelect = document.getElementById("incomeSelect");

  function getCurrentFormattedDate() {
    const date = new Date();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return mm + '/' + dd + '/' + yyyy;
  }

  function validateFields() {
    const description = document.getElementById("incomeDescription").value.trim();
    const amount = document.getElementById("incomeAmount").value.trim();
    let selectedType;

    if (window.innerWidth < 576) { // Small screen
      selectedType = incomeSelect.value;
    } else { // Larger screen
      selectedType = document.querySelector('input[name="incomeTypes"]:checked')?.value;
    }

    let isValid = true;

    if (!description) {
      document.getElementById("incomeDescription").classList.add("is-invalid");
      isValid = false;
    } else {
      document.getElementById("incomeDescription").classList.remove("is-invalid");
    }

    if (!amount) {
      document.getElementById("incomeAmount").classList.add("is-invalid");
      isValid = false;
    } else {
      document.getElementById("incomeAmount").classList.remove("is-invalid");
    }

    if (!selectedType) {
      if (window.innerWidth < 576) {
        incomeSelect.classList.add("is-invalid");
      } else {
        document.querySelectorAll('input[name="incomeTypes"]').forEach(input => input.classList.add("is-invalid"));
      }
      isValid = false;
    } else {
      incomeSelect.classList.remove("is-invalid");
      document.querySelectorAll('input[name="incomeTypes"]').forEach(input => input.classList.remove("is-invalid"));
    }

    return isValid;
  }

  // Add event listeners to remove "is-invalid" class when the user starts typing
  document.getElementById("incomeDescription").addEventListener("input", function () {
    this.classList.remove("is-invalid");
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
  });

  document.getElementById("incomeAmount").addEventListener("input", function () {
    this.classList.remove("is-invalid");
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
  });

  incomeSelect.addEventListener("change", function () {
    this.classList.remove("is-invalid");
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
  });

  document.querySelectorAll('input[name="incomeTypes"]').forEach(input => {
    input.addEventListener("change", function () {
      document.querySelectorAll('input[name="incomeTypes"]').forEach(input => input.classList.remove("is-invalid"));
      errorMessage.textContent = "";
      errorMessage.style.display = "none";
    });
  });

  incomeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateFields()) {
      errorMessage.textContent = "All fields are required.";
      errorMessage.style.display = "flex";
      return;
    }

    // Gather income data entered by the user
    const description = sanitize(document.getElementById("incomeDescription").value);
    const amount = sanitize(document.getElementById("incomeAmount").value);
    const currentDate = getCurrentFormattedDate(); // Get the current date
    let selectedType;

    // used to decide which input for income type to accept based on the screen size
    if (window.innerWidth < 576) { // Small screen
      selectedType = sanitize(incomeSelect.value);
    } else { // Larger screen
      selectedType = sanitize(document.querySelector('input[name="incomeTypes"]:checked').value);
    }

    // Create the data object to be sent to Firebase
    const data = {
      amount: amount,
      type: selectedType,
      description: description,
      date: currentDate // Add the date to the data object
    };

    // Try to connect to Firebase and handle form submission
    try {
      const database = getDatabase();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const userId = user.uid;
          const newIncomeKey = push(ref(database, 'income/' + userId)).key;
          const updates = {};
          updates['/income/' + userId + '/' + newIncomeKey] = data;

          update(ref(database), updates)
            .then(() => {
               // Show success notification
               const modal = bootstrap.Modal.getInstance(document.getElementById('actionModal'));
               modal.hide();
            })
            .catch((error) => {
              console.error("Error:", error);
              displayError("An error occurred. Please try again.");
            });
        } else {
          console.log('No user is signed in.');
          displayError("You must be signed in to add a new income source.");
        }
      });
    } catch (error) {
      console.error("Firebase initialization error:", error);
      displayError("Unable to connect to the database. Please try again later.");
    }
  });

  // Function to display error messages
  function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "flex";

    // Clears the input fields and resets radio to default selection
    document.getElementById("incomeAmount").value = "";
    document.getElementById("incomeType1").checked = true;
    document.getElementById("incomeDescription").value = "";
  }
}

// Assign the function to the window object to ensure it can be called asynchronously
window.getIncomeFormValidation = getIncomeFormValidation;