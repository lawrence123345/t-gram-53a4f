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
    nav.innerHTML = `<a onclick="window.renderHome()">Home</a>
<a onclick="window.renderLeaderboard()">Leaderboard</a>
<a onclick="window.toggleDarkMode()">Dark Mode</a>
<a onclick="window.logout()">Log Out</a>`;
    window.updateToggleText();
  } else {
    nav.innerHTML = `<a onclick="window.renderAbout()">About</a>`;
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
<h3 style="margin-bottom: 20px; margin-top: 30px;">Choose Mode</h3>
<div class="cards">
<div class="card" onclick="startOfflinePvP()">Offline PvP</div>
<div class="card" onclick="startOnlinePvP()">Online PvP</div>
</div>
<button class="btn btn-small primary" onclick="renderHome()"><i class="fas fa-arrow-left"></i> Back</button>
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
  <img src="https://via.placeholder.com/800x300/008080/ffffff?text=T-Gram+Hero" alt="T-Gram Hero Image" class="img-fluid">
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

<button class="btn btn-small primary" onclick="renderLogin()"><i class="fas fa-sign-in-alt"></i> Back to Login</button>
</main>`;
}

// ===== Load Questions =====
window.loadQuestions = async function() {
  if (!window.questions) {
    try {
      const response = await fetch('assets/questions.json');
      if (response.ok) {
        const data = await response.json();
        // Flatten the questions from categories into arrays
        window.questions = {};
        for (const level of ['beginner', 'intermediate', 'advanced']) {
          window.questions[level] = [];
          for (const category in data[level]) {
            window.questions[level].push(...data[level][category]);
          }
        }
      } else {
        throw new Error('Failed to fetch questions.json');
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
      // Fallback questions from sample, mapped to lowercase keys and standard format
      const sampleQuestions = {
        beginner: [
          {id:"b1",question:"She ___ to school every day.",answer:"goes",options:["go","goes","gone"], type: "multiple_choice",explanation:"The verb 'go' in present simple third person singular is 'goes'."},
          {id:"b2",question:"I ___ happy today.",answer:"am",options:["is","are","am"], type: "multiple_choice",explanation:"Use 'am' for first person singular in present continuous or simple present."},
          {id:"b3",question:"They ___ eating lunch.",answer:"are",options:["is","are","was"], type: "multiple_choice",explanation:"'They' is plural, so use 'are' for present continuous."},
          {id:"b4",question:"He ___ a doctor.",answer:"is",options:["is","are","am"], type: "multiple_choice",explanation:"Third person singular uses 'is'."},
          {id:"b5",question:"We ___ playing soccer.",answer:"are",options:["is","are","was"], type: "multiple_choice",explanation:"First person plural uses 'are'."},
          {id:"b6",question:"The cat ___ on the mat.",answer:"is",options:["is","are","am"], type: "multiple_choice",explanation:"Third person singular 'is'."},
          {id:"b7",question:"You ___ my best friend.",answer:"are",options:["is","are","was"], type: "multiple_choice",explanation:"Second person uses 'are'."},
          {id:"b8",question:"It ___ raining outside.",answer:"is",options:["is","are","am"], type: "multiple_choice",explanation:"Third person singular 'is'."},
          {id:"b9",question:"My friends ___ coming over.",answer:"are",options:["is","are","was"], type: "multiple_choice",explanation:"Plural subject uses 'are'."},
          {id:"b10",question:"The book ___ interesting.",answer:"is",options:["is","are","am"], type: "multiple_choice",explanation:"Third person singular 'is'."},
          {id:"b11",question:"Dogs ___ loyal animals.",answer:"are",options:["is","are","was"], type: "multiple_choice",explanation:"Plural 'dogs' uses 'are'."},
          {id:"b12",question:"She ___ singing a song.",answer:"is",options:["is","are","am"], type: "multiple_choice",explanation:"Third person singular 'is'."},
          {id:"b13",question:"We ___ going to the park.",answer:"are",options:["is","are","was"], type: "multiple_choice",explanation:"First person plural 'are'."},
          {id:"b14",question:"The sun ___ shining brightly.",answer:"is",options:["is","are","am"], type: "multiple_choice",explanation:"Third person singular 'is'."},
          {id:"b15",question:"Birds ___ flying in the sky.",answer:"are",options:["is","are","was"], type: "multiple_choice",explanation:"Plural 'birds' uses 'are'."}
        ],
        intermediate: [
          {id:"i1",question:"They ___ playing outside.",answer:"are",options:["is","are","was"], type: "multiple_choice",explanation:"Present continuous for plural."},
          {id:"i2",question:"He has ___ a book.",answer:"read",options:["read","reads","reading"], type: "multiple_choice",explanation:"Present perfect uses past participle 'read'."},
          {id:"i3",question:"She ___ to the store yesterday.",answer:"went",options:["go","went","gone"], type: "multiple_choice",explanation:"Past simple 'went'."},
          {id:"i4",question:"I ___ finished my homework.",answer:"have",options:["has","have","had"], type: "multiple_choice",explanation:"Present perfect 'have' for first person."},
          {id:"i5",question:"They ___ watching TV.",answer:"were",options:["was","were","is"], type: "multiple_choice",explanation:"Past continuous 'were' for plural."},
          {id:"i6",question:"She ___ her homework already.",answer:"has done",options:["has done","have done","did"], type: "multiple_choice",explanation:"Present perfect 'has done'."},
          {id:"i7",question:"We ___ to the beach last summer.",answer:"went",options:["go","went","gone"], type: "multiple_choice",explanation:"Past simple 'went'."},
          {id:"i8",question:"He ___ playing the guitar.",answer:"is",options:["is","are","was"], type: "multiple_choice",explanation:"Present continuous 'is'."},
          {id:"i9",question:"They ___ eaten dinner yet.",answer:"have",options:["has","have","had"], type: "multiple_choice",explanation:"Present perfect 'have'."},
          {id:"i10",question:"The movie ___ at 8 PM.",answer:"starts",options:["start","starts","started"], type: "multiple_choice",explanation:"Third person singular 'starts'."},
          {id:"i11",question:"I ___ my keys at home.",answer:"left",options:["leave","left","leaved"], type: "multiple_choice",explanation:"Past simple 'left'."},
          {id:"i12",question:"She ___ a new car.",answer:"has bought",options:["has bought","have bought","bought"], type: "multiple_choice",explanation:"Present perfect 'has bought'."},
          {id:"i13",question:"We ___ for the bus.",answer:"are waiting",options:["is waiting","are waiting","was waiting"], type: "multiple_choice",explanation:"Present continuous 'are waiting'."},
          {id:"i14",question:"The teacher ___ the lesson.",answer:"is explaining",options:["is explaining","are explaining","was explaining"], type: "multiple_choice",explanation:"Present continuous 'is explaining'."},
          {id:"i15",question:"They ___ to music.",answer:"are listening",options:["is listening","are listening","was listening"], type: "multiple_choice",explanation:"Present continuous 'are listening'."}
        ],
        advanced: [
          {id:"a1",question:"By the time she arrived, he ___ left.",answer:"had",options:["has","had","have"], type: "multiple_choice",explanation:"Past perfect 'had left'."},
          {id:"a2",question:"Identify the error: 'If I was you, I would study.'",answer:"was",options:["was","were","is"], type: "multiple_choice",explanation:"Subjunctive 'were' instead of 'was'."},
          {id:"a3",question:"She would have ___ if she had known.",answer:"come",options:["come","came","comes"], type: "multiple_choice",explanation:"Third conditional uses past participle 'come'."},
          {id:"a4",question:"He ___ the book before the movie.",answer:"had read",options:["has read","had read","read"], type: "multiple_choice",explanation:"Past perfect 'had read'."},
          {id:"a5",question:"They ___ to the party if invited.",answer:"would go",options:["will go","would go","went"], type: "multiple_choice",explanation:"Second conditional 'would go'."},
          {id:"a6",question:"If he ___ harder, he would have passed.",answer:"had studied",options:["has studied","had studied","studied"], type: "multiple_choice",explanation:"Third conditional 'had studied'."},
          {id:"a7",question:"She wishes she ___ the answer.",answer:"knew",options:["know","knew","knows"], type: "multiple_choice",explanation:"Subjunctive 'knew'."},
          {id:"a8",question:"By next year, I ___ here for ten years.",answer:"will have lived",options:["will have lived","will live","have lived"], type: "multiple_choice",explanation:"Future perfect 'will have lived'."},
          {id:"a9",question:"He acted as if he ___ the boss.",answer:"were",options:["was","were","is"], type: "multiple_choice",explanation:"Subjunctive 'were'."},
          {id:"a10",question:"I would rather you ___ smoking.",answer:"stopped",options:["stop","stopped","stopping"], type: "multiple_choice",explanation:"Past subjunctive 'stopped'."},
          {id:"a11",question:"It's high time we ___ the meeting.",answer:"started",options:["start","started","starting"], type: "multiple_choice",explanation:"Subjunctive 'started'."},
          {id:"a12",question:"She suggested that he ___ early.",answer:"leave",options:["leaves","leave","left"], type: "multiple_choice",explanation:"Subjunctive 'leave'."},
          {id:"a13",question:"If only I ___ what to do.",answer:"knew",options:["know","knew","knows"], type: "multiple_choice",explanation:"Subjunctive 'knew'."},
          {id:"a14",question:"They demanded that the rules ___ changed.",answer:"be",options:["is","are","be"], type: "multiple_choice",explanation:"Subjunctive 'be'."},
          {id:"a15",question:"He talks as though he ___ everything.",answer:"knew",options:["know","knew","knows"], type: "multiple_choice",explanation:"Subjunctive 'knew'."}
        ]
      };
      window.questions = sampleQuestions;
    }
  }
  const diffKey = window.selectedDifficulty.toLowerCase();
  // Get used questions from localStorage
  const usedQuestions = JSON.parse(localStorage.getItem('usedQuestions') || '{}');
  if (!usedQuestions[diffKey]) usedQuestions[diffKey] = [];
  // Filter out used questions
  let availableQuestions = window.questions[diffKey].filter(q => !usedQuestions[diffKey].includes(q.id));
  // If less than 5 available, reset used for this difficulty
  if (availableQuestions.length < 5) {
    usedQuestions[diffKey] = [];
    availableQuestions = [...window.questions[diffKey]];
  }
  // Shuffle available
  availableQuestions.sort(() => Math.random() - 0.5);
  window.gameQuestions = availableQuestions;
  window.currentQuestionIndex = 0;
  window.wrongAnswers = [];
};

// ===== Set Timer Duration =====
window.getTimerDuration = function() {
  switch (window.selectedDifficulty) {
    case 'Beginner': return 30; // 30s
    case 'Intermediate': return 25; // 25s
    case 'Advanced': return 20; // 20s
    default: return 10;
  }
};

// ===== Offline PvP Implementation =====
window.board = Array(9).fill(null);
window.currentPlayer = 'X';
window.userScore = 0;
window.opponentName = '';
window.gameQuestions = [];
window.currentQuestionIndex = 0;
window.selectedAnswer = '';
window.wrongAnswers = [];
window.allAnswers = [];
window.badges = JSON.parse(localStorage.getItem('badges')) || [];
window.timerInterval = null;
window.streak = 0;

window.startOfflinePvP = async function() {
  if (!window.selectedDifficulty) {
    window.ModalManager.showAlert("Please select a difficulty first!", 'error');
    return;
  }

  // Reset game state
  window.board = Array(9).fill(null);
  window.currentPlayer = 'X';
  window.userScore = 0;
  window.opponentScore = 0;
  window.currentQuestionIndex = 0;
  window.wrongAnswers = [];
  window.allAnswers = [];
  window.gameQuestions = [];

  await window.loadQuestions();

  window.renderOfflineInterface();
  window.renderBoard();
};

window.renderOfflineInterface = function() {
  document.getElementById('app').innerHTML = `
    <main class="offline-page">
      <div class="gradient-bg">
        <h2 class="page-title">🎓 Grammar Grid</h2>
        <div class="header-flex">
          <div class="players-flex">
            <div class="player-info player-x ${window.currentPlayer === 'X' ? 'active' : ''}">
              <span>Unknown = X</span>
              <span>Score: <span id="user-score">0</span></span>
            </div>
            <div class="player-info player-o ${window.currentPlayer === 'O' ? 'active' : ''}">
              <span>Opponent = O</span>
              <span>Score: <span id="opponent-score">0</span></span>
            </div>
          </div>
        </div>
        <div class="board-grid" id="board"></div>
        <div class="post-game-buttons" id="post-game-buttons" style="display: none;">
          <button class="btn" onclick="window.startOfflinePvP()"><i class="fas fa-redo"></i> Play Again</button>
          <button class="btn" onclick="window.showPostGameReview()"><i class="fas fa-eye"></i> Review Answers</button>
        </div>
        <div class="bottom-buttons">
<button class="btn btn-small primary" onclick="renderHome()">Back to Home</button>
        </div>
      </div>
    </main>
  `;
  // Question modal will be handled dynamically by showQuestion
};

window.renderBoard = function() {
  const boardEl = document.querySelector('#board');
  if (!boardEl) return;
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('board-cell');
    cell.dataset.index = i;
    if (window.board[i]) {
      cell.textContent = window.board[i];
      cell.classList.add(window.board[i].toLowerCase());
    } else {
      cell.addEventListener('click', () => window.attemptMove(i));
    }
    boardEl.appendChild(cell);
  }
};

window.attemptMove = function(index) {
  console.log('Attempting move at index:', index, 'Current board:', window.board);
  if (window.board[index] !== null) return;
  window.currentMoveIndex = index;
  window.showQuestion();
};

window.showQuestion = function() {
  console.log('Showing question for index:', window.currentQuestionIndex, 'Current player:', window.currentPlayer);
  if (window.currentQuestionIndex >= window.gameQuestions.length) {
    console.log('No more questions, placing move directly at index:', window.currentMoveIndex);
    window.ModalManager.showAlert("No more questions! Game continues without questions.", 'info');
    window.placeMove(); // Allow move without question
    return;
  }
  window.currentQuestion = window.gameQuestions[window.currentQuestionIndex];
  window.questionPending = true;

  // Build modal content dynamically
  const title = `Question for ${window.currentPlayer === 'X' ? 'Unknown' : 'Opponent'}`;
  const questionContent = window.currentQuestion.question;
  let optionsHtml = '';
  let inputHtml = '';

  switch (window.currentQuestion.type) {
    case 'multiple_choice':
      optionsHtml = window.currentQuestion.options.map(opt =>
        `<button class="btn option-btn" onclick="window.selectAnswer('${opt.replace(/'/g, "\\'")}')">${opt}</button>`
      ).join('');
      break;
    case 'fill_blank':
    case 'error_identification':
    case 'sentence_completion':
      inputHtml = `
        <label for="answer-input" class="answer-label">Enter your answer:</label>
        <input type="text" id="answer-input" class="answer-input" placeholder="Type your response here..." style="width: 100%; padding: 12px; font-size: 16px; border: 2px solid #ddd; border-radius: 8px; box-sizing: border-box; margin-top: 5px; background-color: #f9f9f9; transition: border-color 0.3s, box-shadow 0.3s;">
      `;
      break;
    case 'paragraph_correction':
      inputHtml = `
        <label for="answer-input" class="answer-label">Correct the paragraph:</label>
        <textarea id="answer-input" class="answer-input" placeholder="Type your corrected version here..." rows="4" style="width: 100%; padding: 12px; font-size: 16px; border: 2px solid #ddd; border-radius: 8px; box-sizing: border-box; margin-top: 5px; background-color: #f9f9f9; transition: border-color 0.3s, box-shadow 0.3s; resize: vertical;"></textarea>
      `;
      break;
  }

  const content = `
    <h3 id="question-title">${title}</h3>
    <div id="question-content">${questionContent}</div>
    <div id="question-options">${optionsHtml || inputHtml}</div>
    <div id="question-feedback" style="display:none;"></div>
    <div class="timer">Time left: <span id="timer-display">${window.getTimerDuration()}</span>s</div>
    <button class="btn btn-small" id="submit-answer" onclick="window.submitAnswer()">Submit</button>
    <button class="btn btn-small secondary" onclick="window.skipQuestion()">Skip (Penalty)</button>
    <div id="tip" class="tip" style="display:none;"></div>
  `;

  window.ModalManager.showModal('question-modal', content, 'info');
  window.startTimer();
};

window.selectAnswer = function(answer) {
  window.selectedAnswer = answer;
};

window.submitAnswer = function() {
  if (!window.questionPending) return;
  window.questionPending = false;

  let userAnswer = '';
  const input = document.getElementById('answer-input');
  if (window.currentQuestion.type === 'multiple_choice') {
    userAnswer = window.selectedAnswer || '';
  } else if (input) {
    userAnswer = input.value.trim();
  }

  const correct = userAnswer.toLowerCase() === window.currentQuestion.answer.toLowerCase();

  if (correct) {
    window.ModalManager.showAlert('Correct! +10 points', 'success');
    window.messages.push({ type: 'success', content: `Correct: ${window.currentQuestion.answer}`, timestamp: Date.now() });
    window.allAnswers.push({
      question: window.currentQuestion.question,
      userAnswer: userAnswer,
      correctAnswer: window.currentQuestion.answer,
      explanation: window.currentQuestion.explanation || 'Great job!',
      isCorrect: true
    });
    window.ModalManager.hideModal('question-modal');
    // Stop timer
    if (window.timerInterval) {
      clearInterval(window.timerInterval);
      window.timerInterval = null;
    }
    if (window.currentPlayer === 'X') {
      window.userScore += 10;
    } else {
      window.opponentScore += 10;
    }
    window.awardBadgeIfEligible();
    window.updateScores();
    window.placeMove();
    window.currentQuestionIndex++;
  } else {
    // Show feedback
    const feedbackHtml = `
      <p><strong>Wrong!</strong></p>
      <p>Correct answer: <strong>${window.currentQuestion.answer}</strong></p>
      <p>Tip: ${window.currentQuestion.explanation || 'Practice more!'}</p>
    `;
    const content = `
      <div id="question-feedback">${feedbackHtml}</div>
      <button class="btn btn-small" onclick="window.continueWrong()">Continue</button>
    `;
    window.ModalManager.showModal('question-modal', content, 'error');

    // Stop timer
    if (window.timerInterval) {
      clearInterval(window.timerInterval);
      window.timerInterval = null;
    }

    window.wrongAnswers.push({...window.currentQuestion, userAnswer});
    window.allAnswers.push({
      question: window.currentQuestion.question,
      userAnswer: userAnswer,
      correctAnswer: window.currentQuestion.answer,
      explanation: window.currentQuestion.explanation || 'Practice more!',
      isCorrect: false
    });
    window.messages.push({ type: 'error', content: `Wrong! Correct: ${window.currentQuestion.answer}. ${window.currentQuestion.explanation || 'Practice more!'}` , timestamp: Date.now() });
  }
};

window.continueWrong = function() {
  window.questionPending = false;
  window.ModalManager.hideModal('question-modal');
  // Stop timer
  if (window.timerInterval) {
    clearInterval(window.timerInterval);
    window.timerInterval = null;
  }
  window.switchPlayer();
  window.currentQuestionIndex++;
};

window.skipQuestion = function() {
  if (!window.questionPending) return;
  window.questionPending = false;
  window.ModalManager.hideModal('question-modal');
  // Stop timer
  if (window.timerInterval) {
    clearInterval(window.timerInterval);
    window.timerInterval = null;
  }
  window.ModalManager.showAlert("Skipped! Turn lost.", 'error');
  window.messages.push({ type: 'error', content: 'Skipped question - turn lost.', timestamp: Date.now() });
  window.allAnswers.push({
    question: window.currentQuestion.question,
    userAnswer: 'Skipped',
    correctAnswer: window.currentQuestion.answer,
    explanation: 'Question was skipped.',
    isCorrect: false
  });
  window.wrongAnswers.push({...window.currentQuestion, userAnswer: 'Skipped'});
  window.switchPlayer();
  window.currentQuestionIndex++;
};



window.placeMove = function() {
  console.log('Placing move for player:', window.currentPlayer, 'at index:', window.currentMoveIndex, 'Board before:', window.board);
  const index = window.currentMoveIndex;
  const boardEl = document.querySelector('#board');
  if (!boardEl || boardEl.children.length < 9) {
    console.error('Board not found or invalid state');
    return;
  }
  const cell = boardEl.children[index];
  cell.textContent = window.currentPlayer;
  cell.classList.add(window.currentPlayer.toLowerCase());
  cell.classList.add('placed');
  // Remove click listener if present
  cell.onclick = null;
  cell.style.pointerEvents = 'none'; // Prevent further interaction

  window.board[index] = window.currentPlayer;
  console.log('Board after place:', window.board);

  const winner = window.checkWinner(window.board);
  console.log('Check winner result:', winner);
  if (winner) {
    console.log('Winner detected:', winner, '- calling endGame');
    window.endGame(winner);
    return;
  }

  if (window.board.every(cell => cell !== null)) {
    console.log('Board full - draw detected');
    window.endGame('draw');
    return;
  }

  console.log('No end - switching player');
  window.switchPlayer();
  window.updateScores();
  // Removed simulation for PvP on same device
};

window.switchPlayer = function() {
  window.currentPlayer = window.currentPlayer === 'X' ? 'O' : 'X';
  // Update active player highlight
  document.querySelectorAll('.player-info').forEach(p => p.classList.remove('active'));
  const activePlayer = document.querySelector(`.player-info:nth-child(${window.currentPlayer === 'X' ? 1 : 2})`);
  if (activePlayer) activePlayer.classList.add('active');
  window.updateScores();
};

window.updateScores = function() {
  const userScoreEl = document.getElementById('user-score');
  const opponentScoreEl = document.getElementById('opponent-score');
  if (userScoreEl) userScoreEl.textContent = window.userScore;
  if (opponentScoreEl) opponentScoreEl.textContent = window.opponentScore;
};

window.checkWinner = function(cells) {
  console.log('Checking winner for cells:', cells);
  const combos = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (const combo of combos) {
    const [a, b, c] = combo;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      console.log('Win combo found:', combo, 'Winner:', cells[a]);
      // Highlight winning line
      combo.forEach(i => {
        const cell = document.querySelector(`[data-index="${i}"]`);
        if (cell) cell.classList.add('win');
      });
      return cells[a];
    }
  }
  console.log('No winner found');
  return null;
};

window.endGame = function(result) {
  console.log('End game called with result:', result);
  try {
    let wins = 0, losses = 0, draws = 0;
    let message = '';
    if (result === 'X') {
      wins = 1;
      message = `Unknown wins! 🎉`;
      if (window.awardBadge) window.awardBadge('victory');
      if (window.messages) window.messages.push({ type: 'success', content: message, timestamp: Date.now() });
    } else if (result === 'O') {
      losses = 1;
      message = `Opponent wins!`;
      if (window.awardBadge) window.awardBadge('defeat');
      if (window.messages) window.messages.push({ type: 'error', content: message, timestamp: Date.now() });
    } else if (result === 'draw') {
      draws = 1;
      message = "It's a draw! 🤝";
      if (window.awardBadge) window.awardBadge('draw');
      if (window.messages) window.messages.push({ type: 'info', content: message, timestamp: Date.now() });
    }

    console.log('Showing alert:', message);
    if (window.ModalManager && window.ModalManager.showAlert) {
      window.ModalManager.showAlert(message, result === 'X' ? 'success' : result === 'O' ? 'error' : 'info');
    } else {
      alert(message); // Fallback
      console.error('ModalManager.showAlert not available');
    }

    // Re-render board to show final state
    if (window.renderBoard) window.renderBoard();
    if (window.updateStreakDisplay) window.updateStreakDisplay();
    if (window.updateScores) window.updateScores();

    // Show post-game buttons
    const postGameButtons = document.getElementById('post-game-buttons');
    console.log('Post-game buttons element:', postGameButtons);
    if (postGameButtons) {
      postGameButtons.style.display = 'flex';
      console.log('Buttons set to display: flex');
    } else {
      console.error('Post-game buttons element not found! Creating fallback.');
      // Fallback: Create buttons if not found
      const boardContainer = document.querySelector('.gradient-bg');
      if (boardContainer) {
        const buttonsDiv = document.createElement('div');
        buttonsDiv.id = 'post-game-buttons';
        buttonsDiv.style.display = 'flex';
        buttonsDiv.innerHTML = `
          <button class="btn" onclick="if (window.startOfflinePvP) window.startOfflinePvP()">Play Again</button>
          <button class="btn" onclick="if (window.showPostGameReview) window.showPostGameReview()">Review Answers</button>
        `;
        boardContainer.appendChild(buttonsDiv);
      }
    }

    // Update local scores safely
    try {
      console.log('Updating local scores...');
      let scores = [];
      try {
        scores = JSON.parse(localStorage.getItem('scores') || '[]');
      } catch (e) {
        console.warn('localStorage parse failed, starting fresh:', e);
        scores = [];
      }
      let userScores = scores.find(s => s.user === 'Unknown');
      if (!userScores) {
        userScores = {user: 'Unknown', wins: 0, losses: 0, draws: 0, totalScore: 0, totalGames: 0};
        scores.push(userScores);
      }
      userScores.wins += (result === 'X' ? 1 : 0);
      userScores.losses += (result === 'O' ? 1 : 0);
      userScores.draws += (result === 'draw' ? 1 : 0);
      userScores.totalGames += 1;
      userScores.totalScore += window.userScore || 0;
      localStorage.setItem('scores', JSON.stringify(scores));
      console.log('Scores updated in localStorage');
    } catch (storageError) {
      console.error('localStorage update failed:', storageError);
      // Continue without breaking
    }

    // Update used questions
    try {
      const usedQuestions = JSON.parse(localStorage.getItem('usedQuestions') || '{}');
      const diffKey = window.selectedDifficulty.toLowerCase();
      if (!usedQuestions[diffKey]) usedQuestions[diffKey] = [];
      const usedIds = window.gameQuestions.slice(0, window.currentQuestionIndex).map(q => q.id);
      usedQuestions[diffKey].push(...usedIds);
      localStorage.setItem('usedQuestions', JSON.stringify(usedQuestions));
      console.log('Used questions updated in localStorage');
    } catch (storageError) {
      console.error('Used questions update failed:', storageError);
    }
  } catch (error) {
    console.error('Error in endGame:', error);
    // Fallback: Force show buttons and alert
    alert(`Game ended: ${result}. Error occurred, but buttons should appear. Check console.`);
    const postGameButtons = document.getElementById('post-game-buttons');
    if (postGameButtons) postGameButtons.style.display = 'flex';
  }
};

window.showPostGameReview = function() {
  const stats = {
    userScore: window.userScore,
    opponentScore: window.opponentScore,
    totalQuestions: window.allAnswers.length,
    correctAnswers: window.allAnswers.filter(a => a.isCorrect).length,
    accuracy: window.allAnswers.length > 0 ? Math.round((window.allAnswers.filter(a => a.isCorrect).length / window.allAnswers.length) * 100) : 0
  };
  window.ModalManager.showReview(window.allAnswers, stats);
};

window.closeQuestion = function() {
  window.questionPending = false;
  window.ModalManager.hideModal('question-modal');
  if (window.timerInterval) {
    clearInterval(window.timerInterval);
    window.timerInterval = null;
  }
};

window.startTimer = function() {
  if (window.timerInterval) {
    clearInterval(window.timerInterval);
    window.timerInterval = null;
  }
  const display = document.getElementById('timer-display');
  let time = window.getTimerDuration();
  display.textContent = time;
  window.timerInterval = setInterval(() => {
    time--;
    display.textContent = time;
    if (time <= 0 && window.questionPending) {
      clearInterval(window.timerInterval);
      window.timerInterval = null;
      window.skipQuestion();
    }
  }, 1000);
};

window.updateStreakDisplay = function() {
  const streakEl = document.getElementById('streak-count');
  if (streakEl) {
    streakEl.textContent = window.streak;
    // Simple animation for streak
    streakEl.style.transform = 'scale(1.2)';
    setTimeout(() => streakEl.style.transform = 'scale(1)', 200);
  }
};

window.awardBadgeIfEligible = function() {
  const badgeTypes = {
    'tense_master': window.streak >= 5 && window.selectedDifficulty === 'Beginner',
    'clause_crusher': window.userScore >= 50 && window.selectedDifficulty === 'Advanced',
    'grammar_veteran': (window.badges.filter(b => b.type === 'victory').length + 1) % 10 === 0
  };
  for (const [type, condition] of Object.entries(badgeTypes)) {
    if (condition && !window.badges.some(b => b.type === type)) {
      window.awardBadge(type);
    }
  }
};

window.awardBadge = function(type) {
  const badge = { type, difficulty: window.selectedDifficulty, date: new Date().toISOString() };
  window.badges.push(badge);
  localStorage.setItem('badges', JSON.stringify(window.badges));
  window.ModalManager.showAlert(`Badge awarded: ${type.replace('_', ' ').toUpperCase()}! 🏆`, 'success');
  window.messages.push({ type: 'success', content: `Badge: ${type.replace('_', ' ').toUpperCase()}`, timestamp: Date.now() });
};


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
window.addEventListener('DOMContentLoaded', () => {
  renderLogin();
});
