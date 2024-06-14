// This set of code is intended to validate a user's attempt to submit a new source of income

function getFormValidation() {
  const incomeForm = document.getElementById("newIncome");
  const errorMessage = document.getElementById("new-income-error-msg");

  // Firebase references
  const database = firebase.database();
  const auth = firebase.auth();

  incomeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Gather income data entered by the user
    const incomeAmount = document.getElementById("incomeAmount").value;
    const incomeType = document.querySelector('input[name="incomeTypes"]:checked').value;
    const incomeDescription = document.getElementById("incomeDescription").value;

    // Create the data object to be sent to Firebase
    const data = {
      amount: incomeAmount,
      type: incomeType,
      description: incomeDescription,
    };

    // Get the current user's ID and update their income in Firebase
    auth.onAuthStateChanged((user) => {
      if (user) {
        const userId = user.uid;
        const newIncomeKey = database.ref().child('income/' + userId).push().key;
        const updates = {};
        updates['/income/' + userId + '/' + newIncomeKey] = data;

        database.ref().update(updates)
          .then(() => {
            // Redirect to the dashboard once successfully updated income
            window.location.href = "/dashboard.html";
          })
          .catch((error) => {
            console.error("Error:", error);
            errorMessage.textContent = "An error occurred. Please try again.";
            errorMessage.style.display = "flex";

            // Clears the input fields and resets radio to default selection
            document.getElementById("incomeAmount").value = "";
            document.getElementById("incomeType1").checked = true;
            document.getElementById("incomeDescription").value = "";
          });
      } else {
        console.log('No user is signed in.');
        errorMessage.textContent = "You must be signed in to add a new income source.";
        errorMessage.style.display = "flex";
      }
    });
  });
}

// Assign the function to the window object to ensure it can be called asynchronously
window.getFormValidation = getFormValidation;
