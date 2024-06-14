// This set of code is intended to validate a user's attempt to submit a new source of income

function getFormValidation() {
  const incomeForm = document.getElementById("newIncome");
  const errorMessage = document.getElementById("new-income-error-msg");

  incomeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Gather income data entered by the user
    const incomeAmount = document.getElementById("incomeAmount").value;
    const incomeType = document.querySelector(
      'input[name="incomeTypes"]:checked'
    ).value;
    const incomeDescription =
      document.getElementById("incomeDescription").value;

    // Create the data object to be sent to the back-end
    const data = {
      amount: incomeAmount,
      type: incomeType,
      description: incomeDescription,
    };

    // parses and sends the data object information to database
    //add-come is a placeholder name, can be used or changed
    fetch("/api/add-income", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json()) // retrieves result that will dictate if the user is returned to the dashboard or if an error message appears
      .then((result) => {
        if (result.success) {
          // Redirect the user to the dashboard for the moment
          window.location.href = "/dashboard.html";
        } else {
          // Display an error message
          errorMessage.textContent = result.message;
          errorMessage.style.display = "flex";

          // clears the input fields and resets radio to default selection
          document.getElementById("incomeAmount").value = "";
          document.getElementById("incomeType1").checked = true;
          document.getElementById("incomeDescription").value = "";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        errorMessage.textContent = "An error occurred. Please try again.";
        errorMessage.style.display = "flex";

        // clears the input fields and resets radio to default selection
        document.getElementById("incomeAmount").value = "";
        document.getElementById("incomeType1").checked = true;
        document.getElementById("incomeDescription").value = "";
      });
  });
}

// getFormValidation function to be called after the script is loaded to prevent issues with functionality
window.getFormValidation = getFormValidation;
