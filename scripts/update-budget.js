// This code validates and sends user input to update their budget
// If budget doesn't exist then one will be created and sent to firebase
// currently has some checks for erros that shouldn't be possible for testing purposes
import {auth, onAuthStateChanged, getDatabase, ref, update} from '/initialize-firebase.js';

function getFormValidation() {
  const budgetForm = document.getElementById("updateBudget");
  const errorMessage = document.getElementById("update-budget-error-msg");
  const moneyBoxes = document.querySelectorAll(".money-field");

  // Used to clear error text when user makes correction
  function clearErrorMessage() {
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
  }

  // Checks to see if the budget set for categories exceeds the total budget
  function checkCategorySum() {
    const totalBudget = parseFloat(document.getElementById("totalBudget").value) || 0;
    const foodBudget = parseFloat(document.getElementById("foodBudget").value) || 0;
    const utilityBudget = parseFloat(document.getElementById("utilityBudget").value) || 0;
    const entertainmentBudget = parseFloat(document.getElementById("entertainmentBudget").value) || 0;
    const otherBudget = parseFloat(document.getElementById("otherBudget").value) || 0;

    const total = foodBudget + utilityBudget + entertainmentBudget + otherBudget;

    if (total > totalBudget) {
      displayError("Categories total exceeds total budget amount. Please adjust a category or your budget");
      return false;
    }
    clearErrorMessage();
    return true;
  }

  budgetForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Display error message if sum of categories exceed the amount entered in totalBudget
    if (!checkCategorySum()) {
      return;
    }

    // Gather budget data entered by the user
    const totalBudget = document.getElementById("totalBudget").value;
    const foodBudget = document.getElementById("foodBudget").value;
    const utilityBudget = document.getElementById("utilityBudget").value;
    const entertainmentBudget = document.getElementById("entertainmentBudget").value;
    const otherBudget = document.getElementById("otherBudget").value;

    // Create the data object of user input values to be sent to Firebase Realtime Database
    const data = {
      total: totalBudget,
      food: foodBudget,
      utility: utilityBudget,
      entertainment: entertainmentBudget,
      other: otherBudget,
    };

    // Try to connect to Firebase Realtime Database and handle form submission
    try {
      const database = getDatabase();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const userId = user.uid;
          const updates = {};
          updates['/budgets/' + userId] = data;

          update(ref(database), updates)
            .then(() => {
              // Redirect to the dashboard once successfully updated budget
              window.location.href = "/dashboard.html";
            })
            .catch((error) => {
              console.error("Error:", error);
              displayError("An error occurred. Please try again.");
            });
        } else {
          console.log('No user is signed in.');
          displayError("You must be signed in to update your budget.");
        }
      });
    } catch (error) {
      console.error("Firebase initialization error:", error);
      displayError("Unable to connect to the database. Please try again later.");
    }
  });

  // Function to display error messages without clearing input fields
  function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "flex";
  }

  // Updates the new budget header to be the total entered by the user on the input field totalBudget
  moneyBoxes.forEach((input) => {
    input.addEventListener("blur", function () {
      const newTotalBudget = document.getElementById("totalBudget").value;
      document.getElementById("newBudget").textContent = "$" + newTotalBudget;
      checkCategorySum();
    });
  });
}

// Assign the function to the window object to ensure it can be called asynchronously
window.getFormValidation = getFormValidation;