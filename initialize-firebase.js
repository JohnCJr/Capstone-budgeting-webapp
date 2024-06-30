import {initializeApp} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {getDatabase, ref, get, orderByChild, equalTo, query, update, set, remove, onValue, push, onChildAdded, onChildChanged, onChildRemoved} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// const firebaseConfig = {

//   apiKey: "AIzaSyBUg93vtK4elbinmaFL7Hr8nOSBFcc5btY",

//   authDomain: "savvystudent-64ef5.firebaseapp.com",

//   databaseURL: "https://savvystudent-64ef5-default-rtdb.firebaseio.com",

//   projectId: "savvystudent-64ef5",

//   storageBucket: "savvystudent-64ef5.appspot.com",

//   messagingSenderId: "622607412269",

//   appId: "1:622607412269:web:91a2ec46fbabd6428e5ca4"

// };

  const firebaseConfig = {
    apiKey: "AIzaSyDGkE-fvkAq-ZIKj_BUQeeXH2ToSPIV-p0",

    authDomain: "dummy-2540c.firebaseapp.com",
  
    projectId: "dummy-2540c",
  
    storageBucket: "dummy-2540c.appspot.com",
  
    messagingSenderId: "951090433511",
  
    appId: "1:951090433511:web:5fd26390988ca95a794142",
  
    measurementId: "G-560PNDZNTR"
  
  }

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase app initialized");

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);
console.log("Firebase initialized and database connected");

// Initialize Firebase Auth
const auth = getAuth(app);
onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userId', user.uid);
    console.log("UserId set successfully initialized!");
  } else {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.setItem('userId', '0');
    console.log("Firebase failed to connect to user data!");
  }
});

export {getAuth, auth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, getDatabase, ref, get, orderByChild, equalTo, query, update, set, remove, onValue, push, database, signOut, sendPasswordResetEmail, onChildAdded, onChildChanged, onChildRemoved};