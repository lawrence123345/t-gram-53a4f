// ===== Global Variables =====
window.selectedDifficulty = null;
window.currentUser = null;
window.users = [
    {username:"Unknown", email:"CoffeeRain@gmail.com", password:"MoonLight", avatar:"😎"}
];
window.auth = null; // This will be set when Firebase is initialized
window.questions = null;
window.currentQuestion = null;
window.gameQuestions = [];

// ===== Navigation Update =====
window.updateNav = function(auth){
  const nav = document.getElementById('nav-links');
  if(auth){
    nav.innerHTML = `<a onclick="renderHome()">Home</a>
<a onclick="renderLeaderboard()">Leaderboard</a>
<a onclick="renderProfile()">Profile</a>
<a onclick="toggleDarkMode()">Dark Mode</a>
<a onclick="logout()">Log Out</a>`;
    updateToggleText();
  } else {
    nav.innerHTML = `<a onclick="renderAbout()">About</a>`;
  }
}

// ===== Home Page =====
window.renderHome = function(){
  window.selectedDifficulty = null;
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
  window.selectedDifficulty = diff;
  document.getElementById('mode-selection').style.display = 'block';
  document.querySelector('h3').scrollIntoView({ behavior: 'smooth' });
}

// ===== About Page =====
window.renderAbout = function(){
  document.getElementById('app').innerHTML = `<main>
<div class="about-hero">
  <h1>About T-Gram</h1>
  <p class="hero-subtitle">Empowering Rural Education Through Gamified Learning</p>
</div>

<div class="about-section">
  <h2>Our Mission</h2>
  <p>T-Gram is a progressive web app designed to make learning fun and accessible, especially for students in rural areas. We combine interactive games with educational content to enhance grammar skills and critical thinking.</p>
</div>

<div class="features-grid">
  <div class="feature-card">
    <i class="fas fa-gamepad"></i>
    <h3>Interactive Games</h3>
    <p>Engage with Tic-Tac-Toe variants that incorporate grammar challenges at different difficulty levels.</p>
  </div>
  <div class="feature-card">
    <i class="fas fa-users"></i>
    <h3>Multiplayer Modes</h3>
    <p>Play offline PvP or challenge friends online to make learning competitive and exciting.</p>
  </div>
  <div class="feature-card">
    <i class="fas fa-trophy"></i>
    <h3>Progress Tracking</h3>
    <p>Monitor your scores, view leaderboards, and track your improvement over time.</p>
  </div>
  <div class="feature-card">
    <i class="fas fa-mobile-alt"></i>
    <h3>Offline Access</h3>
    <p>Learn anywhere, even without internet. Our PWA works offline with service worker caching.</p>
  </div>
</div>

<div class="about-section">
  <h2>Why Choose T-Gram?</h2>
  <ul class="benefits-list">
    <li><strong>Adaptive Learning:</strong> Content adjusts to your skill level for optimal challenge.</li>
    <li><strong>Engaging Design:</strong> Beautiful UI with dark mode support for comfortable learning.</li>
    <li><strong>Community Driven:</strong> Compete with others and climb the leaderboards.</li>
    <li><strong>Free & Accessible:</strong> No cost, works on any device with a modern browser.</li>
  </ul>
</div>

<div class="motivational-quote">
  <blockquote>"Learning is not attained by chance, it must be sought for with ardor and attended to with diligence." – Abigail Adams</blockquote>
  <p class="quote-author">Start your journey with T-Gram today.</p>
</div>

<button class="btn" onclick="renderLogin()">Back to Login</button>
</main>`;
}

// ===== Load Questions =====
window.loadQuestions = async function() {
  if (!window.questions) {
    try {
      const response = await fetch('public/assets/questions.json');
      window.questions = await response.json();
    } catch (error) {
      console.error('Failed to load questions:', error);
      // Fallback questions
      window.questions = {
        beginner: [{type: "multiple_choice", question: "What is a verb?", options: ["Action word", "Naming word", "Describing word"], answer: "Action word"}],
        intermediate: [{type: "multiple_choice", question: "Choose the correct tense: She ___ yesterday.", options: ["go", "goes", "went"], answer: "went"}],
        advanced: [{type: "multiple_choice", question: "Identify the idiom: 'Break a leg'", options: ["Good luck", "Injury", "Run"], answer: "Good luck"}]
      };
    }
  }
  const diffKey = window.selectedDifficulty.toLowerCase();
  window.gameQuestions = [...window.questions[diffKey]];
  window.gameQuestions.sort(() => Math.random() - 0.5); // Shuffle
  window.currentQuestionIndex = 0;
  window.wrongAnswers = [];
};

// ===== Set Timer Duration =====
window.getTimerDuration = function() {
  switch (window.selectedDifficulty) {
    case 'Beginner': return 30000; // 30s
    case 'Intermediate': return 22500; // 22.5s avg
    case 'Advanced': return 17500; // 17.5s avg
    default: return 10000;
  }
};

// ===== Offline PvP =====
window.opponentName = '';
window.board = Array(9).fill(null);
window.currentPlayer = 'X';
window.currentQuestionIndex = 0;
window.gameQuestions = [];
window.selectedAnswer = '';

window.startOfflinePvP = async function() {
  window.opponentName = prompt("Enter opponent name:", "Player 2");
  if (!window.opponentName) window.opponentName = "Player 2";

  window.board = Array(9).fill(null);
  window.currentPlayer = 'X';
  window.currentQuestionIndex = 0;
  window.gameQuestions = [];
  window.selectedAnswer = '';

  await loadQuestionsForOffline();
  renderOfflineInterface();
  renderBoard();
}

async function loadQuestionsForOffline() {
  await loadQuestions();
}

window.renderOfflineInterface = function() {
  document.getElementById('app').innerHTML = `
    <div class="board-container">
      <div class="players">
        <div class="player">${window.currentUser.username} = X</div>
        <div class="player">${window.opponentName} = O</div>
      </div>
      <div class="board"></div>
      <div id="question-modal" class="modal" style="display:none;">
        <div class="modal-content">
          <h3 id="question-title"></h3>
          <div id="question-content"></div>
          <div id="question-options"></div>
          <div class="timer">Time left: <span id="timer-display">30</span>s</div>
          <button class="btn" id="submit-answer">Submit</button>
        </div>
      </div>
      <button class="btn" onclick="renderHome()">Back</button>
    </div>
  `;
}

window.renderBoard = function() {
  const boardEl = document.querySelector('.board');
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    if (window.board[i]) {
      cell.textContent = window.board[i];
      cell.classList.add(window.board[i]);
    } else {
      cell.addEventListener('click', () => attemptMove(i));
    }
    boardEl.appendChild(cell);
  }
};

window.attemptMove = function(index) {
  if (window.board[index] !== null) return;
  showQuestion(index);
};

window.showQuestion = function(index) {
  if (window.currentQuestionIndex >= window.gameQuestions.length) {
    alert("No more questions! Game over.");
    return;
  }
  window.currentQuestion = window.gameQuestions[window.currentQuestionIndex];
  const modal = document.getElementById('question-modal');
  const title = document.getElementById('question-title');
  const content = document.getElementById('question-content');
  const options = document.getElementById('question-options');
  const submitBtn = document.getElementById('submit-answer');

  title.textContent = `Question for ${window.currentPlayer}`;
  content.textContent = window.currentQuestion.question;

  options.innerHTML = '';
  if (window.currentQuestion.type === 'multiple_choice') {
    window.currentQuestion.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.classList.add('btn');
      btn.textContent = opt;
      btn.onclick = () => selectAnswer(idx);
      options.appendChild(btn);
    });
  } else {
    // Add other types if needed
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'answer-input';
    options.appendChild(input);
  }

  submitBtn.onclick = () => submitAnswer(index);
  modal.style.display = 'flex';
  startTimer();
};

window.selectAnswer = function(idx) {
  window.selectedAnswer = window.currentQuestion.options[idx];
};

window.submitAnswer = function(index) {
  let userAnswer = '';
  if (window.currentQuestion.type === 'multiple_choice') {
    userAnswer = window.selectedAnswer || '';
  } else {
    userAnswer = document.getElementById('answer-input').value.trim();
  }
  const correct = userAnswer.toLowerCase() === window.currentQuestion.answer.toLowerCase();
  closeQuestion();
  if (correct) {
    placeMove(index);
  } else {
    window.currentPlayer = window.currentPlayer === 'X' ? 'O' : 'X';
    alert("Wrong answer! Turn lost.");
  }
  window.currentQuestionIndex++;
};

window.placeMove = function(index) {
  window.board[index] = window.currentPlayer;
  renderBoard();
  const winner = checkWinner(window.board);
  if (winner) {
    if (winner === 'X') {
      alert(`${window.currentUser.username} wins!`);
      window.addScore(window.currentUser.username, 1, 1, 0, {});
    } else {
      alert(`${window.opponentName} wins!`);
      window.addScore(window.currentUser.username, 0, 1, 0, {});
    }
    setTimeout(() => renderHome(), 2000);
    return;
  }
  if (window.board.every(cell => cell !== null)) {
    alert("It's a draw!");
    setTimeout(() => renderHome(), 2000);
    return;
  }
  window.currentPlayer = window.currentPlayer === 'X' ? 'O' : 'X';
};

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

window.closeQuestion = function() {
  document.getElementById('question-modal').style.display = 'none';
  stopTimer();
};

let timerInterval;
function startTimer() {
  const display = document.getElementById('timer-display');
  let time = 30;
  display.textContent = time;
  timerInterval = setInterval(() => {
    time--;
    display.textContent = time;
    if (time <= 0) {
      clearInterval(timerInterval);
      alert("Time's up! Turn lost.");
      closeQuestion();
      window.currentPlayer = window.currentPlayer === 'X' ? 'O' : 'X';
      window.currentQuestionIndex++;
    }
  }, 1000);
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
