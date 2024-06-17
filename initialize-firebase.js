import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword  } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, get, orderByChild, equalTo, query, update, set, remove, onValue, push} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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

export {getAuth, auth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, getDatabase, ref, get, orderByChild, equalTo, query, update, set, remove, onValue, push, database};