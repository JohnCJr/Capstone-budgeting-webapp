// This set of code will send user's expense input to a database

function getFormValidation() {
  // Store the form and error message div into variables
  const expenseForm = document.getElementById("newExpense");
  const errorMessage = document.getElementById("new-expense-error-msg");

  expenseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Gather expense data entered by the user
    const description = document.getElementById("exdescription").value;
    const amount = document.getElementById("examount").value;
    const selectedCategory = document.querySelector('input[name="expenseTypes"]:checked').value;

    // Create the data object to be sent to Firebase
    const data = {
      description: description,
      amount: amount,
      category: selectedCategory,
    };

    // Try to connect to Firebase and handle form submission
    try {
      const database = firebase.database();
      const auth = firebase.auth();

      auth.onAuthStateChanged((user) => {
        if (user) {
          const userId = user.uid;
          const newExpenseKey = database.ref().child('expenses/' + userId).push().key;
          const updates = {};
          updates['/expenses/' + userId + '/' + newExpenseKey] = data;

          database.ref().update(updates)
            .then(() => {
              // Redirect to the dashboard once successfully added expense
              window.location.href = "/dashboard.html";
            })
            .catch((error) => {
              console.error("Error:", error);
              errorMessage.textContent = "An error occurred. Please try again.";
              errorMessage.style.display = "flex";

              // Resets the input fields
              document.getElementById("exdescription").value = "";
              document.getElementById("examount").value = "";
              document.getElementById("expenseType1").checked = true;
            });
        } else {
          console.log('No user is signed in.');
          errorMessage.textContent = "You must be signed in to add a new expense.";
          errorMessage.style.display = "flex";
        }
      });
    } catch (error) {
      console.error("Firebase initialization error:", error);
      errorMessage.textContent = "Unable to connect to the database. Please try again later.";
      errorMessage.style.display = "flex";

      // Resets the input fields
      document.getElementById("exdescription").value = "";
      document.getElementById("examount").value = "";
      document.getElementById("expenseType1").checked = true;
    }
  });
}

// Assign the function to the window object to ensure it can be called asynchronously
window.getFormValidation = getFormValidation;