// money input field validation
function getFormValidation() {

    // stores all text boxes that accept a dollar amount
    const moneyBoxes = document.querySelectorAll(".money-field");

    // filters/removes invalid key inputs for text boxes that need a dollar amount as a user input
    moneyBoxes.forEach(input => {
        input.addEventListener("input", (e) => {
            let value = e.target.value.replace(/[^\d.]/g, ''); // Remove all characters that aren't numbers except for '.'
            const decimalIndex = value.indexOf('.');  // return -1 if no "." is found
            if (decimalIndex !== -1) {
                // takes numbers to the left side of decimal and adds it to the right side which is limited to 2 numbers and removes any extra "." 
                value = value.slice(0, decimalIndex + 1) + value.slice(decimalIndex + 1).replace(/\./g, '').slice(0, 2);
            }
            e.target.value = value;
        });

        // when the user clicks away from the input box, it will automatically fill in any missing decimal point and zeroes.
        input.addEventListener('blur', function () {
            // gets the current value being entered
            let value = this.value;

            // regex code to remove any trailing zeroes from the left side if there isn't a non-zero number at the left
            value = value.replace(/^0+(?=\d)/, '');

            // true if any number is entered
            if (value) {
                if (value.indexOf(".") == 0) {
                    value = "0" + value; // adds a zero if no number placed before the "."
                }
                if (!value.includes('.')) {
                    value += '.00'; // Add decimal and two zeroes if missing
                } else if (value.split('.')[1].length === 1) {
                    value += '0'; // Add one zero if only one decimal place
                } else if (value.split('.')[1].length === 0) {
                    value += '00'; // Add two zeroes if just decimal is entered, which is very rare
                }
            }
            this.value = value;
        });
    });
}

// getFormValidation function to be called after the script is loaded to prevent issues with functionality
window.getFormValidation = getFormValidation;