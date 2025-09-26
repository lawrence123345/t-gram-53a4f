// Default avatars
const defaultAvatars = [
  "https://cdn-icons-png.flaticon.com/512/1077/1077114.png", // Unknown by Freepik
  "https://cdn-icons-png.flaticon.com/512/4718/4718624.png", // Easter Bunny / Rabbit by Freepik
  "https://cdn-icons-png.flaticon.com/512/616/616430.png", // Cat by justicon
  "https://cdn-icons-png.flaticon.com/512/2995/2995624.png", // Penguin by Freepik (corrected from cat link)
  "https://cdn-icons-png.flaticon.com/512/1998/1998610.png", // Alien by Freepik
  "https://cdn-icons-png.flaticon.com/512/2924/2924763.png", // Dragon / Monster by Freepik
  "https://cdn-icons-png.flaticon.com/512/2839/2839022.png", // Grandmaster / Chess by Freepik
  "https://cdn-icons-png.flaticon.com/512/4306/4306979.png", // Peace / Kitty by hellosun
  "https://cdn-icons-png.flaticon.com/512/1077/1077063.png", // Man / Bald by Freepik
  "https://cdn-icons-png.flaticon.com/512/1144/1144766.png" // Gamer by Muhammad_Usman
];

// Make functions global so they can be called from HTML
window.renderProfile = function(){
  if (!window.currentUser) {
    window.ModalManager.showAlert('Please log in to view your profile.', 'error');
    window.messages.push({ type: 'error', content: 'Please log in to view your profile.', timestamp: Date.now() });
    renderLogin();
    return;
  }

  // Calculate ranking position
  let scores = JSON.parse(localStorage.getItem('scores')) || [];
  scores.sort((a, b) => b.totalScore - a.totalScore);
  let rank = scores.findIndex(s => s.user === currentUser.username) + 1;
  if (rank === 0) rank = 'Not ranked yet';

  // Avatar options
  let avatarHTML = defaultAvatars.map(a => `<div class="avatar-option ${currentUser.avatar === a ? 'selected-avatar' : ''}" onclick="selectAvatar('${a}')"><img src="${a}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;"></div>`).join("");

  document.getElementById('app').innerHTML = `<div class="profile-card">
<h2>🎮 Your Profile</h2>

<div class="profile-section avatar-section">
<h3>Choose Your Avatar</h3>
<p>Upload a custom photo or select from our fun collection:</p>
<div class="upload-container">
<input type="file" id="avatar-upload" accept="image/*" onchange="uploadAvatar()" style="display: none;">
<label for="avatar-upload" class="upload-btn">📁 Upload Photo</label>
</div>
<div class="avatar-grid">${avatarHTML}</div>
</div>

<div class="profile-section details-section">
<h3>Personal Information</h3>
<div class="detail-grid">
<div class="detail-item">
<label for="edit-username">Username</label>
<input id="edit-username" value="${currentUser.username}" />
</div>
<div class="detail-item">
<label for="edit-bio">Bio / About Me</label>
<textarea id="edit-bio" placeholder="Tell us about yourself">${currentUser.bio || ''}</textarea>
</div>
<div class="detail-item">
<label>Email</label>
<span>${currentUser.email}</span>
</div>
<div class="detail-item">
<label for="edit-age">Age</label>
<input id="edit-age" type="number" value="${currentUser.age || ''}" placeholder="Optional" />
</div>
<div class="detail-item">
<label>Leaderboard Rank</label>
<span class="rank-display">${rank}</span>
</div>
</div>
</div>

<div class="profile-actions">
<button class="btn save-btn" onclick="saveProfile()">💾 Save Changes</button>
<button class="btn back-btn" onclick="renderHome()">🏠 Back to Home</button>
</div>
</div>`;

  updateNavAvatar();
}

// Make functions global so they can be called from HTML
window.selectAvatar = function(avatar){
  currentUser.avatar = avatar;
  updateNavAvatar();
  renderProfile();
}

// Make functions global so they can be called from HTML
window.uploadAvatar = function(){
  let file = document.getElementById('avatar-upload').files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = function(e) {
      currentUser.avatar = e.target.result;
      updateNavAvatar();
      renderProfile();
    };
    reader.readAsDataURL(file);
  }
}

// Make functions global so they can be called from HTML
window.saveProfile = function(){
  currentUser.username = document.getElementById('edit-username').value;
  currentUser.bio = document.getElementById('edit-bio').value;
  currentUser.age = document.getElementById('edit-age').value;
  currentUser.lastLogin = new Date().toLocaleDateString();
  let idx = users.findIndex(u => u.email === currentUser.email);
  if (idx !== -1) users[idx] = currentUser;
  localStorage.setItem('users', JSON.stringify(users));
  window.ModalManager.showAlert('Profile updated!', 'success');
  window.messages.push({ type: 'success', content: 'Profile updated!', timestamp: Date.now() });
  updateNavAvatar();
}

// Function to update avatar in navigation bar
window.updateNavAvatar = function(){
  let navAvatar = document.getElementById('nav-avatar');
  if (navAvatar && currentUser.avatar) {
    navAvatar.src = currentUser.avatar;
    navAvatar.style.display = 'block';
  } else if (navAvatar) {
    navAvatar.style.display = 'none';
  }
}
