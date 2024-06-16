// This set of code is intended to validate a user's attempt to submit a new source of income

function getFormValidation() {
  const incomeForm = document.getElementById("newIncome");
  const errorMessage = document.getElementById("new-income-error-msg");

  incomeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Gather income data entered by the user
    const incomeAmount = document.getElementById("incomeAmount").value;
    const incomeType = document.querySelector('input[name="incomeTypes"]:checked').value;
    const incomeDescription = document.getElementById("incomeDescription").value;

    // Validate input data
    if (!incomeAmount || !incomeType || !incomeDescription) {
      errorMessage.textContent = "All fields are required.";
      errorMessage.style.display = "flex";
      return;
    }

    // Create the data object to be sent to Firebase
    const data = {
      amount: incomeAmount,
      type: incomeType,
      description: incomeDescription,
    };

    // Try to connect to Firebase and handle form submission
    try {
      const database = firebase.database();
      const auth = firebase.auth();

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
window.getFormValidation = getFormValidation;