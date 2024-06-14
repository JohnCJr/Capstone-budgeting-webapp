// This code validates and sends user input to update their budget
// If budget doesn't exist then one will be created and sent to firebase
// currently has some checks for erros that shouldn't be possible for testing purposes

function getFormValidation() {
  const budgetForm = document.getElementById("updateBudget");
  const errorMessage = document.getElementById("update-budget-error-msg");
  const moneyBoxes = document.querySelectorAll(".money-field");

  // Firebase references
  const database = firebase.database();
  const auth = firebase.auth();

  // Function to clear error messages
  function clearErrorMessage() {
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
  }

  // Function to check if the budget set for categories exceeds the total budget
  function checkCategorySum() {
    const totalBudget = parseFloat(document.getElementById("totalBudget").value) || 0;
    const foodBudget = parseFloat(document.getElementById("foodBudget").value) || 0;
    const utilityBudget = parseFloat(document.getElementById("utilityBudget").value) || 0;
    const entertainmentBudget = parseFloat(document.getElementById("entertainmentBudget").value) || 0;
    const otherBudget = parseFloat(document.getElementById("otherBudget").value) || 0;

    const total = foodBudget + utilityBudget + entertainmentBudget + otherBudget;

    if (total > totalBudget) {
      errorMessage.textContent = "Categories total exceeds total budget amount. Please adjust a category or your budget";
      errorMessage.style.display = "flex";
      return false;
    }
    clearErrorMessage();
    return true;
  }

  // Function to fetch and set the current user's budget
  function setDefaultBudget() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        const userId = user.uid;
        database.ref('budgets/' + userId).once('value', (snapshot) => {
          const data = snapshot.val();
          if (data) {
            document.getElementById("totalBudget").value = data.total || "";
            document.getElementById("foodBudget").value = data.food || "";
            document.getElementById("utilityBudget").value = data.utility || "";
            document.getElementById("entertainmentBudget").value = data.entertainment || "";
            document.getElementById("otherBudget").value = data.other || "";
          } else {
            document.getElementById("totalBudget").value = "";
            document.getElementById("foodBudget").value = "";
            document.getElementById("utilityBudget").value = "";
            document.getElementById("entertainmentBudget").value = "";
            document.getElementById("otherBudget").value = "";
          }
        });
      } else {
        console.log('No user is signed in.');
      }
    });
  }

  // Function to validate and update the budget
  budgetForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!checkCategorySum()) {
      return;
    }

    // Gather budget data entered by the user
    const totalBudget = document.getElementById("totalBudget").value;
    const foodBudget = document.getElementById("foodBudget").value;
    const utilityBudget = document.getElementById("utilityBudget").value;
    const entertainmentBudget = document.getElementById("entertainmentBudget").value;
    const otherBudget = document.getElementById("otherBudget").value;

    // Create the data object of user input values to be sent to Firebase
    const data = {
      total: totalBudget,
      food: foodBudget,
      utility: utilityBudget,
      entertainment: entertainmentBudget,
      other: otherBudget,
    };

    // Get the current user's ID and update their budget in Firebase
    auth.onAuthStateChanged((user) => {
      if (user) {
        const userId = user.uid;
        database.ref('budgets/' + userId).once('value')
          .then((snapshot) => {
            if (!snapshot.exists()) {
              console.log('No budget found. Creating a new budget.');
            }
            return database.ref('budgets/' + userId).set(data);
          })
          .then(() => {
            // Redirect to the dashboard once successfully updated budget
            window.location.href = "/dashboard.html";
          })
          .catch((error) => {
            console.error("Error:", error);
            errorMessage.textContent = "An error occurred. Please try again.";
            errorMessage.style.display = "flex";
          });
      } else {
        console.log('No user is signed in.');
        errorMessage.textContent = "You must be signed in to update the budget.";
        errorMessage.style.display = "flex";
      }
    });
  });

  moneyBoxes.forEach((input) => {
    input.addEventListener("blur", function () {
      const newTotalBudget = document.getElementById("totalBudget").value;
      document.getElementById("newBudget").textContent = "$" + newTotalBudget;
      checkCategorySum();
    });
  });

  // Set default budget values when the form is loaded
  setDefaultBudget();
}

// Assign the function to the window object to ensure it can be called asynchronously
window.getFormValidation = getFormValidation;