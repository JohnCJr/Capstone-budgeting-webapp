// handles registering the user

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById('registerForm');
  const errorMessage = document.getElementById('register-user-error-msg');
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const phoneNumberInput = document.getElementById('phoneNumber');

  // Function to clean and validate names in real-time
  const cleanName = (name) => {
    // Replace invalid characters with a space
    let cleanedName = name.replace(/[^A-Za-z-]/g, ' ');

    // Ensure only one hyphen is present
    const hyphenCount = (cleanedName.match(/-/g) || []).length;
    if (hyphenCount > 1) {
      let parts = cleanedName.split('-');
      cleanedName = parts[0] + '-' + parts.slice(1).join(' ').replace(/-/g, ' ');
    }

    // Trim any leading or trailing spaces
    return cleanedName.trim();
  };

  // Real-time validation for first name and last name inputs
  const validateNameInput = (input) => {
    input.addEventListener('input', (e) => {
      e.target.value = cleanName(e.target.value);
    });
  };

  // Real-time validation and formatting for phone number input
  phoneNumberInput.addEventListener('input', (e) => {
    const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
  });

  validateNameInput(firstNameInput);
  validateNameInput(lastNameInput);

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Gather user data entered by the user
    const firstName = firstNameInput.value;
    const lastName = lastNameInput.value;
    const userEmail = document.getElementById('userEmail').value;
    const userName = document.getElementById('userName').value;
    const password = document.getElementById('password').value;
    const phoneNumber = phoneNumberInput.value.replace(/\D/g, '');

    // Validate that phone number has exactly 10 digits
    if (phoneNumber.length !== 10) {
      errorMessage.textContent = "Phone number must be exactly 10 digits.";
      errorMessage.style.display = 'flex';
      return;
    }

    // Clean and validate names
    const cleanedFirstName = cleanName(firstName);
    const cleanedLastName = cleanName(lastName);

    // Display an error if names are empty after cleaning
    if (!cleanedFirstName || !cleanedLastName) {
      errorMessage.textContent = "First name and last name can only contain letters and one optional hyphen.";
      errorMessage.style.display = 'flex';
      return;
    }

    try {
      // Check if the username or email already exists in the database
      const db = firebase.database();
      const usersRef = db.ref('users');
      const usernameSnapshot = await usersRef.orderByChild('username').equalTo(userName).once('value');
      const emailSnapshot = await usersRef.orderByChild('email').equalTo(userEmail).once('value');

      if (usernameSnapshot.exists()) {
        displayError('Username already exists');
        return;
      }

      if (emailSnapshot.exists()) {
        displayError('Email already exists');
        return;
      }

      // Create the user in Firebase Authentication
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(userEmail, password);

      // User created, now store additional information
      const user = userCredential.user;
      const userId = user.uid;

      // Store additional information in the database after creating a user's userid
      await firebase.database().ref('users/' + userId).set({
        firstName: cleanedFirstName,
        lastName: cleanedLastName,
        email: userEmail,
        username: userName,
        phoneNumber: phoneNumber
      });

      // Registration successful, show confirmation message
      alert('Registration successful! Redirecting to sign-on page.');

      // Redirect to the sign-on page once successfully registered
      window.location.href = '/sign-on.html';

    } catch (error) {
      console.error('Error:', error);
      displayError(error.message);

      // Resets user input fields, may remove for convenience
      firstNameInput.value = "";
      lastNameInput.value = "";
      document.getElementById('userEmail').value = "";
      document.getElementById('userName').value = "";
      document.getElementById('password').value = "";
      phoneNumberInput.value = "";
    }
  });

  // Function to display error messages
  function displayError(message) {
    errorMessage.style.color = "red";
    errorMessage.textContent = message;
    errorMessage.style.display = 'flex';
  }
});