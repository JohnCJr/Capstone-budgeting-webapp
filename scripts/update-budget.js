// // This code validates and sends user input to update their budget

function getFormValidation() {
  const budgetForm = document.getElementById("updateBudget");
  const errorMessage = document.getElementById("update-budget-error-msg");
  const moneyBoxes = document.querySelectorAll(".money-field");

  // used to clear error text when user makes correction
  function clearErrorMessage() {
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
  }

  // checks to see if the budget set for categories exceeds the total budget
  function checkCategorySum() {
    const totalBudget =
      parseFloat(document.getElementById("totalBudget").value) || 0;
    const foodBudget =
      parseFloat(document.getElementById("foodBudget").value) || 0;
    const utilityBudget =
      parseFloat(document.getElementById("utilityBudget").value) || 0;
    const entertainmentBudget =
      parseFloat(document.getElementById("entertainmentBudget").value) || 0;
    const otherBudget =
      parseFloat(document.getElementById("otherBudget").value) || 0;

    const total =
      foodBudget + utilityBudget + entertainmentBudget + otherBudget;

    if (total > totalBudget) {
      errorMessage.textContent =
        "Categories total exceeds total budget amount. Please adjust a category or your budget";
      errorMessage.style.display = "flex";
      return false;
    }
    clearErrorMessage();

    return true;
  }

  budgetForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!checkCategorySum()) {
      return;
    }

    // Gather budget data entered by the user
    const totalBudget = document.getElementById("totalBudget").value;
    const foodBudget = document.getElementById("foodBudget").value;
    const utilityBudget = document.getElementById("utilityBudget").value;
    const entertainmentBudget = document.getElementById(
      "entertainmentBudget"
    ).value;
    const otherBudget = document.getElementById("otherBudget").value;

    // Create the data object of user input values to be sent to the back-end
    const data = {
      total: totalBudget,
      food: foodBudget,
      utility: utilityBudget,
      entertainment: entertainmentBudget,
      other: otherBudget,
    };

    // Send the data to the backend using fetch, update-budget is a temporary name
    fetch("/api/update-budget", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          // Redirect to the dashboard once successfully updated budget
          window.location.href = "/dashboard.html";
        } else {
          // Display an error message
          errorMessage.textContent = result.message;
          errorMessage.style.display = "flex";

          // Resets the input fields
          document.getElementById("totalBudget").value = "";
          document.getElementById("foodBudget").value = "";
          document.getElementById("utilityBudget").value = "";
          document.getElementById("entertainmentBudget").value = "";
          document.getElementById("otherBudget").value = "";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        errorMessage.textContent = "An error occurred. Please try again.";
        errorMessage.style.display = "flex";

        // // Resets the input fields, may change
        // document.getElementById('totalBudget').value = '';
        // document.getElementById('foodBudget').value = '';
        // document.getElementById('utilityBudget').value = '';
        // document.getElementById('entertainmentBudget').value = '';
        // document.getElementById('otherBudget').value = '';
      });
  });

  moneyBoxes.forEach((input) => {
    input.addEventListener("blur", function () {
      const newTotalBudget = document.getElementById("totalBudget").value;
      document.getElementById("newBudget").textContent = "$" + newTotalBudget;
      checkCategorySum();
    });
  });
}

// getFormValidation function to be called after the script is loaded to prevent issues with functionality
window.getFormValidation = getFormValidation;
