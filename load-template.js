// this script loads the header and footer into each page. may inlude more at a later date, such as an
// different header date based on whether the user is loged in or not 

document.addEventListener("DOMContentLoaded", () => {
  fetch("header.html")
    .then((response) => response.text())
    .then((data) => {
      document.querySelector(".header").innerHTML = data;
    })
    .catch((error) => console.error("Failed to load header", error));

  fetch("footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.querySelector(".footer").innerHTML = data;
    })
    .catch((error) => console.error("Failed to load footer", error));
});
