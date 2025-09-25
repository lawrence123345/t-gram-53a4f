// ===== Global Variables =====
window.selectedDifficulty = null;
window.currentUser = null;
window.users = JSON.parse(localStorage.getItem('users')) || [
    {username:"Lawrence", email:"lawrence@gmail.com", password:"123456", avatar:"😀"},
    {username:"Unknown", email:"unknown@gmail.com", password:"123456", avatar:"😎"}
];
window.auth = null; // This will be set when Firebase is initialized

// ===== Navigation Update =====
window.updateNav = function(auth){
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

// ===== Home Page =====
window.renderHome = function(){
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
  updateNavAvatar();

  // Hero animation
  setTimeout(() => {
    const hero = document.querySelector('.hero h1');
    hero.style.animation = 'fadeIn 2s ease';
  }, 500);
}

// ===== Difficulty Selection =====
window.selectDifficulty = function(diff){
  selectedDifficulty = diff;
  document.getElementById('mode-selection').style.display = 'block';
  document.querySelector('h3').scrollIntoView({ behavior: 'smooth' });
}

// ===== About Page =====
window.renderAbout = function(){
  document.getElementById('app').innerHTML = `<main>
<h2>About T-Gram</h2>
<p>T-Gram combines Tic-Tac-Toe with grammar learning. Select your difficulty, play offline or online, and track your scores!</p>
<button class="btn" onclick="renderHome()">Back</button>
</main>`;
}

// ===== Offline PvP =====
window.startOfflinePvP = function() {
  if (!window.selectedDifficulty) {
    alert("Please select a difficulty first!");
    return;
  }

  // Render Offline PvP interface
  document.getElementById('app').innerHTML = `
  <div class="board-container">
    <h2>Offline PvP - ${selectedDifficulty}</h2>
    <div class="player-avatars">
      <div class="avatar-container active">
        <div class="avatar">😀</div>
        <p>Player 1</p>
      </div>
      <div class="avatar-container">
        <div class="avatar">😎</div>
        <p>Player 2</p>
      </div>
    </div>
    <div class="timer-bar"><div class="progress" style="width:0%"></div></div>
    <div class="board"></div>
    <button class="btn" onclick="renderHome()">Back</button>
  </div>
  `;

  renderBoard();
  startTimer();
}

// ===== Render Tic-Tac-Toe Board =====
function renderBoard() {
  const board = document.querySelector('.board');
  const cells = Array(9).fill(null);

  board.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.tabIndex = 0;
    cell.addEventListener('click', () => handleMove(i, cell, cells));
    board.appendChild(cell);
  }
}

// ===== Handle Player Move =====
function handleMove(index, cellElement, cells) {
  if (cells[index]) return;

  const player = cells.filter(c => c).length % 2 === 0 ? 'X' : 'O';
  cells[index] = player;
  cellElement.textContent = player;
  cellElement.classList.add(player);

  const winner = checkWinner(cells);
  if (winner) {
    highlightWinner(winner, cells);
    setTimeout(() => alert(`${winner} wins!`), 100);
    stopTimer();
  }
}

// ===== Check Winner =====
function checkWinner(cells) {
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b,c] of combos) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a];
  }
  return null;
}

// ===== Highlight Winner =====
function highlightWinner(winner, cells) {
  const boardCells = document.querySelectorAll('.cell');
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b,c] of combos) {
    if (cells[a] === winner && cells[b] === winner && cells[c] === winner) {
      boardCells[a].classList.add('win');
      boardCells[b].classList.add('win');
      boardCells[c].classList.add('win');
      break;
    }
  }
}

// ===== Timer Logic =====
let timerInterval;
function startTimer() {
  const progress = document.querySelector('.progress');
  let width = 0;
  progress.style.width = '0%';
  timerInterval = setInterval(() => {
    width += 1;
    progress.style.width = width + '%';
    if(width >= 100) {
      clearInterval(timerInterval);
      alert("Time's up!");
    }
  }, 100); // 10 seconds total
}

function stopTimer() {
  clearInterval(timerInterval);
}

// ===== Initialize Dark Mode =====
if(localStorage.getItem('dark') === "true") document.body.classList.add('dark');

// ===== Background Sync for Offline =====
if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
  navigator.serviceWorker.ready.then((registration) => {
    return registration.sync.register('background-sync');
  }).catch((error) => {
    console.log('Background sync registration failed:', error);
  });
}

// ===== Initial Render =====
renderLogin();
