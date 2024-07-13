// handles registering a new user and redirects them to the sign-on page upon completion

import { auth, database, ref, get, orderByChild, equalTo, query, set, createUserWithEmailAndPassword, signOut } from "./initialize-firebase.js"; // Adjust the path if necessary
import { sanitize, validateEmail } from './sanitizeStrings.js';  // Import the sanitize and validateEmail functions


document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById('registerForm');
  const errorMessage = document.getElementById('register-user-error-msg');
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const phoneNumberInput = document.getElementById('phoneNumber');
  const passwordBox = document.getElementById('password');
  const passwordTextToggle = document.getElementById('passwordTextToggle');
  const userEmailInput = document.getElementById('userEmail');
  const userNameInput = document.getElementById('userName');

  // allows the user to toggle between hiding and displaying password
  passwordTextToggle.addEventListener('change', () => {
    const type = passwordTextToggle.checked ? 'text' : 'password';
    passwordBox.setAttribute('type', type);
  });

  // clean name and prevent certain characters
  const cleanName = (name) => {
    // regex replaces all characters that aren't a letter, the character '-', or "'" with blank space
    let cleanedName = name.replace(/[^A-Za-z'-]/g, ''); 
    const hyphenCount = (cleanedName.match(/-/g) || []).length; // counts the number of hyphens in cleanedName, returns empty array if count is null
    const apostropheCount = (cleanedName.match(/'/g) || []).length; // counts the number of apostrophes in cleanedName, returns empty array if count is null

    if (hyphenCount > 1) {
      let parts = cleanedName.split('-');
      cleanedName = parts[0] + '-' + parts.slice(1).join('').replace(/-/g, ''); // removes all "-" other than the first one
    }
    if (apostropheCount > 1) {
      let parts = cleanedName.split("'");
      cleanedName = parts[0] + "'" + parts.slice(1).join('').replace(/'/g, ''); // removes all "-" other than the first one
    }

    return cleanedName.trim();  // retuns name with removed whitespace
  };

  // formats user input to always have the first letter of the name capitalize while the rest is lower case
  const capitalizeFirstLetter = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // adds class to username input to mark invalid input field
  const validateNameInput = (input) => {
    input.addEventListener('input', (e) => {
      const cleanedValue = cleanName(e.target.value);
      e.target.value = cleanedValue;
      // removes class once user begins typing, assumes that the user will correct the invalid input 
      if (e.target.classList.contains('is-invalid')) {
        e.target.classList.remove('is-invalid');
        hideErrorMessage();
      }
    });

    // capitalizes the field once the user clicks away from the field
    input.addEventListener('blur', (e) => {
      const capitalizedValue = capitalizeFirstLetter(e.target.value);
      e.target.value = capitalizedValue;
    });
  };

  // adds class to phone number input to mark invalid input field and styles in (xxx) xxx-xxxx format
  const validatePhoneNumberInput = (input) => {
    input.addEventListener('input', (e) => {
      // removes input that aren't numbers, then groups the input into 3 array items stored in x.
      // after 4 characters are entered, the first 3 are place inside (), after the next 4 
      // characters are entered, a - is placed before the 7th number
      const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
      if (e.target.classList.contains('is-invalid')) {
        e.target.classList.remove('is-invalid');
        hideErrorMessage();
      }
    });
  };

  // adds class to email input to mark invalid input field
  const validateRequiredInput = (input) => {
    input.addEventListener('input', (e) => {
      if (e.target.classList.contains('is-invalid')) {
        e.target.classList.remove('is-invalid');
        hideErrorMessage();
      }
    });
  };

  validateNameInput(firstNameInput);
  validateNameInput(lastNameInput);
  validatePhoneNumberInput(phoneNumberInput);
  validateRequiredInput(userEmailInput);
  validateRequiredInput(passwordBox);
  validateRequiredInput(userNameInput);

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const firstName = sanitize(firstNameInput.value);
    const lastName = sanitize(lastNameInput.value);
    const userEmail = sanitize(userEmailInput.value, true);
    const userName = sanitize(userNameInput.value).toLowerCase();
    const password = sanitize(passwordBox.value);
    const phoneNumber = sanitize(phoneNumberInput.value.replace(/\D/g, ''));

    let valid = true;
    let specificError = ""; // Tracks specific field errors

    // check if any field is empty and mark as invalid
    if (firstName.trim() === '') {
      firstNameInput.classList.add('is-invalid');
      valid = false;
    }

    if (lastName.trim() === '') {
      lastNameInput.classList.add('is-invalid');
      valid = false;
    }

    if (userEmail.trim() === '') {
      userEmailInput.classList.add('is-invalid');
      valid = false;
    }

    if (userName.trim() === '') {
      userNameInput.classList.add('is-invalid');
      valid = false;
    }

    if (password.trim() === '') {
      passwordBox.classList.add('is-invalid');
      valid = false;
    }

    if (phoneNumber.trim() === '') {
      phoneNumberInput.classList.add('is-invalid');
      valid = false;
    }

    // if any field is empty, display the "All fields are required." message
    if (!valid) {
      displayError("All fields are required.");
      return;
    }

    // specific field validations after ensuring all fields are not empty
    const cleanedFirstName = cleanName(firstName);
    const cleanedLastName = cleanName(lastName);

    if (!cleanedFirstName) {
      specificError = "First name can only contain letters, one optional hyphen, and one optional apostrophe.";
      firstNameInput.classList.add('is-invalid');
      valid = false;
    }

    if (!cleanedLastName) {
      specificError = "Last name can only contain letters, one optional hyphen, and one optional apostrophe.";
      lastNameInput.classList.add('is-invalid');
      valid = false;
    }

    if (phoneNumber.length !== 10) {
      specificError = "Please enter a valid phone number.";
      phoneNumberInput.classList.add('is-invalid');
      valid = false;
    }

    if (!validateEmail(userEmail)) {
      specificError = "Please enter a valid email address.";
      userEmailInput.classList.add('is-invalid');
      valid = false;
    }

    if (!valid) {
      displayError(specificError);
      return;
    }

    try {
      const usersRef = query(ref(database, 'users'), orderByChild('username'), equalTo(userName)); // Check if the username already exists (case-insensitive)
      const usernameSnapshot = await get(usersRef); // returns the result of the usersRef query on the users "table" 
      const emailRef = query(ref(database, 'users'), orderByChild('email'), equalTo(userEmail)); // Check if the email already exists
      const emailSnapshot = await get(emailRef); // returns query result

      // displays error if the username already exists
      if (usernameSnapshot.exists()) {
        userNameInput.classList.add('is-invalid');
        displayError('Username already exists. Choose another username.');
        return;
      }

      // displays error if the email already exists
      if (emailSnapshot.exists()) {
        userEmailInput.classList.add('is-invalid');
        displayError('Email already tied to an existing account.');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, userEmail, password);

      // user created, wait for the authentication state to confirm
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const userId = user.uid;

          // Store additional information in the database after user is authenticated
          await set(ref(database, 'users/' + userId), {
            firstName: cleanName(firstName),
            lastName: cleanName(lastName),
            email: userEmail,
            username: userName,  // Store the normalized (lower case) username
            phoneNumber: phoneNumber
          });

          // Sign out the user after registration so that it won't redirect them from the home page
          await signOut(auth);

          alert('Registration successful! Redirecting to sign-on page.');
          window.location.href = '/sign-on.html';
        }
      });
    } catch (error) {
      if (error.code === "auth/weak-password") {
        displayError("Weak password, must have at least 6 characters.");
      } else {
        console.error('Error:', error);
        // console.log(error.code);
        displayError(error.message);
      }
    }
  });

  function displayError(message) {
    errorMessage.style.color = "red";
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  }

  function hideErrorMessage() {
    errorMessage.style.display = 'none';
  }
});