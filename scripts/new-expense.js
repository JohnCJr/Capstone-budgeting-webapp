// This set of code will send user's expense input to a database

function getFormValidation() {
  // Will store the form and error message div into variables
  const expenseForm = document.getElementById("newExpense");
  const errorMessage = document.getElementById("new-expense-error-msg");

  expenseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Gather expense data entered by the user
    const description = document.getElementById("exdescription").value;
    const amount = document.getElementById("examount").value;
    const selectedCategory = document.querySelector(
      'input[name="expenseTypes"]:checked'
    ).value;

    // Create the data object to be sent user input to the back-end
    const data = {
      description: description,
      amount: amount,
      category: selectedCategory,
    };

    // Send the data to the backend using fetch, add-expense is a placeholer name
    fetch("/api/add-expense", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          // Redirect to the dashboard if successful
          window.location.href = "/dashboard.html";
        } else {
          // Display an error message
          errorMessage.textContent = result.message;
          errorMessage.style.display = "flex";

          // Resets the input fields
          document.getElementById("exdescription").value = "";
          document.getElementById("examount").value = "";
          document.getElementById("expenseType1").checked = true;
        }
      })
      .catch((error) => {
        console.error("Error:", error); // display error to the console
        errorMessage.textContent = "An error occurred. Please try again.";
        errorMessage.style.display = "flex";

        // Resets the input fields
        document.getElementById("exdescription").value = "";
        document.getElementById("examount").value = "";
        document.getElementById("expenseType1").checked = true;
      });
  });
}

// getFormValidation function to be called after the script is loaded to prevent issues with functionality
window.getFormValidation = getFormValidation;
