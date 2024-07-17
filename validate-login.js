// handles processing user login attempts

import { auth, database, ref, get, query, orderByChild, equalTo, signInWithEmailAndPassword } from "./initialize-firebase.js";
import { sanitize, validateEmail } from './sanitizeStrings.js';  // Import the sanitize function

document.addEventListener('DOMContentLoaded', () => {
  const signInForm = document.getElementById('signInForm');
  const errorMsg = document.getElementById('error-msg');
  const passwordBox = document.getElementById('password');
  const passwordTextToggle = document.getElementById('passwordTextToggle');

  // allows the user to toggle between hiding and displaying the password
  passwordTextToggle.addEventListener('change', () => {
    const type = passwordTextToggle.checked ? 'text' : 'password';
    passwordBox.setAttribute('type', type);
  });

  signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    const userInput = sanitize(usernameField.value, true); // must be sanitized as an email since the user can enter username or email
    const password = sanitize(passwordField.value);

    // check if any fields are empty
    if (!userInput || !password) {
      if (!userInput) {
        usernameField.classList.add('is-invalid');
      }
      if (!password) {
        passwordField.classList.add('is-invalid');
      }
      displayError('All fields are required', usernameField, passwordField);
      return;
    }

    try {
      let email;

      // assumes that email address is being entered, if not found then assumes username is entered
      if (validateEmail(userInput)) {
        // If the input is a valid email
        email = userInput;
      } else {
        // username looked up to assign the corresponding email
        const usersRef = ref(database, 'users');  // gets the users "table" from Firebase
        const userQuery = query(usersRef, orderByChild('username'), equalTo(userInput));  // filters result from user input
        const snapshot = await get(userQuery);  // function pauses until snapshot is assigned the value of the query

        if (!snapshot.exists()) {
          displayError('Please enter a valid username and password', usernameField, passwordField);
          // console.log("User doesn't exist");
          return;
        }

        snapshot.forEach(childSnapshot => {
          email = childSnapshot.val().email; // get the email associated with the username
        });
      }

      // sign in with email and password and redirects to dashboard page if successful
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          errorMsg.style.display = 'none';
          window.location.href = '/dashboard.html';
        })
        .catch((error) => {
          // console.error("Authentication error:", error.code);
          if (error.code === 'auth/wrong-password' || error.code === 'auth/internal-error'|| error.code === 'auth/invalid-login-credentials') {
            displayError('Credentials don\'t match. Please try again.', usernameField, passwordField);
          } else if (error.code === "auth/too-many-requests") {
            displayError('Too many failed attempts. Please try again later.');
          } else {
            displayError('An issue occurred, please try again.', usernameField, passwordField);
          }
        });
    } catch (error) {
      // console.error("Error occurred during submission:", error);
      displayError('An issue occurred, please try again.', usernameField, passwordField);
    }
  });

  // displays error messages and adds is-invalid class to fields
  function displayError(message, ...invalidFields) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    invalidFields.forEach(field => {
      if (field) {
        field.classList.add('is-invalid');
      }
    });
  }

  // removes the is-invalid class and hide error message when user starts typing
  document.querySelectorAll('#signInForm input').forEach(input => {
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        input.classList.remove('is-invalid');
        errorMsg.style.display = 'none';
      }
    });
  });

});