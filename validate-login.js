// this set of code is intended to validate a user's login attempt

document.addEventListener('DOMContentLoaded', () => {
  // Get references to form elements
  const signInForm = document.getElementById('signInForm');
  const errorMsg = document.getElementById('error-msg');

  // Handle form submission
  signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      // Check if the username exists in the database
      const database = firebase.database();
      const userRef = database.ref(`users/${username}`);
      const snapshot = await userRef.once('value');

      if (!snapshot.exists()) {
        displayError('username doesn\'t exist');
        return;
      }

      // If username exists, attempt to sign in with email and password
      const auth = firebase.auth();
      const email = snapshot.val().email;

      auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          // Signed in successfully
          errorMsg.style.display = 'none';
          // Redirect to another page or perform any other actions on successful login
          window.location.href = '/dashboard'; // example redirect
        })
        .catch((error) => {
          // Handle authentication errors
          if (error.code === 'auth/wrong-password') {
            displayError('username and password don\'t match');
          } else {
            displayError('An issue occurred, please try again');
          }
        });
    } catch (error) {
      displayError('An issue occurred, please try again');
    }
  });

  // Function to display error messages
  function displayError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'flex';
  }
});