// this set of code is intended to validate a user's login attempt

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

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

    // Stores username or email and password values
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Reference to the database path containing usernames
    const usernamesRef = firebase.database().ref('usernames');

    // Function to sign in with email
    const signInWithEmail = (email) => {
      return firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          // Remove loading indicator
          document.body.removeChild(loadingIndicator);

          // Signed in
          const user = userCredential.user;
          // Store user info in local storage (or session storage)
          localStorage.setItem("user", JSON.stringify(user));

          // Redirect to user's dashboard
          window.location.href = "/dashboard.html";
        });
    };

    // Check if the input is an email
    if (username.includes('@')) {
      // Check if the email exists in Firebase Auth
      firebase.auth().fetchSignInMethodsForEmail(username)
        .then((signInMethods) => {
          if (signInMethods.length === 0) {
            // Email does not exist
            throw new Error("Email doesn't exist.");
          } else {
            // Email exists, now check the password
            return signInWithEmail(username);
          }
        })
        .catch((error) => {
          handleError(error);
        });
    } else {
      // Check if the username exists in the database
      usernamesRef.orderByValue().equalTo(username).once('value')
        .then((snapshot) => {
          if (!snapshot.exists()) {
            // Username does not exist
            throw new Error("Username doesn't exist.");
          } else {
            // Get the associated email from the snapshot
            const email = Object.keys(snapshot.val())[0];
            // Email exists, now check the password
            return signInWithEmail(email);
          }
        })
        .catch((error) => {
          handleError(error);
        });
    }

    const handleError = (error) => {
      // Remove loading indicator
      document.body.removeChild(loadingIndicator);

      // Handle Errors here.
      let errorMessageText;

      if (error.message === "Username doesn't exist." || error.message === "Email doesn't exist.") {
        errorMessageText = error.message;
      } else if (error.code === 'auth/wrong-password') {
        errorMessageText = "Invalid password.";
      } else {
        errorMessageText = error.message;
      }

      errorMessage.textContent = errorMessageText;
      errorMessage.style.display = "flex";
      errorMessage.setAttribute("role", "alert"); // For accessibility
      document.getElementById("username").value = "";
      document.getElementById("password").value = "";
    };
  });

  // Check if user is signed in
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in, store user info
      localStorage.setItem("user", JSON.stringify(user));
      // redirects to dashboard in already logged in
      window.location.href = "/dashboard.html";
    } else {
      // No user is signed in, clear user info
      localStorage.removeItem("user");
    }
  });
});