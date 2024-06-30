// This code validates and sends user input to update their budget

import { auth, onAuthStateChanged, getDatabase, ref, update, get } from '/initialize-firebase.js';
import { sanitize } from '/sanitizeStrings.js'; // Import the sanitize function

function getBudgetFormValidation(suggestedAmount = null, selectedValue = null) {
  const budgetForm = document.getElementById("updateBudget");
  const errorMessage = document.getElementById("update-budget-error-msg");
  const moneyBoxes = document.querySelectorAll(".money-field");
  const currentBudget = document.getElementById("currentBudget");
  const newBudget = document.getElementById("newBudget");

  // Used to clear error text when user makes correction
  function clearErrorMessage() {
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
  }

  // Checks if any input field is empty
  function checkEmptyFields() {
    const fields = [
      document.getElementById("totalBudget"),
      document.getElementById("foodBudget"),
      document.getElementById("utilityBudget"),
      document.getElementById("entertainmentBudget"),
      document.getElementById("otherBudget"),
      document.getElementById("budgetType") // Include the new budgetType field
    ];

    let allFieldsFilled = true;

    fields.forEach(field => {
      if (!field.value) {
        displayError("All fields must be filled out.");
        field.classList.add("is-invalid");
        allFieldsFilled = false;
      }
    });

    if (allFieldsFilled) {
      clearErrorMessage();
    }

    return allFieldsFilled;
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
      displayError("Categories total exceeds total budget amount. Please adjust a category or your budget.");
      return false;
    }
    clearErrorMessage();
    return true;
  }

  // Will set the default value of each field in the form if a budget for the user already exists
  function setDefaultValues(budgetData) {
    if (budgetData) {
      console.log('Setting default values:', budgetData);
      document.getElementById("foodBudget").value = sanitize(budgetData.food) || "";
      document.getElementById("utilityBudget").value = sanitize(budgetData.utility) || "";
      document.getElementById("entertainmentBudget").value = sanitize(budgetData.entertainment) || "";
      document.getElementById("otherBudget").value = sanitize(budgetData.other) || "";
      console.log("current suggested amount: " + sanitize(suggestedAmount));
      console.log("current type amount: " + sanitize(selectedValue));
      // If suggestedAmount and selectedValue are provided, override the fetched values
      if (suggestedAmount !== null & selectedValue !== null) {
        document.getElementById("totalBudget").value = sanitize(suggestedAmount) || "";
        document.getElementById("budgetType").value = sanitize(selectedValue) || "";
      }
      else {
        document.getElementById("totalBudget").value = sanitize(budgetData.total) || "";
        document.getElementById("budgetType").value = sanitize(budgetData.budgetType) || "yearly";
      }


      // Sets the value of current budget displayed in the modal header defaults to zero if data doesn't exist
      currentBudget.textContent = sanitize(budgetData.total) === "" ? '$0.00' : `$${sanitize(budgetData.total)}`;
      newBudget.textContent =   sanitize(suggestedAmount) === null ? sanitize(budgetData.total) : `$${sanitize(suggestedAmount)}`; 
    } else {
      // Set default values to $0.00 if no budget data exists
      document.getElementById("totalBudget").value = "0.00";
      document.getElementById("foodBudget").value = "0.00";
      document.getElementById("utilityBudget").value = "0.00";
      document.getElementById("entertainmentBudget").value = "0.00";
      document.getElementById("otherBudget").value = "0.00";
      document.getElementById("budgetType").value = "yearly";

      currentBudget.textContent = '$0.00';
      newBudget.textContent = '$0.00';
    }
  }

  function fetchAndSetDefaultValues() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userId = user.uid;
        const database = getDatabase();
        const budgetReference = ref(database, '/budgets/' + userId);

        get(budgetReference).then((snapshot) => {
          if (snapshot.exists()) {
            const budgetData = snapshot.val();
            setDefaultValues(budgetData);
          } else {
            console.log("No budget data available");
            setDefaultValues(null); // Call with null to set default values
          }
        }).catch((error) => {
          console.error("Error fetching budget data:", error);
        });
      } else {
        console.log('No user is signed in.');
      }
    });
  }

  // Function to format date to MM/DD/YYYY
  function getFormattedDate(date) {
    const [year, month, day] = date.split('-');
    const d = new Date(year, month - 1, day);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return mm + '/' + dd + '/' + yyyy;
  }

  budgetForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Check if any field is empty
    if (!checkEmptyFields()) {
      return;
    }

    // Display error message if sum of categories exceed the amount entered in totalBudget
    if (!checkCategorySum()) {
      return;
    }

    // Gather budget data entered by the user
    const totalBudget = sanitize(document.getElementById("totalBudget").value);
    const foodBudget = sanitize(document.getElementById("foodBudget").value);
    const utilityBudget = sanitize(document.getElementById("utilityBudget").value);
    const entertainmentBudget = sanitize(document.getElementById("entertainmentBudget").value);
    const otherBudget = sanitize(document.getElementById("otherBudget").value);
    const budgetType = sanitize(document.getElementById("budgetType").value); // Get the budget type
    const currentDate = getFormattedDate(new Date().toISOString().split('T')[0]); // Get the current formatted date

    // Create the data object of user input values to be sent to Firebase Realtime Database
    const data = {
      total: totalBudget,
      food: foodBudget,
      utility: utilityBudget,
      entertainment: entertainmentBudget,
      other: otherBudget,
      budgetType: budgetType, // Add the budget type to the data object
      date: currentDate // Add the formatted date to the data object
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
      const newTotalBudget = sanitize(document.getElementById("totalBudget").value);
      newBudget.textContent = "$" + newTotalBudget;
      checkCategorySum();
    });

    // Remove error state when the user starts typing
    input.addEventListener("input", function () {
      if (input.value) {
        input.classList.remove("is-invalid");
        clearErrorMessage();
      }
    });
  });

  fetchAndSetDefaultValues();
}

// Assign the function to the window object to ensure it can be called asynchronously
window.getBudgetFormValidation = getBudgetFormValidation;