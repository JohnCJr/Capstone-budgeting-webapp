// resets user password if the correct username, email, and phoneNumber provided.

document.addEventListener("DOMContentLoaded", () => {
    const resetForm = document.getElementById("resetForm");
    const errorMessage = document.getElementById("error-msg");
  
    // Real-time validation and formatting for phone number input
    const phoneNumberInput = document.getElementById('phoneNumber');
    phoneNumberInput.addEventListener('input', (e) => {
      const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
  
    resetForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Prevent the default form submission
  
      // Get user input values
      const username = document.getElementById("username").value;
      const userEmail = document.getElementById("userEmail").value;
      const phoneNumber = document.getElementById("phoneNumber").value.replace(/\D/g, ''); // Remove formatting so the () and - won't be submitted to the database
      const newPassword = document.getElementById("newPassword").value;
  
      // Queries the database to find the matching user information
      const database = firebase.database();
      let userFound = false;
  
      database.ref('users').orderByChild('username').equalTo(username).once('value', snapshot => {
        snapshot.forEach(childSnapshot => {
          const userData = childSnapshot.val();

          // finds the key associated with the user to be used to reset their password
          if (userData.email === userEmail && userData.phoneNumber === phoneNumber) {
            userFound = true;
            const userKey = childSnapshot.key;
  
            // Update the password in the Realtime Database
            database.ref('users/' + userKey).update({ password: newPassword })
              .then(() => {
                // Display success message in green and start countdown
                let countdown = 3;
                errorMessage.style.color = "green";
                errorMessage.textContent = `Password reset successful. Redirecting in ${countdown} seconds...`;
                errorMessage.style.display = "flex";
  
                const countdownInterval = setInterval(() => {
                  countdown -= 1;
                  errorMessage.textContent = `Password reset successful. Redirecting in ${countdown} seconds...`;
                  if (countdown === 0) {
                    clearInterval(countdownInterval);
                    window.location.href = "/sign-on.html";
                  }
                }, 1000);
              })
              .catch(error => {
                console.error("Error updating password:", error);
                errorMessage.style.color = "red";
                errorMessage.textContent = "An error occurred. Please try again.";
                errorMessage.style.display = "flex";
              });
          }
        });
  
        if (!userFound) {
          // Display error message if user information does not match
          errorMessage.style.color = "red";
          errorMessage.textContent = "User information wasn't found.";
          errorMessage.style.display = "flex";
        }
      }).catch(error => {
        console.error("Error querying Firebase:", error);
        errorMessage.style.color = "red";
        errorMessage.textContent = "An error occurred. Please try again.";
        errorMessage.style.display = "flex";
      });
    });
  });