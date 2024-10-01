// gathers all the functions that will be used for the other scripts, which will then import this script

import {initializeApp} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {getDatabase, ref, get, orderByChild, equalTo, query, update, set, remove, onValue, push, onChildAdded, onChildChanged, onChildRemoved} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";


const firebaseConfig = {

  apiKey: "AIzaSyBAnnErj-U6sjJYVS7GXYnitiDqM3a2wo4",

  authDomain: "dummy-2540c.firebaseapp.com",

  databaseURL: "https://dummy-2540c-default-rtdb.firebaseio.com",

  projectId: "dummy-2540c",

  storageBucket: "dummy-2540c.appspot.com",

  messagingSenderId: "951090433511",

  appId: "1:951090433511:web:5fd26390988ca95a794142",

  measurementId: "G-560PNDZNTR"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// console.log("Firebase app initialized");

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);
// console.log("Firebase initialized and database connected");

// Initialize Firebase Auth
const auth = getAuth(app);
onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userId', user.uid);
    // console.log("UserId set successfully initialized!");

     // gets the username from the database, sets default to user if not foound
     const userRef = ref(database, 'users/' + user.uid);
     get(userRef).then((snapshot) => {
       if (snapshot.exists()) {
         const userData = snapshot.val();
         localStorage.setItem('username', userData.username || 'user');
       } else {
         localStorage.setItem('username', 'user');
       }

       // updates the welcome message if on the dashboard page and logged in
      if (window.location.pathname.includes("dashboard.html")) {
        const welcomeTitle = document.getElementById("welcome-msg");
        const username = localStorage.getItem("username");
        welcomeTitle.innerHTML = `Welcome, ${username}!`;
      }
     }).catch((error) => {
      //  console.error("Error fetching user data: ", error);
       localStorage.setItem('username', 'user');
      
       // updates the welcome message in case of error if on the dashboard page
      if (window.location.pathname.includes("dashboard.html")) {
        const welcomeTitle = document.getElementById("welcome-msg");
        welcomeTitle.innerHTML = `Welcome, user!`;
      }
     });
  } else {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.setItem('userId', '0');
    localStorage.setItem('username', 'user'); //defaults to user as username
    // console.log("Firebase failed to connect to user data!");

    // Update the welcome message if on the dashboard page
    if (window.location.pathname.includes("dashboard.html")) {
      const welcomeTitle = document.getElementById("welcome-msg");
      welcomeTitle.innerHTML = `Welcome, user!`;
    }
  }
});

export {getAuth, auth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, getDatabase, ref, get, orderByChild, equalTo, query, update, set, remove, onValue, push, database, signOut, sendPasswordResetEmail, onChildAdded, onChildChanged, onChildRemoved};