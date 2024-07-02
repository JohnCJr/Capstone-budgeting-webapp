document.addEventListener("DOMContentLoaded", function() {
    const editProfileButton = document.getElementById('editProfileButton');
    const saveProfileButton = document.getElementById('saveProfileButton');
    const cancelEditButton = document.getElementById('cancelEditButton');
    const profileInfo = document.getElementById('profileInfo');
    const editProfileForm = document.getElementById('editProfileForm');
  
    editProfileButton.addEventListener('click', function() {
      profileInfo.style.display = 'none';
      editProfileForm.style.display = 'block';
    });
  
    cancelEditButton.addEventListener('click', function() {
      profileInfo.style.display = 'block';
      editProfileForm.style.display = 'none';
    });
  
    saveProfileButton.addEventListener('click', function() {
      const userName = document.getElementById('userName');
      const userEmail = document.getElementById('userEmail');
      const userAbout = document.getElementById('userAbout');
      const editUserName = document.getElementById('editUserName').value;
      const editUserEmail = document.getElementById('editUserEmail').value;
      const editUserAbout = document.getElementById('editUserAbout').value;
  
      userName.textContent = editUserName;
      userEmail.textContent = editUserEmail;
      userAbout.textContent = editUserAbout;
  
      profileInfo.style.display = 'block';
      editProfileForm.style.display = 'none';
    });
  });
  