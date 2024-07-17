// this script loads the appropriate header and footer into each page based on whether a user is logged in

import { auth, signOut } from "./initialize-firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  let navbarHTML = '';
  let footerHTML = `
    &#169 2023-2024 SavvyStudents
    <br>SavvyStudents.com
    <br>123 First St.
    <br>Designed by Cajoe Bits Team
  `;

  // loads default navbar and footer to pages
  const loadDefaultNavbarFooter = () => {
    navbarHTML = `
      <nav class="navbar navbar-expand-md bg-body-tertiary">
        <div class="container-fluid px-lg-5 px-md-2 px-0 d-flex py-1 justify-content-between align-items-center">
          <a class="navbar-brand fs-1 d-flex align-items-center ms-2" href="index.html">
            <img id='navabar-logo' src="images/Cajoe-bits-logo.png" alt="SavvyStudent brand logo" />
            SavvyStudents
          </a>
          <div class="d-flex align-items-center ms-auto order-md-2">
            <button class="navbar-toggler d-md-none me-3" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
          </div>
          <div class="collapse navbar-collapse mx-md-0 order-md-1" id="navbarSupportedContent">
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0 ps-sm-2 fs-5">
              <li class="nav-item"><a class="nav-link" aria-current="page" href="index.html">Home</a></li>
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
    const navbarHTML = `
      <nav class="navbar navbar-expand-md bg-body-tertiary">
        <div class="container-fluid px-lg-5 px-md-2 px-0 d-flex py-1 justify-content-between align-items-center">
          <a class="navbar-brand fs-2 d-flex align-items-center ms-2" href="index.html">
            <img id='navabar-logo' src="images/Cajoe-bits-logo.png" alt="SavvyStudent brand logo" />
            <div id="navbar-header">SavvyStudents</div>
          </a>
          <div class="d-flex align-items-center ms-auto order-md-2">
            <button class="navbar-toggler d-md-none me-3" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <button class="btn nav-link btn-outline-info navbar-btn p-0 ms-2 me-3" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">
              <img src="images/profile_icon.svg" width="30px" alt="" />
            </button>
          </div>
          <div class="collapse navbar-collapse mx-md-0 order-md-1" id="navbarSupportedContent">
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0 ps-sm-2 fs-5">
              <li class="nav-item"><a class="nav-link" aria-current="page" href="index.html">Home</a></li>
              <li class="nav-item"><a class="nav-link" aria-current="page" href="about-us.html">About Us</a></li>
              <li class="nav-item"><a class="nav-link" aria-current="page" href="budgeting-tips.html">Budgeting Tips</a></li>
              <li class="nav-item"><a class="nav-link" aria-current="page" href="dashboard.html">Dashboard</a></li>
              <li class="nav-item"><a class="nav-link sign-out" aria-current="page">Sign Out</a></li>
            </ul>
          </div>
        </div>
      </nav>
    `;
    document.querySelector(".header").innerHTML = navbarHTML;
    document.querySelector(".footer").innerHTML = footerHTML;
  
    // adds an event listener for sign out link that will clear user information and redirect them to the sign-on.html page
    document.querySelector('.sign-out').addEventListener('click', () => {
      signOut(auth).then(() => {
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.setItem('userId', '0');
        // Redirect to the sign on page after sign out, not added as an href to make sure that the user
        // firebase variable is cleared first before redirecting to make sure that the right navbar is displayed
        window.location.href = '/sign-on.html'; 
      }).catch((error) => {
        // will maybe add the code to change the localStorage variables back to their default 
        // console.error('Sign out error:', error);
      });
    });
  
    // Add the custom styles for the specific screen size range
    const style = document.createElement('style');
    style.innerHTML = `
      @media only screen and (min-width: 768px) and (max-width: 912px) {
        .navbar-nav .nav-item {
          font-size: 1rem !important;
        }
  
        #navbar-header {
          font-size: calc(1rem + 1vw) !important;
        }
      }
    `;
    document.head.appendChild(style);
  };

  // Check if user is logged in and displays the correct navbar
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn === 'true') {
    loadLoggedInNavbar();
  } else {
    loadDefaultNavbarFooter();
  }
});
