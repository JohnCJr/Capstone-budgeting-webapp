// Establsihes a connection to the firebase script, display erro to console if fails to do so 

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
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }