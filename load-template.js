// this script loads the header and footer into each page. may inlcude more at a later date, such as an
// different header data based on whether the user is loged in or not 

// for testing purposes, the navbar will cotian th user icon to acess the dashboard even when not logged in,'
// navbar will display sign out when user is signed in and vice versa.



document.addEventListener("DOMContentLoaded", () => {
  let navbarHTML = '';
  let footerHTML = `
    &#169 2023-2024 SavyStudents
    <br>SavyStudents.com
    <br>123 First St.
    <br>Designed by Cajoe Bits Team
  `;

  // loads default navbar and footer to pages
  const loadDefaultNavbarFooter = () => {
    navbarHTML = `
      <nav class="navbar navbar-expand-md bg-body-tertiary">
        <div class="container-fluid px-lg-5 px-md-2 px-0 d-flex py-1 justify-content-between align-items-center">
          <a class="navbar-brand fs-1 d-flex align-items-center ms-2" href="home.html">
            <img src="images/logo.jpg" alt="SavyStudent brand logo" />
            SavyStudents
          </a>
          <div class="d-flex align-items-center ms-auto order-md-2">
            <button class="navbar-toggler d-md-none me-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <button class="btn nav-link btn-outline-info navbar-btn p-0 ms-2 me-3" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">
              <img src="images/profile_icon.svg" width="30px" alt="" />
            </button>
          </div>
          <div class="collapse navbar-collapse mx-md-0 order-md-1" id="navbarSupportedContent">
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0 ps-sm-2 fs-5">
              <li class="nav-item"><a class="nav-link" aria-current="page" href="home.html">Home</a></li>
              <li class="nav-item"><a class="nav-link" aria-current="page" href="about-us.html">About Us</a></li>
              <li class="nav-item"><a class="nav-link" aria-current="page" href="budgeting-tips.html">Budgeting Tips</a></li>
              <li class="nav-item"><a class="nav-link" href="sign-on.html">Sign In</a></li>
            </ul>
          </div>
        </div>
      </nav>
    `;
    document.querySelector(".header").innerHTML = navbarHTML;
    document.querySelector(".footer").innerHTML = footerHTML;
  };

  const loadLoggedInNavbar = () => {
    navbarHTML = `
      <nav class="navbar navbar-expand-md bg-body-tertiary">
        <div class="container-fluid px-lg-5 px-md-2 px-0 d-flex py-1 justify-content-between align-items-center">
          <a class="navbar-brand fs-1 d-flex align-items-center ms-2" href="home.html">
            <img src="images/logo.jpg" alt="SavyStudent brand logo" />
            SavyStudents
          </a>
          <div class="d-flex align-items-center ms-auto order-md-2">
            <button class="navbar-toggler d-md-none me-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <button class="btn nav-link btn-outline-info navbar-btn p-0 ms-2 me-3" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">
              <img src="images/profile_icon.svg" width="30px" alt="" />
            </button>
          </div>
          <div class="collapse navbar-collapse mx-md-0 order-md-1" id="navbarSupportedContent">
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0 ps-sm-2 fs-5">
              <li class="nav-item"><a class="nav-link" aria-current="page" href="home.html">Home</a></li>
              <li class="nav-item"><a class="nav-link" aria-current="page" href="about-us.html">About Us</a></li>
              <li class="nav-item"><a class="nav-link" aria-current="page" href="budgeting-tips.html">Budgeting Tips</a></li>
              <li class="nav-item"><a class="nav-link" aria-current="page" href="dashboard.html">Dashboard</a></li>
              <li class="nav-item"><a class="nav-link" aria-current="page" href="sign-out.html">Sign Out</a></li>
            </ul>
          </div>
        </div>
      </nav>
    `;
    document.querySelector(".header").innerHTML = navbarHTML;
    document.querySelector(".footer").innerHTML = footerHTML;
  };

  // Check if user is logged in and displays the correct navbar
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn === 'true') {
    loadLoggedInNavbar();
  } else {
    loadDefaultNavbarFooter();
  }
});