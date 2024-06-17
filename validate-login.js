import { auth, database, ref, get, orderByChild, equalTo, query, signInWithEmailAndPassword } from "./initialize-firebase.js"; // Adjust the path if necessary

document.addEventListener('DOMContentLoaded', () => {
  const signInForm = document.getElementById('signInForm');
  const errorMsg = document.getElementById('error-msg');

  signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userInput = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      let email;

      if (userInput.includes('@')) {
        // If the input contains "@", assume it's an email will implment at a later date
        email = userInput;
      } else {
        // Otherwise, assume it's a username and look up the corresponding email
        const usersRef = ref(database, 'users');
        const userQuery = query(usersRef, orderByChild('username'), equalTo(userInput));
        const snapshot = await get(userQuery);

        if (!snapshot.exists()) {
          displayError('Username doesn\'t exist');
          return;
        }

        snapshot.forEach(childSnapshot => {
          email = childSnapshot.val().email; // Get the email associated with the username
        });
      }

      // Sign in with email and password
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          errorMsg.style.display = 'none';
          window.location.href = '/dashboard';
        })
        .catch((error) => {
          console.error("Authentication error:", error.code);
          if (error.code === 'auth/wrong-password') {
            displayError('Username/Email and password don\'t match');
          } else {
            displayError('An issue occurred, please try again');
          }
        });
    } catch (error) {
      console.error("Error occurred during submission:", error);
      displayError('An issue occurred, please try again');
    }
  });

  function displayError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'flex';
  }
});