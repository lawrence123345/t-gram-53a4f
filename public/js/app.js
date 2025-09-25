// ===== Global Variables =====
window.selectedDifficulty = null;
window.currentUser = null;
window.users = JSON.parse(localStorage.getItem('users')) || [
    {username:"Lawrence", email:"lawrence@gmail.com", password:"123456", avatar:"😀"},
    {username:"Unknown", email:"unknown@gmail.com", password:"123456", avatar:"😎"}
];
window.auth = null; // This will be set when Firebase is initialized
window.questions = null;
window.currentQuestion = null;
window.gameQuestions = [];
window.wrongAnswers = [];
window.badges = JSON.parse(localStorage.getItem('badges')) || [];

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
window.startOfflinePvP = async function() {
  if (!window.selectedDifficulty) {
    alert("Please select a difficulty first!");
    return;
  }

  await loadQuestions();

  // Set timer duration based on difficulty
  const timerDuration = getTimerDuration();

  // Render Offline PvP interface with question modal support
  document.getElementById('app').innerHTML = `
  <div class="board-container">
    <h2>Offline PvP - ${selectedDifficulty} Grammar Challenge</h2>
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
    <div id="question-modal" class="modal" style="display:none;">
      <div class="modal-content">
        <h3 id="question-title"></h3>
        <div id="question-content"></div>
        <div id="question-options"></div>
        <button class="btn" id="submit-answer">Submit</button>
        <button class="btn" onclick="closeQuestion()">Skip (Penalty)</button>
      </div>
    </div>
    <button class="btn" onclick="renderHome()">Back</button>
    <button class="btn" onclick="showReview()" style="display:none;" id="review-btn">Review Mistakes</button>
  </div>
  `;

  window.board = Array(9).fill(null);
  renderBoard();
  window.currentPlayer = 'X';
  // Don't show question immediately; wait for first move
}

// ===== Render Tic-Tac-Toe Board =====
window.renderBoard = function() {
  const boardEl = document.querySelector('.board');
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.tabIndex = 0;
    if (window.board[i]) {
      cell.textContent = window.board[i];
      cell.classList.add(window.board[i]);
    }
    cell.addEventListener('click', () => attemptMove(i));
    boardEl.appendChild(cell);
  }
};

// ===== Attempt Move (Integrates Question) =====
window.attemptMove = function(index) {
  if (window.board[index] !== null) return;

  // Show question for this move
  window.currentMoveIndex = index;
  showNextQuestion();
};

// After correct answer, place the move
window.placeMove = function() {
  const index = window.currentMoveIndex;
  const player = window.currentPlayer;
  window.board[index] = player;
  const cells = document.querySelectorAll('.cell');
  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add(player);

  // Switch player
  window.currentPlayer = window.currentPlayer === 'X' ? 'O' : 'X';
  updatePlayerAvatars();

  // Check winner
  const winner = checkWinner(window.board);
  if (winner) {
    highlightWinner(winner, window.board);
    awardBadge('victory');
    setTimeout(() => alert(`${winner} wins the game!`), 100);
    saveOfflineProgress();
    return;
  }

  // Check draw
  if (window.board.every(cell => cell !== null)) {
    alert("It's a draw!");
    awardBadge('draw');
    saveOfflineProgress();
    return;
  }

  // Prepare next question if more questions
  window.currentQuestionIndex++;
  if (window.currentQuestionIndex < window.gameQuestions.length) {
    setTimeout(() => showNextQuestion(), 500); // Brief pause
  } else {
    // No more questions, but game can continue or end
    alert("Questions exhausted! Game continues without questions.");
  }
};

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

// ===== Show Next Question =====
window.showNextQuestion = function() {
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

  title.textContent = `Question ${window.currentQuestionIndex + 1}`;
  content.textContent = window.currentQuestion.question;

  options.innerHTML = '';
  if (window.currentQuestion.type === 'multiple_choice') {
    window.currentQuestion.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.classList.add('btn');
      btn.textContent = opt;
      btn.onclick = () => selectOption(idx);
      options.appendChild(btn);
    });
  } else if (window.currentQuestion.type === 'fill_blank') {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'fill-input';
    options.appendChild(input);
  } else if (window.currentQuestion.type === 'error_identification') {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'error-input';
    input.placeholder = 'Enter the error word';
    options.appendChild(input);
  } else if (window.currentQuestion.type === 'sentence_completion') {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'completion-input';
    options.appendChild(input);
  } else if (window.currentQuestion.type === 'paragraph_correction') {
    const textarea = document.createElement('textarea');
    textarea.id = 'correction-input';
    options.appendChild(textarea);
  }

  submitBtn.onclick = submitAnswer;
  modal.style.display = 'flex';
  startTimer();
};

// ===== Select Option =====
window.selectOption = function(idx) {
  window.selectedAnswer = window.currentQuestion.options[idx];
};

// ===== Submit Answer =====
window.submitAnswer = function() {
  let userAnswer = '';
  if (window.currentQuestion.type === 'multiple_choice') {
    userAnswer = window.selectedAnswer || '';
  } else if (window.currentQuestion.type === 'fill_blank') {
    userAnswer = document.getElementById('fill-input').value.trim();
  } else if (window.currentQuestion.type === 'error_identification') {
    userAnswer = document.getElementById('error-input').value.trim();
  } else if (window.currentQuestion.type === 'sentence_completion') {
    userAnswer = document.getElementById('completion-input').value.trim();
  } else if (window.currentQuestion.type === 'paragraph_correction') {
    userAnswer = document.getElementById('correction-input').value.trim();
  }

  const correct = userAnswer.toLowerCase() === window.currentQuestion.answer.toLowerCase();
  if (!correct) {
    window.wrongAnswers.push(window.currentQuestion);
    // Penalty: skip turn
    window.currentPlayer = window.currentPlayer === 'X' ? 'O' : 'X';
    updatePlayerAvatars();
    alert("Wrong answer! Turn skipped.");
  } else {
    placeMove();
  }

  closeQuestion();
};

// ===== Close Question =====
window.closeQuestion = function() {
  document.getElementById('question-modal').style.display = 'none';
  stopTimer();
  // Penalty for skipping: maybe skip turn or something, but for now just proceed
};

// ===== Show Review =====
window.showReview = function() {
  if (window.wrongAnswers.length === 0) {
    alert("Great! No mistakes.");
    return;
  }
  let reviewHTML = '<h3>Review Your Mistakes</h3>';
  window.wrongAnswers.forEach((q, idx) => {
    reviewHTML += `<div class="review-item">
      <p><strong>Q${idx+1}:</strong> ${q.question}</p>
      <p><strong>Correct:</strong> ${q.answer}</p>
    </div>`;
  });
  reviewHTML += '<button class="btn" onclick="renderHome()">Back to Home</button>';
  document.getElementById('app').innerHTML = `<main>${reviewHTML}</main>`;
};

// ===== Timer Logic =====
let timerInterval;
function startTimer() {
  const progress = document.querySelector('.progress');
  const duration = getTimerDuration();
  const interval = duration / 100; // Update every 1% of duration
  let width = 0;
  progress.style.width = '0%';
  timerInterval = setInterval(() => {
    width += 1;
    progress.style.width = width + '%';
    if(width >= 100) {
      clearInterval(timerInterval);
      alert("Time's up! Question skipped.");
      closeQuestion();
      window.currentQuestionIndex++;
      if (window.currentQuestionIndex < window.gameQuestions.length) {
        showNextQuestion();
      } else {
        document.getElementById('review-btn').style.display = 'inline-block';
      }
    }
  }, interval);
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

// ===== Update Player Avatars =====
window.updatePlayerAvatars = function() {
  const avatars = document.querySelectorAll('.avatar-container');
  avatars.forEach((av, idx) => {
    av.classList.remove('active');
    if ((window.currentPlayer === 'X' && idx === 0) || (window.currentPlayer === 'O' && idx === 1)) {
      av.classList.add('active');
    }
  });
};

// ===== Award Badge =====
window.awardBadge = function(type) {
  const badge = { type, difficulty: window.selectedDifficulty, date: new Date().toISOString() };
  window.badges.push(badge);
  localStorage.setItem('badges', JSON.stringify(window.badges));
  alert(`Badge awarded: ${type} in ${window.selectedDifficulty}!`);
};

// ===== Save Offline Progress =====
window.saveOfflineProgress = function() {
  const progress = {
    difficulty: window.selectedDifficulty,
    wrongAnswers: window.wrongAnswers.length,
    date: new Date().toISOString()
  };
  const offlineProgress = JSON.parse(localStorage.getItem('offlineProgress')) || [];
  offlineProgress.push(progress);
  localStorage.setItem('offlineProgress', JSON.stringify(offlineProgress));
};

// ===== Initial Render =====
renderLogin();
