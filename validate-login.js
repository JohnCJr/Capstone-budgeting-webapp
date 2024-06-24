import { auth, database, ref, get, query, orderByChild, equalTo, signInWithEmailAndPassword } from "./initialize-firebase.js";
import { sanitize, validateEmail } from './sanitizeStrings.js';  // Import the sanitize function

document.addEventListener('DOMContentLoaded', () => {
  const signInForm = document.getElementById('signInForm');
  const errorMsg = document.getElementById('error-msg');
  const passwordBox = document.getElementById('password');
  const passwordTextToggle = document.getElementById('passwordTextToggle');


  // allows the user to toggle between hiding and display password
  passwordTextToggle.addEventListener('change', () => {
    const type = passwordTextToggle.checked ? 'text' : 'password';
    passwordBox.setAttribute('type', type);
  });


  signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userInput = sanitize(document.getElementById('username').value, true); // must be sanitized as a email since user can enter username or email
    const password = sanitize(document.getElementById('password').value);

    try {
      let email;

      // Assumes that email address is being entered, if not found then asssumes username is entered
      if (validateEmail(userInput)) {
        // If the input is a valid email
        email = userInput;
      } else {
        // Username looked up to assign the corresponding email
        const usersRef = ref(database, 'users');  // gets the users "table" from firebase
        const userQuery = query(usersRef, orderByChild('username'), equalTo(userInput));  // filters result from user input
        console.log(userQuery);
        const snapshot = await get(userQuery);  // funcion puases until snapshot is assigned the value of the query

        if (!snapshot.exists()) {
          displayError('Please enter a valid username/password');
          console.log("user doesn't exist");
          return;
        }

        snapshot.forEach(childSnapshot => {
          email = childSnapshot.val().email; // Get the email associated with the username
        });
      }

      // Sign in with email and password and redirects to dashboard paeg if successful
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          errorMsg.style.display = 'none';
          window.location.href = '/dashboard.html';
        })
        .catch((error) => {
          console.error("Authentication error:", error.code);
          if (error.code === 'auth/invalid-login-credentials') {
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

  function displayError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'flex';
  }
});