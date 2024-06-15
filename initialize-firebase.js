// Establsihes a connection to the firebase script, display error to console if fails to do so.
// Will set a default value to bool isLoggedIn and userID
// isloggedIn will be used to display the appropriate navbar 

try {
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      databaseURL: "YOUR_DATABASE_URL",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
  
      // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // Check authentication state and store user info
  const auth = firebase.auth();
  auth.onAuthStateChanged((user) => {
    if (user) {
      // sets variables when user is logged in
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', user.uid);
    } else {
      // sets the default values if Firebase initialization succeeds but not logged in yet
      localStorage.setItem('isLoggedIn', 'false');
      localStorage.setItem('userId', '0');
    }
  });
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // sets the default values if Firebase initialization fails so pages can still load nabar
  localStorage.setItem('isLoggedIn', 'false');
  localStorage.setItem('userId', '0');
}