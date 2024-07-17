// validates a user's attempt to submit a new source of income, called by form-modal-load.js

import { auth, onAuthStateChanged, getDatabase, ref, push, update } from '/initialize-firebase.js';
import { sanitize } from '/sanitizeStrings.js'; // imports the sanitize function

function getIncomeFormValidation() {
  const incomeForm = document.getElementById("newIncome");
  const errorMessage = document.getElementById("new-income-error-msg");
  const incomeSelect = document.getElementById("incomeSelect");
  const intervalFieldset = document.querySelector(".intervalFieldset");
  const formModal = document.getElementById("actionModal"); // Ensure formModal is selected

  // gets the current date and formats it to MM/DD/YYYY
  function getCurrentFormattedDate() {
    const date = new Date();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return mm + '/' + dd + '/' + yyyy;
  }

  // checks user input for valid data
  function validateFields() {
    const description = document.getElementById("incomeDescription").value.trim();
    const amount = document.getElementById("incomeAmount").value.trim();
    let selectedType;

    // switches between radio or select options based on screen size
    if (window.innerWidth < 768) { // Small screen
      selectedType = incomeSelect.value;
    } else { // Larger screen
      selectedType = document.querySelector('input[name="incomeTypes"]:checked')?.value;
    }

    let isValid = true; // defaults to true

    // checks if description is not empty
    if (!description) {
      document.getElementById("incomeDescription").classList.add("is-invalid");
      isValid = false;
    } else {
      document.getElementById("incomeDescription").classList.remove("is-invalid");
    }

    // checks if amount entered is not empty
    if (!amount) {
      document.getElementById("incomeAmount").classList.add("is-invalid");
      isValid = false;
    } else {
      document.getElementById("incomeAmount").classList.remove("is-invalid");
    }

    // checks if selection is made, check is based on screen size
    if (!selectedType) {
      if (window.innerWidth < 768) {
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

  // adds event listeners to remove "is-invalid" class when the user starts typing, assuming that they will correct invalid input
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

    // gathers income data entered by the user
    const description = sanitize(document.getElementById("incomeDescription").value);
    const amount = parseFloat(sanitize(document.getElementById("incomeAmount").value));
    const currentDate = getCurrentFormattedDate(); // Get the current date
    let selectedType;

    // used to decide which input for income type to accept based on the screen size
    if (window.innerWidth < 768) { // Small screen
      selectedType = sanitize(incomeSelect.value);
    } else { // Larger screen
      selectedType = sanitize(document.querySelector('input[name="incomeTypes"]:checked').value);
    }

    if (selectedType === 'once') { selectedType = 'one-time'; }

    // Create the data object to be sent to Firebase
    const data = {
      amount: amount,
      type: selectedType,
      description: description,
      date: currentDate // adds the current date to the data object
    };

    // tries to connect to Firebase and handle form submission
    try {
      const database = getDatabase();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const userId = user.uid;
          const newIncomeKey = push(ref(database, 'income/' + userId)).key;
          const updates = {};
          updates['/income/' + userId + '/' + newIncomeKey] = data;

          // closes modal upon successful update
          update(ref(database), updates)
            .then(() => {
              formModal.classList.add('was-submitted');
              const modal = bootstrap.Modal.getInstance(document.getElementById('actionModal'));
              modal.hide();
            })
            .catch((error) => {
              // console.error("Error:", error);
              displayError("An error occurred. Please try again.");
            });
        } else {
          displayError("You must be signed in to add a new income source.");
        }
      });
    } catch (error) {
      // console.error("Firebase initialization error:", error);
      displayError("Unable to connect to the database. Please try again later.");
    }
  });

  // displays error messages
  function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "flex";
  }

  function updateAndSynchronizeSelections() {
    const selectedRadio = document.querySelector('input[name="incomeTypes"]:checked');
    if (window.innerWidth < 768) {
      const selectedValue = incomeSelect.value;
      const radio = document.querySelector(`input[name="incomeTypes"][value="${selectedValue}"]`);
      if (radio) radio.checked = true;
    } else {
      const selectedValue = selectedRadio.value;
      incomeSelect.value = selectedValue;
    }
  }

  // adds listener for any changes in selection/radio buttons and calls function to make sure both match
  if (incomeSelect) {
    incomeSelect.addEventListener("change", updateAndSynchronizeSelections);
  }
  if (intervalFieldset) {
    const radios = intervalFieldset.querySelectorAll('input[name="budgetTypes"]');
    radios.forEach(radio => {
      radio.addEventListener("change", updateAndSynchronizeSelections);
    });
  }

  // synchronize selections on window resize
  window.addEventListener('resize', updateAndSynchronizeSelections);

  // initial synchronization
  updateAndSynchronizeSelections();
}

// assigns the function to the window object to ensure it can be called asynchronously
window.getIncomeFormValidation = getIncomeFormValidation;