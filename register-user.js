// handles registering the user

import { auth, database, ref, get, orderByChild, equalTo, query, set, createUserWithEmailAndPassword } from "./initialize-firebase.js"; // Adjust the path if necessary
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

  const cleanName = (name) => {
    let cleanedName = name.replace(/[^A-Za-z'-]/g, '');
    const hyphenCount = (cleanedName.match(/-/g) || []).length;
    const apostropheCount = (cleanedName.match(/'/g) || []).length;

    if (hyphenCount > 1) {
      let parts = cleanedName.split('-');
      cleanedName = parts[0] + '-' + parts.slice(1).join('').replace(/-/g, '');
    }
    if (apostropheCount > 1) {
      let parts = cleanedName.split("'");
      cleanedName = parts[0] + "'" + parts.slice(1).join('').replace(/'/g, '');
    }

    return cleanedName.trim();
  };

  const capitalizeFirstLetter = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const validateNameInput = (input) => {
    input.addEventListener('input', (e) => {
      const cleanedValue = cleanName(e.target.value);
      e.target.value = cleanedValue;
      if (cleanedValue.trim() === '') {
        e.target.classList.add('is-invalid');
      } else {
        e.target.classList.remove('is-invalid');
      }
      checkAllFieldsValid();
    });

    input.addEventListener('blur', (e) => {
      const capitalizedValue = capitalizeFirstLetter(e.target.value);
      e.target.value = capitalizedValue;
    });
  };

  const validatePhoneNumberInput = (input) => {
    input.addEventListener('input', (e) => {
      const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
      if (e.target.value.replace(/\D/g, '').length !== 10) {
        e.target.classList.add('is-invalid');
      } else {
        e.target.classList.remove('is-invalid');
      }
      checkAllFieldsValid();
    });
  };

  const validateEmailInput = (input) => {
    input.addEventListener('input', (e) => {
      if (!validateEmail(e.target.value)) {
        e.target.classList.add('is-invalid');
      } else {
        e.target.classList.remove('is-invalid');
      }
      checkAllFieldsValid();
    });
  };

  const validateRequiredInput = (input) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.trim() === '') {
        e.target.classList.add('is-invalid');
      } else {
        e.target.classList.remove('is-invalid');
      }
      checkAllFieldsValid();
    });
  };

  validateNameInput(firstNameInput);
  validateNameInput(lastNameInput);
  validatePhoneNumberInput(phoneNumberInput);
  validateEmailInput(userEmailInput);
  validateRequiredInput(passwordBox);
  validateRequiredInput(userNameInput);

  function checkAllFieldsValid() {
    const allValid = [
      firstNameInput,
      lastNameInput,
      phoneNumberInput,
      userEmailInput,
      passwordBox,
      userNameInput
    ].every(input => input.value.trim() !== '' && !input.classList.contains('is-invalid'));

    if (allValid) {
      errorMessage.style.display = 'none';
    }
  }

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const firstName = sanitize(firstNameInput.value);
    const lastName = sanitize(lastNameInput.value);
    const userEmail = sanitize(userEmailInput.value, true);
    const userName = sanitize(userNameInput.value).toLowerCase();  // Normalize to lower case
    const password = sanitize(passwordBox.value);
    const phoneNumber = sanitize(phoneNumberInput.value.replace(/\D/g, ''));

    let valid = true;

    if (firstName.trim() === '') {
      firstNameInput.classList.add('is-invalid');
      valid = false;
    }

    if (lastName.trim() === '') {
      lastNameInput.classList.add('is-invalid');
      valid = false;
    }

    if (phoneNumber.length !== 10) {
      phoneNumberInput.classList.add('is-invalid');
      valid = false;
    }

    const cleanedFirstName = cleanName(firstName);
    const cleanedLastName = cleanName(lastName);

    if (!cleanedFirstName || !cleanedLastName) {
      displayError("First name and last name can only contain letters, one optional hyphen, and one optional apostrophe.");
      firstNameInput.classList.add('is-invalid');
      lastNameInput.classList.add('is-invalid');
      valid = false;
    }

    if (!validateEmail(userEmail)) {
      userEmailInput.classList.add('is-invalid');
      displayError("Please enter a valid email address.");
      valid = false;
    }

    if (password.trim() === '') {
      passwordBox.classList.add('is-invalid');
      valid = false;
    }

    if (userName.trim() === '') {
      userNameInput.classList.add('is-invalid');
      valid = false;
    }

    if (!valid) {
      displayError("All fields are required.");
      return;
    }

    try {
      // Check if the username already exists (case-insensitive)
      const usersRef = query(ref(database, 'users'), orderByChild('username'), equalTo(userName));
      const usernameSnapshot = await get(usersRef);
      const emailRef = query(ref(database, 'users'), orderByChild('email'), equalTo(userEmail));
      const emailSnapshot = await get(emailRef);

      if (usernameSnapshot.exists()) {
        userNameInput.classList.add('is-invalid');
        displayError('Username already exists. Choose another.');
        return;
      }

      if (emailSnapshot.exists()) {
        userEmailInput.classList.add('is-invalid');
        displayError('Email already exists.');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, userEmail, password);

      // User created, wait for the authentication state to confirm
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

          alert('Registration successful! Redirecting to sign-on page.');
          window.location.href = '/sign-on.html';
        }
      });
    } catch (error) {
      if (error.code === "auth/weak-password") {
        displayError("Weak password, must have at least 6 characters.");
      } else {
        console.error('Error:', error);
        console.log(error.code);
        displayError(error.message);
      }
    }
  });

  function displayError(message) {
    errorMessage.style.color = "red";
    errorMessage.textContent = message;
    errorMessage.style.display = 'flex';
  }
});