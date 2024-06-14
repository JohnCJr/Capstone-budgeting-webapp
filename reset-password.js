// script must be tested with databas eto make sure that it works as intended.

document.addEventListener("DOMContentLoaded", () => {
    const signInForm = document.getElementById("signInForm");
    const errorMessage = document.getElementById("error-msg");

    // Real-time validation and formatting for phone number input
    const phoneNumberInput = document.getElementById('phoneNumber');
    phoneNumberInput.addEventListener('input', (e) => {
        const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });

    signInForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent the default form submission

        // Get user input values
        const username = document.getElementById("username").value;
        const userEmail = document.getElementById("userEmail").value;
        const phoneNumber = document.getElementById("phoneNumber").value.replace(/\D/g, ''); // Remove formatting so the () and - won't be submitted to the database
        const newPassword = document.getElementById("newPassword").value;

        // Create the data object to be sent to the backend
        const data = {
            username: username,
            email: userEmail,
            phoneNumber: phoneNumber,
            newPassword: newPassword
        };

        // Send the data to the backend using fetch
        fetch("/api/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        .then((response) => response.json()) // Convert response to JavaScript object
        .then((data) => {
            if (data.success) {
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
            } else {
                // Display error message
                errorMessage.style.color = "red";
                errorMessage.textContent = data.message;
                errorMessage.style.display = "flex";
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            errorMessage.style.color = "red";
            errorMessage.textContent = "An error occurred. Please try again.";
            errorMessage.style.display = "flex";
        });
    });
});