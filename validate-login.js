// this set of code is intended to validate a user's login attempt

document.addEventListener("DOMContentLoaded", () => {
  const signInForm = document.getElementById("signInForm");
  const errorMessage = document.getElementById("error-msg");

  signInForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent the default form submission

    //stores username and password values
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Will send a login request to a server
    // login is a placeholder name, can be kept or changed later
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json()) // converts response to javascript, to be used to verify successful login
      .then((data) => {
        if (data.success) {
          // Redirect to user's dashboard
          window.location.href = "/dashboard.html";
        } else {
          // Display error message
          errorMessage.textContent = data.message;
          errorMessage.style.display = "flex";
          document.getElementById("username").value = "";
          document.getElementById("password").value = "";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        errorMessage.textContent = "An error occurred. Please try again.";
        errorMessage.style.display = "flex";
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
      });
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const signInForm = document.getElementById("signInForm");
  const errorMessage = document.getElementById("error-msg");

  signInForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent the default form submission

    // Clear previous error message
    errorMessage.style.display = "none";

    // Display a loading indicator 
    const loadingIndicator = document.createElement("div");
    loadingIndicator.id = "loading";
    loadingIndicator.textContent = "Loading...";
    document.body.appendChild(loadingIndicator);

    // Stores username and password values
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Send a login request to the server
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Remove loading indicator
        document.body.removeChild(loadingIndicator);

        if (data.success) {
          // Redirect to user's dashboard
          window.location.href = "/dashboard.html";
        } else {
          // Display error message
          errorMessage.textContent = data.message;
          errorMessage.style.display = "flex";
          errorMessage.setAttribute("role", "alert"); // For accessibility
          // may remove
          document.getElementById("username").value = "";
          document.getElementById("password").value = "";
        }
      })
      .catch((error) => {
        console.error("Error:", error);

        errorMessage.textContent = "An error occurred. Please try again.";
        errorMessage.style.display = "flex";
        errorMessage.setAttribute("role", "alert"); // For accessibility
        // may remove
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
      });
  });
});