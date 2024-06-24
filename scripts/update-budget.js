// This code validates and sends user input to update their budget
// If budget doesn't exist then one will be created and sent to firebase
// currently has some checks for erros that shouldn't be possible for testing purposes
import { auth, onAuthStateChanged, getDatabase, ref, update, get } from '/initialize-firebase.js';
import { sanitize } from '/sanitizeStrings.js'; // Import the sanitize function

function getBudgetFormValidation() {
  const budgetForm = document.getElementById("updateBudget");
  const errorMessage = document.getElementById("update-budget-error-msg");
  const moneyBoxes = document.querySelectorAll(".money-field");
  const currentBudget = document.getElementById("currentBudget");

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
      document.getElementById("otherBudget")
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
      document.getElementById("totalBudget").value = sanitize(budgetData.total) || "";
      document.getElementById("foodBudget").value = sanitize(budgetData.food) || "";
      document.getElementById("utilityBudget").value = sanitize(budgetData.utility) || "";
      document.getElementById("entertainmentBudget").value = sanitize(budgetData.entertainment) || "";
      document.getElementById("otherBudget").value = sanitize(budgetData.other) || "";

      currentBudget.textContent = sanitize(budgetData.total) === "" ? '$0' : `$${sanitize(budgetData.total)}`; // Sets the value of current budget displayed in the modal header
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
          }
        }).catch((error) => {
          console.error("Error fetching budget data:", error);
        });
      } else {
        console.log('No user is signed in.');
      }
    });
  }

  function getCurrentFormattedDate() {
    const date = new Date();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return mm + '-' + dd + '-' + yyyy;
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
    const currentDate = getCurrentFormattedDate(); // Get the current date

    // Create the data object of user input values to be sent to Firebase Realtime Database
    const data = {
      total: totalBudget,
      food: foodBudget,
      utility: utilityBudget,
      entertainment: entertainmentBudget,
      other: otherBudget,
      date: currentDate // Add the date to the data object
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
      document.getElementById("newBudget").textContent = "$" + newTotalBudget;
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