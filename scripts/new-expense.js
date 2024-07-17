// validates input and will send user's expense input to a database

import { auth, onAuthStateChanged, getDatabase, ref, push, update } from '/initialize-firebase.js';
import { sanitize } from '/sanitizeStrings.js'; // imports the sanitize function

function getExpenseFormValidation() {
  const expenseForm = document.getElementById("newExpense");
  const errorMessage = document.getElementById("new-expense-error-msg");
  const expenseSelect = document.getElementById("expenseSelect");
  const budgetTypeFieldset = document.querySelector(".budgetTypeFieldset");
  const formModal = document.getElementById("actionModal"); // Ensure formModal is selected

  // Gets the current date and formats it to MM/DD/YYYY
  function getCurrentFormattedDate() {
    const date = new Date();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return mm + '/' + dd + '/' + yyyy;
  }

  // Checks user input for valid data
  function validateFields() {
    const description = document.getElementById("exdescription").value.trim();
    const amount = document.getElementById("examount").value.trim();
    let selectedCategory;

    if (window.innerWidth < 768) { // small screen
      selectedCategory = expenseSelect.value;
    } else { // larger screen
      selectedCategory = document.querySelector('input[name="expenseTypes"]:checked')?.value;
    }

    let isValid = true;

    if (!description) {
      document.getElementById("exdescription").classList.add("is-invalid");
      isValid = false;
    } else {
      document.getElementById("exdescription").classList.remove("is-invalid");
    }

    if (!amount) {
      document.getElementById("examount").classList.add("is-invalid");
      isValid = false;
    } else {
      document.getElementById("examount").classList.remove("is-invalid");
    }

    if (!selectedCategory) {
      if (window.innerWidth < 768) {
        expenseSelect.classList.add("is-invalid");
      } else {
        document.querySelectorAll('input[name="expenseTypes"]').forEach(input => input.classList.add("is-invalid"));
      }
      isValid = false;
    } else {
      expenseSelect.classList.remove("is-invalid");
      document.querySelectorAll('input[name="expenseTypes"]').forEach(input => input.classList.remove("is-invalid"));
    }

    return isValid;
  }

  // Adds event listeners to remove "is-invalid" class when the user starts typing
  document.getElementById("exdescription").addEventListener("input", function () {
    this.classList.remove("is-invalid");
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
  });

  document.getElementById("examount").addEventListener("input", function () {
    this.classList.remove("is-invalid");
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
  });

  expenseSelect.addEventListener("change", function () {
    this.classList.remove("is-invalid");
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
  });

  document.querySelectorAll('input[name="expenseTypes"]').forEach(input => {
    input.addEventListener("change", function () {
      document.querySelectorAll('input[name="expenseTypes"]').forEach(input => input.classList.remove("is-invalid"));
      errorMessage.textContent = "";
      errorMessage.style.display = "none";
    });
  });

  expenseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateFields()) {
      errorMessage.textContent = "All fields are required.";
      errorMessage.style.display = "flex";
      return;
    }

    // Gathers expense data entered by the user
    const description = sanitize(document.getElementById("exdescription").value);
    const amount = parseFloat(sanitize(document.getElementById("examount").value)); // ensures the amount is a number
    const currentDate = getCurrentFormattedDate(); // gets the current date and assigns it to the expense submitted
    let selectedCategory;

    // Used to decide which input for expense type to accept based on the screen size
    if (window.innerWidth < 768) { // small screen
      selectedCategory = sanitize(expenseSelect.value);
    } else { // larger screen
      selectedCategory = sanitize(document.querySelector('input[name="expenseTypes"]:checked').value);
    }

    // Creates the data object to be sent user input to the back-end
    const data = {
      description: description,
      amount: amount,
      category: selectedCategory,
      date: currentDate // adds the current date to the data object
    };

    // Attempts to connect to Firebase and handle form submission
    try {
      const database = getDatabase();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const userId = user.uid;
          const newExpenseKey = push(ref(database, 'expenses/' + userId)).key;
          const updates = {};
          updates['/expenses/' + userId + '/' + newExpenseKey] = data;

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
          displayError("You must be signed in to add a new expense.");
        }
      });
    } catch (error) {
      // console.error("Firebase initialization error:", error);
      displayError("Unable to connect to the database. Please try again later.");
    }
  });

  // Displays error messages
  function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "flex";
  }

  function updateAndSynchronizeSelections() {
    const selectedRadio = document.querySelector('input[name="expenseTypes"]:checked');
    if (window.innerWidth < 768) {
      const selectedValue = expenseSelect.value;
      const radio = document.querySelector(`input[name="expenseTypes"][value="${selectedValue}"]`);
      if (radio) radio.checked = true;
    } else {
      const selectedValue = selectedRadio?.value;
      if (selectedValue) {
        expenseSelect.value = selectedValue;
      }
    }
  }

   // Adds listener for any changes in selection/radio buttons and calls function to make sure both match
   if (expenseSelect) {
    expenseSelect.addEventListener("change", updateAndSynchronizeSelections);
  }
  if (budgetTypeFieldset) {
    const radios = budgetTypeFieldset.querySelectorAll('input[name="expenseTypes"]');
    radios.forEach(radio => {
      radio.addEventListener("change", updateAndSynchronizeSelections);
    });
  }

  // Synchronize selections on window resize
  window.addEventListener('resize', updateAndSynchronizeSelections);

  // Initial synchronization
  updateAndSynchronizeSelections();
}

// Assign the function to the window object to ensure it can be called asynchronously
window.getExpenseFormValidation = getExpenseFormValidation;