// money input field validation that is called by form-modal-load.js

function getFormValidationShared() {
    // console.log("getFormValidationShared called");
  
      const moneyBoxes = document.querySelectorAll(".money-field");
 
      moneyBoxes.forEach(input => {

        // replaces non numberical values with "" and assures that there are always two digits to the right of the decimal point 
        // while also remvoing extra zeros from the left of the decimal point 
        input.addEventListener("input", (e) => {
          let value = e.target.value.replace(/[^\d.]/g, '');

          const decimalIndex = value.indexOf('.');
          if (decimalIndex !== -1) {
            value = value.slice(0, decimalIndex + 1) + value.slice(decimalIndex + 1).replace(/\./g, '').slice(0, 2);
          }
          e.target.value = value;
        });


        // adjusts format after user clicks away
        input.addEventListener('blur', function () {
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
          this.value = value;
        });
      });
  }
  
  window.getFormValidationShared = getFormValidationShared;