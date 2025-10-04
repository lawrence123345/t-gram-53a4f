// Firebase disabled for offline mode
// import { auth, db, rtdb } from './config.js';
// import { doc, setDoc, onSnapshot, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
// import { ref, set, onValue, update, onDisconnect } from 'firebase/database';

let difficulty = "Beginner";
let board = [], currentPlayer = "X", selectedCellIndex = 0, timer, windowTimer;
let score = 0, level = 1, totalCorrect = 0, totalQuestions = 0, totalTime = 0;
let playerX = { name: "Player X", score: 0, wins: 0, losses: 0, draws: 0, streak: 0, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PlayerX" };
let playerO = { name: "Player O", score: 0, wins: 0, losses: 0, draws: 0, streak: 0, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PlayerO" };
let moveHistory = [];
let gameId = null, isOnline = false, playerId = null, chatMessages = [];
let matchmakingQueue = null, gameRef = null, playerRef = null;

const sampleQuestions = {
  Beginner: [
    {q:"She ___ to school every day.",a:"goes",options:["go","goes","gone"]},
    {q:"I ___ happy today.",a:"am",options:["is","are","am"]},
    {q:"They ___ eating lunch.",a:"are",options:["is","are","was"]},
    {q:"He ___ a doctor.",a:"is",options:["is","are","am"]},
    {q:"We ___ playing soccer.",a:"are",options:["is","are","was"]},
    {q:"The cat ___ on the mat.",a:"is",options:["is","are","am"]},
    {q:"You ___ my best friend.",a:"are",options:["is","are","was"]},
    {q:"It ___ raining outside.",a:"is",options:["is","are","am"]},
    {q:"My friends ___ coming over.",a:"are",options:["is","are","was"]},
    {q:"The book ___ interesting.",a:"is",options:["is","are","am"]},
    {q:"Dogs ___ loyal animals.",a:"are",options:["is","are","was"]},
    {q:"She ___ singing a song.",a:"is",options:["is","are","am"]},
    {q:"We ___ going to the park.",a:"are",options:["is","are","was"]},
    {q:"The sun ___ shining brightly.",a:"is",options:["is","are","am"]},
    {q:"Birds ___ flying in the sky.",a:"are",options:["is","are","was"]}
  ],
  Intermediate: [
    {q:"They ___ playing outside.",a:"are",options:["is","are","was"]},
    {q:"He has ___ a book.",a:"read",options:["read","reads","reading"]},
    {q:"She ___ to the store yesterday.",a:"went",options:["go","went","gone"]},
    {q:"I ___ finished my homework.",a:"have",options:["has","have","had"]},
    {q:"They ___ watching TV.",a:"were",options:["was","were","is"]},
    {q:"She ___ her homework already.",a:"has done",options:["has done","have done","did"]},
    {q:"We ___ to the beach last summer.",a:"went",options:["go","went","gone"]},
    {q:"He ___ playing the guitar.",a:"is",options:["is","are","was"]},
    {q:"They ___ eaten dinner yet.",a:"have",options:["has","have","had"]},
    {q:"The movie ___ at 8 PM.",a:"starts",options:["start","starts","started"]},
    {q:"I ___ my keys at home.",a:"left",options:["leave","left","leaved"]},
    {q:"She ___ a new car.",a:"has bought",options:["has bought","have bought","bought"]},
    {q:"We ___ for the bus.",a:"are waiting",options:["is waiting","are waiting","was waiting"]},
    {q:"The teacher ___ the lesson.",a:"is explaining",options:["is explaining","are explaining","was explaining"]},
    {q:"They ___ to music.",a:"are listening",options:["is listening","are listening","was listening"]}
  ],
  Advanced: [
    {q:"By the time she arrived, he ___ left.",a:"had",options:["has","had","have"]},
    {q:"Identify the error: 'If I was you, I would study.'",a:"was",options:["was","were","is"]},
    {q:"She would have ___ if she had known.",a:"come",options:["come","came","comes"]},
    {q:"He ___ the book before the movie.",a:"had read",options:["has read","had read","read"]},
    {q:"They ___ to the party if invited.",a:"would go",options:["will go","would go","went"]},
    {q:"If he ___ harder, he would have passed.",a:"had studied",options:["has studied","had studied","studied"]},
    {q:"She wishes she ___ the answer.",a:"knew",options:["know","knew","knows"]},
    {q:"By next year, I ___ here for ten years.",a:"will have lived",options:["will have lived","will live","have lived"]},
    {q:"He acted as if he ___ the boss.",a:"were",options:["was","were","is"]},
    {q:"I would rather you ___ smoking.",a:"stopped",options:["stop","stopped","stopping"]},
    {q:"It's high time we ___ the meeting.",a:"started",options:["start","started","starting"]},
    {q:"She suggested that he ___ early.",a:"leave",options:["leaves","leave","left"]},
    {q:"If only I ___ what to do.",a:"knew",options:["know","knew","knows"]},
    {q:"They demanded that the rules ___ changed.",a:"be",options:["is","are","be"]},
    {q:"He talks as though he ___ everything.",a:"knew",options:["know","knew","knows"]}
  ]
};

window.sendChatMessage = function() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if(message){
    chatMessages.push({ player: playerId, message: message, timestamp: Date.now() });
    update(gameRef, { chat: chatMessages });
    input.value = '';
  }
}

// Make functions global so they can be called from app.js
window.startOnlinePvP = async function(){
  if(!window.selectedDifficulty) {
    window.ModalManager.showAlert('Please select a difficulty first', 'error');
    window.messages.push({ type: 'error', content: 'Please select a difficulty first', timestamp: Date.now() });
    return;
  }
  difficulty = window.selectedDifficulty;
  isOnline = true;
  playerId = window.auth.currentUser ? window.auth.currentUser.uid : 'guest_' + Math.random().toString(36).substr(2,9);
  document.getElementById('app').innerHTML = `<div class="board-container">
<h2>Online PvP - ${difficulty}</h2>
<div class="player-avatars">
  <div class="avatar-container" id="playerX-avatar">
    <img src="${playerX.avatar}" alt="Player X" class="avatar">
    <p id="playerX-name">${playerX.name}: ${playerX.score}</p>
  </div>
  <div class="avatar-container" id="playerO-avatar">
    <img src="${playerO.avatar}" alt="Player O" class="avatar">
    <p id="playerO-name">${playerO.name}: ${playerO.score}</p>
  </div>
</div>
<div class="score-display">Score: <span id="score">0</span> | Level: <span id="level">1</span> | Accuracy: <span id="accuracy">0%</span></div>
<div class="board" id="board"></div>
<div class="timer-bar" id="timer-bar"></div>
<div class="chat-container">
  <h3>Chat</h3>
  <div class="chat-messages" id="chat-messages"></div>
  <input type="text" id="chat-input" placeholder="Type a message...">
  <button class="btn btn-small" onclick="sendChatMessage()">Send</button>
</div>
<div class="mini-leaderboard">
  <h3>Session Stats</h3>
  <p id="mini-leaderboard-content">Waiting for opponent...</p>
</div>
<div class="move-history">
  <h3>Move History</h3>
  <ul id="move-list"></ul>
</div>
<button class="btn btn-small" onclick="renderHome()">Exit</button>
</div>`;
  renderBoard();
  updateScoreDisplay();
  await joinMatchmaking();
}

async function joinMatchmaking(){
  matchmakingQueue = ref(rtdb, `matchmaking/${difficulty}`);
  playerRef = ref(rtdb, `players/${playerId}`);
  set(playerRef, {
    name: playerX.name,
    avatar: playerX.avatar,
    status: 'waiting',
    difficulty: difficulty,
    timestamp: Date.now()
  });
  onDisconnect(playerRef).remove();
  onValue(matchmakingQueue, (snapshot) => {
    const players = snapshot.val();
    if(players && Object.keys(players).length >= 2){
      const playerIds = Object.keys(players);
      const opponentId = playerIds.find(id => id !== playerId);
      if(opponentId){
        startGameWithOpponent(opponentId);
      }
    }
  });
}

async function startGameWithOpponent(opponentId){
  gameId = generateGameId();
  gameRef = ref(rtdb, `games/${gameId}`);
  const opponentRef = ref(rtdb, `players/${opponentId}`);
  onValue(opponentRef, (snapshot) => {
    const opponent = snapshot.val();
    if(opponent){
      playerO.name = opponent.name;
      playerO.avatar = opponent.avatar;
      document.getElementById('playerO-name').innerText = `${playerO.name}: ${playerO.score}`;
      document.getElementById('playerO-avatar').querySelector('img').src = playerO.avatar;
    }
  });
  set(gameRef, {
    board: ["","","","","","","","",""],
    currentPlayer: "X",
    playerX: playerId,
    playerO: opponentId,
    difficulty: difficulty,
    status: 'active',
    timer: 30,
    chat: [],
    timestamp: Date.now()
  });
  update(playerRef, { status: 'playing', gameId: gameId });
  update(opponentRef, { status: 'playing', gameId: gameId });
  listenToGameUpdates();
  startTimer();
}

function listenToGameUpdates(){
  onValue(gameRef, (snapshot) => {
    const game = snapshot.val();
    if(game){
      board = game.board;
      currentPlayer = game.currentPlayer;
      updateBoard(board);
      updateAvatarGlow();
      updateTimer(game.timer);
      if(game.chat){
        chatMessages = game.chat;
        updateChat();
      }
      if(game.winner){
        if(game.winner === 'Draw'){
          window.ModalManager.showAlert('Draw!', 'info');
          window.messages.push({ type: 'info', content: 'Draw!', timestamp: Date.now() });
        } else {
          window.ModalManager.showAlert(`Winner: ${game.winner}`, 'success');
          window.messages.push({ type: 'success', content: `Winner: ${game.winner}`, timestamp: Date.now() });
        }
        renderHome();
      }
    }
  });
}

function updateTimer(time){
  const timerBar = document.getElementById('timer-bar');
  if(timerBar){
    timerBar.style.width = `${(time / 30) * 100}%`;
    timerBar.style.backgroundColor = time <= 10 ? 'red' : time <= 20 ? 'yellow' : 'green';
  }
}

function startTimer(){
  setInterval(() => {
    if(gameRef){
      update(gameRef, { timer: 30 });
    }
  }, 30000);
}

function updateChat(){
  const chatDiv = document.getElementById('chat-messages');
  if(chatDiv){
    chatDiv.innerHTML = chatMessages.map(msg => `<p><strong>${msg.player === playerId ? 'You' : 'Opponent'}:</strong> ${msg.message}</p>`).join('');
    chatDiv.scrollTop = chatDiv.scrollHeight;
  }
}

function generateGameId(){
  return 'game_' + Math.random().toString(36).substr(2,9);
}

function listenToGame(gameId){
  const gameRef = firebase.firestore().collection('games').doc(gameId);
  gameRef.onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data();
      updateBoard(data.board);
      currentPlayer = data.turn;
      if (data.winner) {
        window.ModalManager.showAlert(`Winner: ${data.winner}`, 'success');
        window.messages.push({ type: 'success', content: `Winner: ${data.winner}`, timestamp: Date.now() });
        renderHome();
      }
    }
  });
}

function updateBoard(newBoard){
  board = newBoard;
  const boardDiv = document.getElementById('board');
  for(let i=0;i<9;i++){
    boardDiv.children[i].innerText = board[i];
    boardDiv.children[i].classList.toggle('X', board[i] === 'X');
    boardDiv.children[i].classList.toggle('O', board[i] === 'O');
  }
}

function updateScoreDisplay(){
  document.getElementById('score').innerText = score;
  level = Math.floor(score / 50) + 1;
  document.getElementById('level').innerText = level;
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  document.getElementById('accuracy').innerText = accuracy + '%';
  updateGameStats();
  checkAchievements();
}

function playSound(type){
  // Placeholder for sound effects
  console.log(type + ' sound played');
}

function showHint(correct){
  window.ModalManager.showAlert('Hint: The correct answer is ' + correct, 'info');
  window.messages.push({ type: 'info', content: 'Hint: The correct answer is ' + correct, timestamp: Date.now() });
}



function updateMiniLeaderboard(){
  const miniLeaderboard = document.querySelector('.mini-leaderboard');
  miniLeaderboard.innerHTML = `<h3>Session Stats</h3>
  <p>Player X: Wins: ${playerX.wins}, Streak: ${playerX.streak}</p>
  <p>Player O: Wins: ${playerO.wins}, Streak: ${playerO.streak}</p>`;
}

function updateMoveHistory(){
  const moveList = document.getElementById('move-list');
  moveList.innerHTML = moveHistory.map(move => `<li>${move}</li>`).join('');
}

function updateAvatarGlow(){
  const containers = document.querySelectorAll('.avatar-container');
  containers.forEach(container => {
    container.classList.remove('active');
  });
  if(containers.length >= 2){
    if(currentPlayer === 'X'){
      containers[0].classList.add('active');
    } else {
      containers[1].classList.add('active');
    }
  }
}