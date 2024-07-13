function goHome() {
    window.location.href = 'index.html';
}

// gathers all input fileds in the budgeting tips page and resticts the user input to
// only numbers
document.addEventListener("DOMContentLoaded", () => {

    const numberBoxes = document.querySelectorAll(".number-field");

    numberBoxes.forEach(input => {
      input.addEventListener("input", (e) => {
        // remove all non-numeric characters
        let value = e.target.value.replace(/\D/g, '');
        e.target.value = value;
      });
    });
    
    window.getFormValidationShared();

});