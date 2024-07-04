import { auth, database, ref, get, query, orderByChild, equalTo, signInWithEmailAndPassword } from "./initialize-firebase.js";
import { sanitize, validateEmail } from './sanitizeStrings.js';  // Import the sanitize function

document.addEventListener('DOMContentLoaded', () => {
  const signInForm = document.getElementById('signInForm');
  const errorMsg = document.getElementById('error-msg');
  const passwordBox = document.getElementById('password');
  const passwordTextToggle = document.getElementById('passwordTextToggle');

  // Allows the user to toggle between hiding and displaying the password
  passwordTextToggle.addEventListener('change', () => {
    const type = passwordTextToggle.checked ? 'text' : 'password';
    passwordBox.setAttribute('type', type);
  });

  signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    const userInput = sanitize(usernameField.value, true); // Must be sanitized as an email since the user can enter username or email
    const password = sanitize(passwordField.value);

    // Check if any fields are empty
    if (!userInput || !password) {
      if (!userInput) {
        usernameField.classList.add('is-invalid');
      }
      if (!password) {
        passwordField.classList.add('is-invalid');
      }
      displayError('All fields are required');
      return;
    }

    try {
      let email;

      // Assumes that email address is being entered, if not found then assumes username is entered
      if (validateEmail(userInput)) {
        // If the input is a valid email
        email = userInput;
      } else {
        // Username looked up to assign the corresponding email
        const usersRef = ref(database, 'users');  // Gets the users "table" from Firebase
        const userQuery = query(usersRef, orderByChild('username'), equalTo(userInput));  // Filters result from user input
        const snapshot = await get(userQuery);  // Function pauses until snapshot is assigned the value of the query

        if (!snapshot.exists()) {
          displayError('Please enter a valid username/password');
          console.log("User doesn't exist");
          return;
        }

        snapshot.forEach(childSnapshot => {
          email = childSnapshot.val().email; // Get the email associated with the username
        });
      }

      // Sign in with email and password and redirects to dashboard page if successful
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          errorMsg.style.display = 'none';
          window.location.href = '/dashboard.html';
        })
        .catch((error) => {
          console.error("Authentication error:", error.code);
          if (error.code === 'auth/wrong-password' || error.code === 'auth/internal-error'|| error.code === 'auth/invalid-login-credentials') {
            displayError('Credentials don\'t match. Please try again.');
          } else if (error.code === "auth/too-many-requests") {
            displayError('Too many failed attempts. Please try again later.');
          } else {
            displayError('An issue occurred, please try again.');
          }
        });
    } catch (error) {
      console.error("Error occurred during submission:", error);
      displayError('An issue occurred, please try again.');
    }
  });

  // Function to display error messages
  function displayError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'flex';
  }

  // Function to remove is-invalid class and hide error message when user starts typing
  document.querySelectorAll('#signInForm input').forEach(input => {
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        input.classList.remove('is-invalid');
        errorMsg.style.display = 'none';
      }
    });
  });

});