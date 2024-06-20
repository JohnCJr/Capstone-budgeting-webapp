// resets user password if the correct username, email, and phoneNumber provided.

import { database, ref, get, orderByChild, equalTo, query, update } from "./initialize-firebase.js"; // Adjust the path if necessary
import { sanitize, validateEmail } from './sanitize.js';  // Import the sanitize function

document.addEventListener("DOMContentLoaded", () => {
  const resetForm = document.getElementById("resetForm");
  const errorMessage = document.getElementById("error-msg");

  // Real-time validation and formatting for phone number input
  const phoneNumberInput = document.getElementById('phoneNumber');
  phoneNumberInput.addEventListener('input', (e) => {
    const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
  });

  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the default form submission

    // Get and sanitize user input values
    const userEmail = sanitize(document.getElementById("userEmail").value);
    const username = sanitize(document.getElementById("username").value);
    const phoneNumber = sanitize(document.getElementById("phoneNumber").value.replace(/\D/g, '')); // Remove formatting
    const newPassword = sanitize(document.getElementById("newPassword").value);

    // Validate email format
    if (!validateEmail(userEmail)) {
      displayError("Please enter a valid email address");
      return;
    }

    try {
      // Queries the database to find the matching user information
      const userRef = query(ref(database, 'users'), orderByChild('username'), equalTo(username));
      const snapshot = await get(userRef);

      let userFound = false;

      snapshot.forEach(childSnapshot => {
        const userData = childSnapshot.val();

        // Check if all user information matches
        if (userData.email === userEmail && userData.phoneNumber === phoneNumber) {
          userFound = true;
          const userKey = childSnapshot.key;

          // Update the password in the Realtime Database
          update(ref(database, 'users/' + userKey), { password: newPassword })
            .then(() => {
              // Display success message in green and start countdown
              let countdown = 3;
              errorMessage.style.color = "green";
              errorMessage.textContent = `Password reset successful. Redirecting in ${countdown} seconds...`;
              errorMessage.style.display = "flex";

              const countdownInterval = setInterval(() => {
                countdown -= 1;
                errorMessage.textContent = `Password reset successful. Redirecting in ${countdown} seconds...`;
                if (countdown === 0) {
                  clearInterval(countdownInterval);
                  window.location.href = "/sign-on.html";
                }
              }, 1000);
            })
            .catch(error => {
              console.error("Error updating password:", error);
              displayError("An error occurred. Please try again.");
            });
        }
      });

      if (!userFound) {
        // Display error message if user information does not match
        displayError("Incorrect information");
      }
    } catch (error) {
      console.error("Error querying Firebase:", error);
      displayError("An error occurred. Please try again.");
    }
  });

  // Function to display error messages
  function displayError(message) {
    errorMessage.style.color = "red";
    errorMessage.textContent = message;
    errorMessage.style.display = "flex";
  }
});