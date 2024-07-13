// resets user password if the correct username, email, and phoneNumber provided. 
// Firebase sneds email with link to change password

import { auth, database, ref, get, orderByChild, equalTo, query, sendPasswordResetEmail } from "./initialize-firebase.js"; // Adjust the path if necessary
import { sanitize, validateEmail } from './sanitizeStrings.js';  // Import the sanitize function

document.addEventListener("DOMContentLoaded", () => {
  const resetForm = document.getElementById("resetForm");
  const errorMessage = document.getElementById("error-msg");
  const cancelButton = document.querySelector(".logon-links");

  // validation and formatting for phone number input
  const phoneNumberInput = document.getElementById('phoneNumber');
  phoneNumberInput.addEventListener('input', (e) => {
    const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    if (e.target.classList.contains('is-invalid')) {
      e.target.classList.remove('is-invalid');
      hideErrorMessage();
    }
  });

  // add event listeners for real-time validation of all fields
  document.querySelectorAll('#resetForm input').forEach(input => {
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        input.classList.remove('is-invalid');
        hideErrorMessage();
      }
    });
  });

  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the default form submission

    // get and sanitize user input values
    const userEmail = sanitize(document.getElementById("userEmail").value, true);
    const username = sanitize(document.getElementById("username").value);
    const phoneNumber = sanitize(document.getElementById("phoneNumber").value.replace(/\D/g, '')); // Remove formatting

    let formValid = true; // validate fields are not empty
    document.querySelectorAll('#resetForm input').forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('is-invalid');
        formValid = false;
      }
    });

    if (!formValid) {
      displayError("All fields are required");
      return;
    }

    // validate email format
    if (!validateEmail(userEmail)) {
      const emailField = document.getElementById("userEmail");
      emailField.classList.add('is-invalid');
      displayError("Please enter a valid email address");
      return;
    }

    try {
      // Queries the database to find the matching user information
      const userRef = query(ref(database, 'users'), orderByChild('username'), equalTo(username));
      const snapshot = await get(userRef);

      let userFound = false;
      let userKey = null;

      snapshot.forEach(childSnapshot => {
        const userData = childSnapshot.val();

        // check if all user information matches
        if (userData.email === userEmail && userData.phoneNumber === phoneNumber) {
          userFound = true;
          userKey = childSnapshot.key;
        }
      });

      if (!userFound || !userKey) {
        displayError("Invalid information");
        return;
      }

      // sends password reset email
      await sendPasswordResetEmail(auth, userEmail);

      // display success message
      displaySuccess("Password reset email sent. If you haven't received an email, click the button again.");
      cancelButton.textContent = "Return";
    } catch (error) {
      // console.error("Error sending password reset email:", error);
      displayError("An error occurred. Please try again.");
    }
  });

  // function to display error messages
  function displayError(message) {
    errorMessage.style.color = "red";
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }

  // function to display success messages
  function displaySuccess(message) {
    errorMessage.style.color = "green";
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }

  // function to hide error messages
  function hideErrorMessage() {
    errorMessage.style.display = "none";
  }
});
