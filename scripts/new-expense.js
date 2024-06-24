// This set of code will send user's expense input to a database
import { auth, onAuthStateChanged, getDatabase, ref, push, update } from '/initialize-firebase.js'; // Adjust the path if necessary
import { sanitize } from '/sanitizeStrings.js'; // Import the sanitize function

function getExpenseFormValidation() {
  // Will store the form and error message div into variables
  const expenseForm = document.getElementById("newExpense");
  const errorMessage = document.getElementById("new-expense-error-msg");
  const expenseSelect = document.getElementById("expenseSelect");

  function getCurrentFormattedDate() {
    const date = new Date();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return mm + '/' + dd + '/' + yyyy;
  }

  function validateFields() {
    const description = document.getElementById("exdescription").value.trim();
    const amount = document.getElementById("examount").value.trim();
    let selectedCategory;

    if (window.innerWidth < 576) { // Small screen
      selectedCategory = expenseSelect.value;
    } else { // Larger screen
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

    return isValid;
  }

  // Add event listeners to remove "is-invalid" class when the user starts typing
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


  expenseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateFields()) {
      errorMessage.textContent = "All fields are required.";
      errorMessage.style.display = "flex";
      return;
    }

    // Gather expense data entered by the user
    const description = sanitize(document.getElementById("exdescription").value);
    const amount = sanitize(document.getElementById("examount").value);
    const currentDate = getCurrentFormattedDate(); // Get the current date and assigns it to the expense submitted
    let selectedCategory;

    // used to decide which input for expense type to accept based on the screen size
    if (window.innerWidth < 576) { // Small screen
      selectedCategory = sanitize(expenseSelect.value);
    } else { // Larger screen
      selectedCategory = sanitize(document.querySelector('input[name="expenseTypes"]:checked').value);
    }

    // Create the data object to be sent user input to the back-end
    const data = {
      description: description,
      amount: amount,
      category: selectedCategory,
      date: currentDate // Add the date to the data object
    };

    // Attempt to connect to Firebase and handle form submission
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
          displayError("You must be signed in to add a new expense.");
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

    // Clears the input fields
    document.getElementById("exdescription").value = "";
    document.getElementById("examount").value = "";
    document.getElementById("expenseType1").checked = true;
  }
}

// Assign the function to the window object to ensure it can be called asynchronously
window.getExpenseFormValidation = getExpenseFormValidation;