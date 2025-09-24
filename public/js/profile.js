const avatars = ["😀","😎","🤓","🧙‍♂️","🦸‍♀️","👨‍💻","👩‍🎓","🦄","🐱","🚀"];

function renderProfile(){
  let scores = JSON.parse(localStorage.getItem('scores')) || [];
  let userScore = scores.find(s => s.user === currentUser.username)?.score || 0;
  let totalGames = currentUser.totalGames || 0;
  let averageScore = totalGames > 0 ? Math.round((currentUser.totalScore || 0) / totalGames) : 0;
  let level = Math.floor((currentUser.totalScore || 0) / 100) + 1;
  let accuracy = currentUser.totalQuestions > 0 ? Math.round((currentUser.totalCorrect || 0) / currentUser.totalQuestions * 100) : 0;
  let avatarHTML = avatars.map(a => `<span class="avatar-option ${currentUser.avatar===a?'selected-avatar':''}" onclick="selectAvatar('${a}')">${a}</span>`).join("");
  let achievementsHTML = getAchievementsHTML();
  let progressHTML = getProgressHTML(level, accuracy);
  document.getElementById('app').innerHTML = `<div class="profile-card">
<h2>Profile</h2>
<div class="profile-section">
<h3>Extended User Info</h3>
<p><strong>Username:</strong> <input id="edit-user" value="${currentUser.username}" /></p>
<p><strong>Email:</strong> ${currentUser.email}</p>
<p><strong>Age:</strong> <input id="edit-age" value="${currentUser.age || ''}" placeholder="Enter age" /></p>
<p><strong>Level Reached:</strong> ${level}</p>
<p><strong>Total Games Played:</strong> ${totalGames}</p>
<p><strong>Average Score:</strong> ${averageScore}</p>
<p><strong>Last Login:</strong> ${currentUser.lastLogin || 'Never'}</p>
</div>
<div class="profile-section">
<h3>Avatar & Customization</h3>
<p><strong>Avatar:</strong> ${avatarHTML}</p>
</div>
<div class="profile-section">
<h3>Statistics & Progress</h3>
${progressHTML}
<p><strong>Grammar Accuracy:</strong> ${accuracy}%</p>
<p><strong>Win/Loss Ratio:</strong> ${userScore}/${totalGames - userScore}</p>
</div>
<div class="profile-section">
<h3>Achievements & Badges</h3>
${achievementsHTML}
</div>
<div class="profile-section">
<h3>Settings</h3>
<button class="btn" onclick="toggleDarkMode()">Toggle Dark Mode</button>
<button class="btn" onclick="updatePassword()">Update Password</button>
</div>
<div class="profile-section">
<h3>Social & Sharing</h3>
<button class="btn" onclick="shareAchievements()">Share Achievements</button>
</div>
<div class="profile-section">
<h3>Interactive Feedback</h3>
<p>${getMotivationalMessage()}</p>
</div>
<button class="btn" onclick="saveProfile()">Save Changes</button>
<button class="btn" onclick="logout()">Log Out</button>
</div>`;
}

function selectAvatar(a){ 
  currentUser.avatar = a; 
  renderProfile(); 
}

function saveProfile(){
  currentUser.username = document.getElementById('edit-user').value;
  currentUser.age = document.getElementById('edit-age').value;
  currentUser.lastLogin = new Date().toLocaleDateString();
  let idx = users.findIndex(u => u.email === currentUser.email);
  if(idx !== -1) users[idx] = currentUser;
  localStorage.setItem('users', JSON.stringify(users));
  alert("Profile updated!");
  renderProfile();
}

function getAchievementsHTML(){
  let achievements = currentUser.achievements || [];
  if(achievements.length === 0) return '<p>No achievements yet. Keep playing!</p>';
  return achievements.map(a => `<span class="badge">${a}</span>`).join('');
}

function getProgressHTML(level, accuracy){
  return `<div class="progress-bar">
<div class="progress-fill" style="width: ${Math.min(level * 10, 100)}%"></div>
</div>
<p>Level Progress: ${level}</p>
<div class="progress-bar">
<div class="progress-fill" style="width: ${accuracy}%"></div>
</div>
<p>Accuracy Progress: ${accuracy}%</p>`;
}

function getMotivationalMessage(){
  let messages = ["Keep it up!", "New High Score!", "You're doing great!", "Almost there!"];
  return messages[Math.floor(Math.random() * messages.length)];
}

function shareAchievements(){
  alert('Sharing achievements feature coming soon!');
}

function updatePassword(){
  let newPass = prompt('Enter new password:');
  if(newPass) {
    currentUser.password = newPass;
    let idx = users.findIndex(u => u.email === currentUser.email);
    if(idx !== -1) users[idx] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Password updated!');
  }
}
