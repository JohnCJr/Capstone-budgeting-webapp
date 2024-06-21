// This set of code will send user's expense input to a database
import { auth, onAuthStateChanged, getDatabase, ref, push, update } from '/initialize-firebase.js'; // Adjust the path if necessary
import { sanitize } from '/sanitizeStrings.js'; // Import the sanitize function

function getFormValidation() {
  // Will store the form and error message div into variables
  const expenseForm = document.getElementById("newExpense");
  const errorMessage = document.getElementById("new-expense-error-msg");
  const expenseSelect = document.getElementById("incomeSelect");

  expenseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Gather expense data entered by the user
    const description = sanitize(document.getElementById("exdescription").value);
    const amount = sanitize(document.getElementById("examount").value);
    let selectedCategory;

    // used to decide which input for expense type to accept based on the screen size
    if (window.innerWidth < 576) { // Small screen
      selectedCategory = sanitize(expenseSelect.value);
    } else { // Larger screen
      selectedCategory = sanitize(document.querySelector('input[name="expenseTypes"]:checked').value);
    }

    // Validates user input data
    if (!amount || !selectedCategory || !description) {
      errorMessage.textContent = "All fields are required.";
      errorMessage.style.display = "flex";
      return;
    }

    // Create the data object to be sent user input to the back-end
    const data = {
      description: description,
      amount: amount,
      category: selectedCategory,
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
              // Redirect to the dashboard once successfully added expense
              window.location.href = "/dashboard.html";
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
window.getFormValidation = getFormValidation;