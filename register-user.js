// document.addEventListener("DOMContentLoaded", () => {
//     const registerForm = document.getElementById('registerForm');
//     const errorMessage = document.getElementById('register-user-error-msg');

//     // Function to validate and clean names
//     const cleanName = (name) => {
//         // Replace invalid characters with a space
//         let cleanedName = name.replace(/[^A-Za-z-]/g, ' ');

//         // Ensure only one hyphen is present
//         const hyphenCount = (cleanedName.match(/-/g) || []).length;
//         if (hyphenCount > 1) {
//             let parts = cleanedName.split('-');
//             cleanedName = parts[0] + '-' + parts.slice(1).join(' ').replace(/-/g, ' ');
//         }

//         // Trim any leading or trailing spaces
//         return cleanedName.trim();
//     };

//     registerForm.addEventListener('submit', (event) => {
//         event.preventDefault(); 

//         // Gather user data entered by the user
//         let firstName = document.getElementById('firstName').value;
//         let lastName = document.getElementById('lastName').value;
//         const userEmail = document.getElementById('userEmail').value;
//         const userName = document.getElementById('userName').value;
//         const password = document.getElementById('password').value;
//         const phoneNumber = document.getElementById('phoneNumber').value;

//         // Clean and validate names
//         firstName = cleanName(firstName);
//         lastName = cleanName(lastName);

//         // Display an error if names are empty after cleaning
//         if (!firstName || !lastName) {
//             errorMessage.textContent = "First name and last name can only contain letters and one optional hyphen.";
//             errorMessage.style.display = 'flex';
//             return;
//         }

//         // Update the input fields with cleaned values (optional)
//         document.getElementById('firstName').value = firstName;
//         document.getElementById('lastName').value = lastName;

//         // Create the data object from user input to be sent to the back-end
//         const data = {
//             firstName: firstName,
//             lastName: lastName,
//             email: userEmail,
//             username: userName,
//             password: password,
//             phoneNumber: phoneNumber
//         };

//         // Send the data to the backend using fetch, register is a placeholder name
//         fetch('/api/register', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(data)
//         })
//         .then(response => response.json())
//         .then(result => {
//             if (result.success) {
//                 // Redirect to the sign-on page once successfully registered
//                 window.location.href = '/sign-on.html';
//             } else {
//                 // Display an error message
//                 errorMessage.textContent = result.message;
//                 errorMessage.style.display = 'flex';

//                 // Resets user input fields, may need to change
//                 document.getElementById('firstName').value = "";
//                 document.getElementById('lastName').value = "";
//                 document.getElementById('userEmail').value = "";
//                 document.getElementById('userName').value = "";
//                 document.getElementById('password').value = "";
//                 document.getElementById('phoneNumber').value = "";

//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             errorMessage.textContent = 'An error occurred. Please try again.';
//             errorMessage.style.display = 'flex';

//             // Resets user input fields, may need to change
//             document.getElementById('firstName').value = "";
//             document.getElementById('lastName').value = "";
//             document.getElementById('userEmail').value = "";
//             document.getElementById('userName').value = "";
//             document.getElementById('password').value = "";
//             document.getElementById('phoneNumber').value = "";

//         });
//     });

//     // Format phone number input
//     document.getElementById('phoneNumber').addEventListener('input', function (e) {
//         const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
//         e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
//     });
// });

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

    registerForm.addEventListener('submit', (event) => {
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

        // Create the data object from user input to be sent to the back-end
        const data = {
            firstName: cleanedFirstName,
            lastName: cleanedLastName,
            email: userEmail,
            username: userName,
            password: password,
            phoneNumber: phoneNumber
        };

        // Send the data to the backend using fetch, register is a placeholder name
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Redirect to the sign-on page once successfully registered
                window.location.href = '/sign-on.html';
            } else {
                // Display an error message
                errorMessage.textContent = result.message;
                errorMessage.style.display = 'flex';

                // Resets user input fields, may remove
                firstNameInput.value = "";
                lastNameInput.value = "";
                document.getElementById('userEmail').value = "";
                document.getElementById('userName').value = "";
                document.getElementById('password').value = "";
                phoneNumberInput.value = "";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.style.display = 'flex';

            // Resets user input fields, may remove
            firstNameInput.value = "";
            lastNameInput.value = "";
            document.getElementById('userEmail').value = "";
            document.getElementById('userName').value = "";
            document.getElementById('password').value = "";
            phoneNumberInput.value = "";
        });
    });
});