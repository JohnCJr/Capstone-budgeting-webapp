// Establsihes a connection to the firebase script, display error to console if fails to do so.
// Will set a default value to bool isLoggedIn and userID
// isloggedIn will be used to display the appropriate navbar 

try {
    const firebaseConfig = {
      apiKey: "AIzaSyBUg93vtK4elbinmaFL7Hr8nOSBFcc5btY",
      authDomain: "savvystudent-64ef5.firebaseapp.com",
      databaseURL: "https://savvystudent-64ef5-default-rtdb.firebaseio.com",
      projectId: "savvystudent-64ef5",
      storageBucket: "savvystudent-64ef5.appspot.com",
      messagingSenderId: "622607412269",
      appId: "1:622607412269:web:91a2ec46fbabd6428e5ca4"
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