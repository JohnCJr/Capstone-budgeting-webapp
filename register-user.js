// handles registering the user

import { auth, database, ref, get, orderByChild, equalTo, query, set, createUserWithEmailAndPassword } from "./initialize-firebase.js"; // Adjust the path if necessary

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById('registerForm');
  const errorMessage = document.getElementById('register-user-error-msg');
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const phoneNumberInput = document.getElementById('phoneNumber');

  const cleanName = (name) => {
    let cleanedName = name.replace(/[^A-Za-z-]/g, ' ');
    const hyphenCount = (cleanedName.match(/-/g) || []).length;
    if (hyphenCount > 1) {
      let parts = cleanedName.split('-');
      cleanedName = parts[0] + '-' + parts.slice(1).join(' ').replace(/-/g, ' ');
    }
    return cleanedName.trim();
  };

  const validateNameInput = (input) => {
    input.addEventListener('input', (e) => {
      e.target.value = cleanName(e.target.value);
    });
  };

  phoneNumberInput.addEventListener('input', (e) => {
    const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
  });

  validateNameInput(firstNameInput);
  validateNameInput(lastNameInput);

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const firstName = firstNameInput.value;
    const lastName = lastNameInput.value;
    const userEmail = document.getElementById('userEmail').value;
    const userName = document.getElementById('userName').value;
    const password = document.getElementById('password').value;
    const phoneNumber = phoneNumberInput.value.replace(/\D/g, '');

    if (phoneNumber.length !== 10) {
      displayError("Phone number must be exactly 10 digits.");
      return;
    }

    const cleanedFirstName = cleanName(firstName);
    const cleanedLastName = cleanName(lastName);

    if (!cleanedFirstName || !cleanedLastName) {
      displayError("First name and last name can only contain letters and one optional hyphen.");
      return;
    }

    try {
      const usersRef = query(ref(database, 'users'), orderByChild('username'), equalTo(userName));
      const usernameSnapshot = await get(usersRef);
      const emailRef = query(ref(database, 'users'), orderByChild('email'), equalTo(userEmail));
      const emailSnapshot = await get(emailRef);

      if (usernameSnapshot.exists()) {
        displayError('Username already exists');
        return;
      }

      if (emailSnapshot.exists()) {
        displayError('Email already exists');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, userEmail, password);

      // User created, wait for the authentication state to confirm
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const userId = user.uid;

          // Store additional information in the database after user is authenticated
          await set(ref(database, 'users/' + userId), {
            firstName: cleanedFirstName,
            lastName: cleanedLastName,
            email: userEmail,
            username: userName,
            phoneNumber: phoneNumber
          });

          alert('Registration successful! Redirecting to sign-on page.');
          window.location.href = '/sign-on.html';
        }
      });
    } catch (error) {
      if (error.code === "auth/weak-password") {
        displayError("weak password, must have at least 6 characters");
      } else {
        console.error('Error:', error);
        console.log(error.code);
        displayError(error.message);

      }

      
      // commented out for conveneince
      // firstNameInput.value = "";
      // lastNameInput.value = "";
      // document.getElementById('userEmail').value = "";
      // document.getElementById('userName').value = "";
      // document.getElementById('password').value = "";
      // phoneNumberInput.value = "";
    }
  });

  function displayError(message) {
    errorMessage.style.color = "red";
    errorMessage.textContent = message;
    errorMessage.style.display = 'flex';
  }
});