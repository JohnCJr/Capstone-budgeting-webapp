// money input field validation that is called by form-modal-load.js

function getFormValidationShared() {
    console.log("getFormValidationShared called");
  
      const moneyBoxes = document.querySelectorAll(".money-field");
  
      if (moneyBoxes.length === 0) {
        console.warn("No money fields found for validation");
      } else {
        console.log("Found money fields for validation:", moneyBoxes);
      }
  
      moneyBoxes.forEach(input => {
        console.log("Adding event listeners to moneyBoxes");

        // replaces non numberical values with "" and assures that there are always two digits to the right of the decimal point 
        // while also remvoing extra zeros from the left of the decimal point 
        input.addEventListener("input", (e) => {
          console.log("Input event detected");
          let value = e.target.value.replace(/[^\d.]/g, '');
          console.log("Filtered value:", value);
  
          const decimalIndex = value.indexOf('.');
          if (decimalIndex !== -1) {
            value = value.slice(0, decimalIndex + 1) + value.slice(decimalIndex + 1).replace(/\./g, '').slice(0, 2);
          }
          e.target.value = value;
        });


        // adjusts format after user clicks away
        input.addEventListener('blur', function () {
          console.log("Blur event detected");
          let value = this.value;
          value = value.replace(/^0+(?=\d)/, '');
  
          if (value) {
            if (value.indexOf(".") == 0) {
              value = "0" + value;
            }
            if (!value.includes('.')) {
              value += '.00';
            } else if (value.split('.')[1].length === 1) {
              value += '0';
            } else if (value.split('.')[1].length === 0) {
              value += '00';
            }
          }
          console.log("Formatted value on blur:", value);
          this.value = value;
        });
      });
  }
  
  window.getFormValidationShared = getFormValidationShared;