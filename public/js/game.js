let difficulty = "Beginner";
let board = [], currentPlayer = "X", selectedCellIndex = 0, timer, windowTimer;
let score = 0, level = 1, totalCorrect = 0, totalQuestions = 0;

const sampleQuestions = {
  Beginner: [
    {q:"She ___ to school every day.",a:"goes",options:["go","goes","gone"]},
    {q:"I ___ happy today.",a:"am",options:["is","are","am"]},
    {q:"They ___ eating lunch.",a:"are",options:["is","are","was"]},
    {q:"He ___ a doctor.",a:"is",options:["is","are","am"]},
    {q:"We ___ playing soccer.",a:"are",options:["is","are","was"]}
  ],
  Intermediate: [
    {q:"They ___ playing outside.",a:"are",options:["is","are","was"]},
    {q:"He has ___ a book.",a:"read",options:["read","reads","reading"]},
    {q:"She ___ to the store yesterday.",a:"went",options:["go","went","gone"]},
    {q:"I ___ finished my homework.",a:"have",options:["has","have","had"]},
    {q:"They ___ watching TV.",a:"were",options:["was","were","is"]}
  ],
  Advanced: [
    {q:"By the time she arrived, he ___ left.",a:"had",options:["has","had","have"]},
    {q:"Identify the error: 'If I was you, I would study.'",a:"was",options:["was","were","is"]},
    {q:"She would have ___ if she had known.",a:"come",options:["come","came","comes"]},
    {q:"He ___ the book before the movie.",a:"had read",options:["has read","had read","read"]},
    {q:"They ___ to the party if invited.",a:"would go",options:["will go","would go","went"]}
  ]
};

function startGame(diff){ 
  if(selectedDifficulty) {
    difficulty = selectedDifficulty; 
    startOfflinePvP(); 
  } else {
    alert('Please select a difficulty first');
  }
}

function startOfflinePvP(){
  if(!selectedDifficulty) {
    alert('Please select a difficulty first');
    return;
  }
  difficulty = selectedDifficulty;
  board = ["","","","","","","","",""];
  currentPlayer = "X";
  score = 0;
  level = 1;
  totalCorrect = 0;
  totalQuestions = 0;
  document.getElementById('app').innerHTML = `<div class="board-container">
<h2>Offline PvP - ${difficulty}</h2>
<div class="score-display">Score: <span id="score">0</span> | Level: <span id="level">1</span> | Accuracy: <span id="accuracy">0%</span></div>
<div class="board" id="board"></div>
<button class="btn" onclick="renderHome()">Exit</button>
</div>`;
  renderBoard();
  updateScoreDisplay();
  // Update user stats
  currentUser.totalGames = (currentUser.totalGames || 0) + 1;
  currentUser.totalScore = (currentUser.totalScore || 0) + score;
  currentUser.totalQuestions = (currentUser.totalQuestions || 0) + totalQuestions;
  currentUser.totalCorrect = (currentUser.totalCorrect || 0) + totalCorrect;
  let idx = users.findIndex(u => u.email === currentUser.email);
  if(idx !== -1) users[idx] = currentUser;
  localStorage.setItem('users', JSON.stringify(users));
}

function renderBoard(){
  const boardDiv = document.getElementById('board');
  boardDiv.innerHTML = "";
  for(let i=0;i<9;i++){
    let cell = document.createElement('div');
    cell.classList.add('cell');
    cell.onclick = () => promptGrammar(i);
    boardDiv.appendChild(cell);
  }
}

function promptGrammar(i){
  if(board[i] !== "") return;
  selectedCellIndex = i;
  const questions = sampleQuestions[difficulty];
  const q = questions[Math.floor(Math.random() * questions.length)];
  document.getElementById('questionText').innerText = q.q;
  const container = document.getElementById('optionsContainer');
  container.innerHTML = "";
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.innerText = opt;
    btn.onclick = () => answerQuestion(opt,q.a);
    container.appendChild(btn);
  });
  const hintBtn = document.createElement('button');
  hintBtn.innerText = 'Hint';
  hintBtn.onclick = () => showHint(q.a);
  container.appendChild(hintBtn);
  document.getElementById('timerDisplay').innerText = 30;
  document.getElementById('timerModal').classList.add('show');
  timer = 30;
  clearInterval(windowTimer);
  windowTimer = setInterval(()=>{
    timer--;
    document.getElementById('timerDisplay').innerText = timer;
    if(timer <= 0) skipQuestion();
  },1000);
}

function answerQuestion(answer,correct){
  clearInterval(windowTimer);
  document.getElementById('timerModal').classList.remove('show');
  const cell = document.getElementById('board').children[selectedCellIndex];
  totalQuestions++;
  if(answer === correct){
    board[selectedCellIndex] = currentPlayer;
    cell.innerText = currentPlayer;
    cell.classList.add(currentPlayer);
    cell.style.backgroundColor='lightgreen';
    setTimeout(()=>{cell.style.backgroundColor='';},500);
    score += 10;
    totalCorrect++;
    playSound('success');
  } else {
    cell.style.backgroundColor='salmon';
    setTimeout(()=>{cell.style.backgroundColor='';},500);
    alert("Incorrect! Turn skipped.");
    playSound('fail');
  }
  updateScoreDisplay();
  if(checkWin()) return;
  currentPlayer = currentPlayer === "X" ? "O" : "X";
}

function skipQuestion(){
  clearInterval(windowTimer);
  document.getElementById('timerModal').classList.remove('show');
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  alert("Time's up! Turn skipped.");
}

function checkWin(){
  const combos=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  let winnerCombo = combos.find(([a,b,c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
  if(winnerCombo){
    winnerCombo.forEach(i=>document.getElementById('board').children[i].classList.add('win'));
    addScore(currentUser.username);
    setTimeout(()=>renderHome(),1500);
    return true;
  }
  if(board.every(c => c !== "")){ alert("Draw!"); renderHome(); return true; }
  return false;
}

function startOnlinePvP(){
  if(!selectedDifficulty) {
    alert('Please select a difficulty first');
    return;
  }
  difficulty = selectedDifficulty;
  // Initialize online game
  const gameId = generateGameId();
  document.getElementById('app').innerHTML = `<div class="board-container">
<h2>Online PvP - ${difficulty}</h2>
<div class="board" id="board"></div>
<p>Game ID: ${gameId}</p>
<button class="btn" onclick="renderHome()">Exit</button>
</div>`;
  renderBoard();
  // Listen to Firestore for game updates
  listenToGame(gameId);
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
        alert(`Winner: ${data.winner}`);
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
  checkAchievements();
}

function playSound(type){
  // Placeholder for sound effects
  console.log(type + ' sound played');
}

function showHint(correct){
  alert('Hint: The correct answer is ' + correct);
}

let achievements = [];
function checkAchievements(){
  if(score >= 100 && !achievements.includes('First Century')) {
    achievements.push('First Century');
    alert('Achievement Unlocked: First Century!');
  }
  if(totalCorrect >= 10 && !achievements.includes('Grammar Master')) {
    achievements.push('Grammar Master');
    alert('Achievement Unlocked: Grammar Master!');
  }
}
