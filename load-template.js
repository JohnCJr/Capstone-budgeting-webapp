// this script loads the header and footer into each page. may inlcude more at a later date, such as an
// different header data based on whether the user is loged in or not 

// for testing purposes, the navbar will cotian th user icon to acess the dashboard even when not logged in,'
// navbar will display sign out when user is signed in and vice versa.
import { auth, onAuthStateChanged, getDatabase, ref, update, get, signOut } from "./initialize-firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  let navbarHTML = '';
  let footerHTML = `
    &#169 2023-2024 SavvyStudents
    <br>SavvyStudents.com
    <br>123 First St.
    <br>Designed by Cajoe Bits Team
  `;

  // const loadOffcanvas = (user, username) => {
  //   const offcanvasContainer = document.querySelector(".offcanvas-container");

  //   offcanvasContainer.innerHTML = `
  //     <div class="offcanvas offcanvas-start" data-bs-scroll="true" tabindex="-1" id="offcanvasWithBothOptions" aria-labelledby="offcanvasWithBothOptionsLabel">
  //       <div class="offcanvas-header">
  //         <h5 class="offcanvas-title" id="offcanvasWithBothOptionsLabel">${username || "User Name"}</h5>
  //         <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  //       </div>
  //       <div class="offcanvas-body d-flex flex-column">
  //         <img class="canvas-profile-pic d-flex mx-auto mb-3" src="${user.photoURL || 'images/logo.jpg'}" width="260px" alt=""/>
  //         <div class="row gap-1 justify-content-center mb-3">
  //           <button class="btn btn-primary col-8 col-md-5" id="edit-profile-btn">Edit Profile</button>
  //           <button class="btn btn-primary col-8 col-md-5 d-none" id="save-profile-btn">Confirm</button>
  //           <a class="btn btn-primary col-8 col-md-5" href="dashboard.html" id="dashboard-btn">My Dashboard</a>
  //           <button class="btn btn-secondary col-8 col-md-5 d-none" id="cancel-edit-btn">Cancel</button>
  //         </div>
  //         <textarea class="form-control d-none" id="profile-description" maxlength="99"></textarea>
  //         <small class="text-end d-none" id="char-count">99 characters remaining</small>
  //         <p id="profile-description-text">Brief description about the user.</p>
  //       </div>
  //     </div>
  //   `;

  //   const editProfileBtn = document.getElementById("edit-profile-btn");
  //   const saveProfileBtn = document.getElementById("save-profile-btn");
  //   const cancelEditBtn = document.getElementById("cancel-edit-btn");
  //   const dashboardBtn = document.getElementById("dashboard-btn");
  //   const profileDescription = document.getElementById("profile-description");
  //   const profileDescriptionText = document.getElementById("profile-description-text");
  //   const charCount = document.getElementById("char-count");

  //   const cancelEdit = () => {
  //     editProfileBtn.classList.remove("d-none");
  //     saveProfileBtn.classList.add("d-none");
  //     cancelEditBtn.classList.add("d-none");
  //     dashboardBtn.classList.remove("d-none");
  //     profileDescription.classList.add("d-none");
  //     profileDescriptionText.classList.remove("d-none");
  //     charCount.classList.add("d-none");
  //   };

  //   editProfileBtn.addEventListener("click", () => {
  //     editProfileBtn.classList.add("d-none");
  //     saveProfileBtn.classList.remove("d-none");
  //     cancelEditBtn.classList.remove("d-none");
  //     dashboardBtn.classList.add("d-none");
  //     profileDescription.classList.remove("d-none");
  //     profileDescriptionText.classList.add("d-none");
  //     charCount.classList.remove("d-none");

  //     profileDescription.value = profileDescriptionText.textContent.trim();
  //     charCount.textContent = `${99 - profileDescription.value.length} characters remaining`;
  //   });

  //   saveProfileBtn.addEventListener("click", () => {
  //     // Save to Firebase
  //     const userId = user.uid;
  //     const database = getDatabase();
  //     const updates = {};
  //     updates[`/users/${userId}/description`] = profileDescription.value.trim();

  //     update(ref(database), updates)
  //       .then(() => {
  //         profileDescriptionText.textContent = profileDescription.value.trim();
  //         cancelEdit();
  //       })
  //       .catch((error) => {
  //         console.error("Error updating description:", error);
  //       });
  //   });

  //   cancelEditBtn.addEventListener("click", cancelEdit);

  //   profileDescription.addEventListener("input", () => {
  //     charCount.textContent = `${99 - profileDescription.value.length} characters remaining`;
  //   });

  //   // Load user's profile description if available
  //   const database = getDatabase();
  //   const userId = user.uid;
  //   get(ref(database, `/users/${userId}/description`)).then((snapshot) => {
  //     if (snapshot.exists()) {
  //       profileDescriptionText.textContent = snapshot.val();
  //     }
  //   });
  // };

  // loads default navbar and footer to pages
  const loadDefaultNavbarFooter = () => {
    navbarHTML = `
      <nav class="navbar navbar-expand-md bg-body-tertiary">
        <div class="container-fluid px-lg-5 px-md-2 px-0 d-flex py-1 justify-content-between align-items-center">
          <a class="navbar-brand fs-1 d-flex align-items-center ms-2" href="home.html">
            <img src="images/logo.jpg" alt="SavvyStudent brand logo" />
            SavvyStudents
          </a>
          <div class="d-flex align-items-center ms-auto order-md-2">
            <button class="navbar-toggler d-md-none me-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
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
            <img src="images/logo.jpg" alt="SavvyStudent brand logo" />
            SavvyStudents
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
        console.error('Sign out error:', error);
      });
    });

  //   onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       const database = getDatabase();
  //       const userId = user.uid;
  //       get(ref(database, `/users/${userId}/username`)).then((snapshot) => {
  //         if (snapshot.exists()) {
  //           const username = snapshot.val();
  //           loadOffcanvas(user, username);
  //         } else {
  //           loadOffcanvas(user, "User Name");
  //         }
  //       }).catch((error) => {
  //         console.error("Error fetching username:", error);
  //         loadOffcanvas(user, "User Name");
  //       });
  //     }
  //   });
  };

  // Check if user is logged in and displays the correct navbar
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn === 'true') {
    loadLoggedInNavbar();
  } else {
    loadDefaultNavbarFooter();
  }
});
