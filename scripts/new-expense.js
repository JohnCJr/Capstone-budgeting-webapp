// This set of code will send user's expense input to a database

function getFormValidation() {
  // Store the form and error message div into variables
  const expenseForm = document.getElementById("newExpense");
  const errorMessage = document.getElementById("new-expense-error-msg");

  // Firebase references
  const database = firebase.database();
  const auth = firebase.auth();

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

    // Get the current user's ID and update their expenses in Firebase
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
  });
}

// Assign the function to the window object to ensure it can be called asynchronously
window.getFormValidation = getFormValidation;