let selectedDifficulty = null;

function updateNav(auth){
  const nav = document.getElementById('nav-links');
  if(auth){
    nav.innerHTML = `<a onclick="renderHome()">Home</a>
<a onclick="renderLeaderboard()">Leaderboard</a>
<a onclick="renderProfile()">Profile</a>
<a onclick="toggleDarkMode()">Dark Mode</a>
<a onclick="logout()">Log Out</a>`;
  } else {
    nav.innerHTML = `<a onclick="renderAbout()">About</a>`;
  }
}

function renderHome(){
  selectedDifficulty = null;
  document.getElementById('app').innerHTML = `<main>
<div class="hero"><h1>Welcome to T-Gram</h1>
<p>Your space for fun, learning, and growth. Discover interactive games, track your progress, and challenge yourself with every play.</p></div>
<div class="spherocube"></div>
<h3>Select Difficulty</h3>
<div class="cards">
<div class="card" onclick="selectDifficulty('Beginner')">Beginner</div>
<div class="card" onclick="selectDifficulty('Intermediate')">Intermediate</div>
<div class="card" onclick="selectDifficulty('Advanced')">Advanced</div>
</div>
<div id="mode-selection" style="display: none;">
<h3>Choose Mode</h3>
<div class="cards">
<div class="card" onclick="startOfflinePvP()">Offline PvP</div>
<div class="card" onclick="startOnlinePvP()">Online PvP</div>
</div>
<button class="btn" onclick="renderHome()">Back</button>
</div>
</main>`;
  updateNav(true);
  // Add some dynamic content
  setTimeout(() => {
    const hero = document.querySelector('.hero h1');
    hero.style.animation = 'fadeIn 2s ease';
  }, 500);
}

function selectDifficulty(diff){
  selectedDifficulty = diff;
  document.getElementById('mode-selection').style.display = 'block';
  document.querySelector('h3').scrollIntoView({ behavior: 'smooth' });
}

function renderAbout(){
  document.getElementById('app').innerHTML = `<main>
<h2>About T-Gram</h2>
<p>T-Gram combines Tic-Tac-Toe with grammar learning. Select your difficulty, play offline or online, and track your scores!</p>
<button class="btn" onclick="renderHome()">Back</button>
</main>`;
}

// Initialize
if(localStorage.getItem('dark') === "true") document.body.classList.add('dark');
renderLogin();
