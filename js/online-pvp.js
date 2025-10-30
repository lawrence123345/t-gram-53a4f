// Online PvP System for T-Gram
// Handles matchmaking, real-time sync, gameplay, and chat

// Global variables for online PvP
window.onlineRoomId = null;
window.isHost = false;
window.opponentName = '';
window.onlineGameActive = false;
window.roomListener = null;
window.chatMessages = [];

window.startOnlinePvP = async function() {
  console.log('startOnlinePvP called, isOnline:', window.isOnline, 'currentUser:', window.currentUser);
  
  if (!window.isOnline) {
    window.ModalManager.showAlert('⚠️ You are offline. Online PvP is unavailable. Please use Offline PvP instead.', 'error');
    return;
  }

  if (!window.currentUser) {
    window.ModalManager.showAlert('Please log in to play Online PvP.', 'error');
    return;
  }

  // Show connecting status
  document.getElementById('app').innerHTML = `
    <main class="online-pvp">
      <div class="gradient-bg">
        <h2 class="page-title">🌐 Online PvP</h2>
        <div class="status-message">
          <div class="spinner"></div>
          <p>🔄 Connecting to online match...</p>
        </div>
        <button class="btn btn-small secondary" onclick="window.cancelOnlineMatchmaking()">Cancel</button>
      </div>
    </main>
  `;

  try {
    console.log('Loading questions...');
    // Load questions first
    await window.loadQuestions();

    console.log('Initializing online achievements...');
    // Initialize online achievements
    await window.initOnlineAchievements(window.currentUser.uid);

    console.log('Finding or creating room...');
    // Find or create room
    const roomData = await findOrCreateRoom();

    if (roomData) {
      window.onlineRoomId = roomData.roomId;
      window.isHost = roomData.isHost;
      console.log('Room setup successful:', roomData);

      // Show waiting status
      document.querySelector('.status-message p').textContent = '🕓 Waiting for another player...';

      // Listen for room changes
      setupRoomListener();

      // Set matchmaking timeout (30 seconds)
      window.matchmakingTimeout = setTimeout(() => {
        if (!window.onlineGameActive) {
          window.cancelOnlineMatchmaking();
          window.ModalManager.showAlert('No opponent found within 30 seconds. Please try again.', 'info');
        }
      }, 30000);
    } else {
      throw new Error('Failed to create or join room');
    }
  } catch (error) {
    console.error('Error starting online PvP:', error);
    console.error('Error details:', error.code, error.message);
    window.ModalManager.showAlert('Failed to connect to online match. Please try again.', 'error');
    window.renderHome();
  }
};

async function findOrCreateRoom() {
  try {
    console.log('Starting findOrCreateRoom for user:', window.currentUser?.uid);
    
    // Look for waiting room
    console.log('Querying waiting rooms...');
    const waitingRooms = await window.db.collection('rooms')
      .where('status', '==', 'waiting')
      .limit(1)
      .get();
    
    console.log('Waiting rooms query result:', waitingRooms.empty ? 'No waiting rooms' : 'Found waiting room');
    
    if (!waitingRooms.empty) {
      // Join existing room
      const roomDoc = waitingRooms.docs[0];
      const roomId = roomDoc.id;
      const roomData = roomDoc.data();
      console.log('Joining room:', roomId, 'Data:', roomData);
      
      // Update room with player2
      console.log('Updating room with player2...');
      await window.db.collection('rooms').doc(roomId).update({
        player2: {
          uid: window.currentUser.uid,
          username: window.currentUser.username || window.currentUser.email,
          score: 0
        },
        status: 'active',
        lastActivity: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('Room updated successfully');
      
      return { roomId, isHost: false };
    } else {
      // Create new room
      console.log('Creating new room...');
      const roomData = {
        player1: {
          uid: window.currentUser.uid,
          username: window.currentUser.username || window.currentUser.email,
          score: 0
        },
        player2: null,
        status: 'waiting',
        board: Array(9).fill(null),
        currentPlayer: 'X',
        currentQuestionIndex: 0,
        gameQuestions: [],
        allAnswers: [],
        chat: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastActivity: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      const roomRef = await window.db.collection('rooms').add(roomData);
      console.log('New room created with ID:', roomRef.id);
      return { roomId: roomRef.id, isHost: true };
    }
  } catch (error) {
    console.error('Error finding or creating room:', error);
    console.error('Error details:', error.code, error.message);
    return null;
  }
}

// Set up real-time listener for room changes
function setupRoomListener() {
  window.roomListener = window.db.collection('rooms').doc(window.onlineRoomId)
    .onSnapshot((doc) => {
      if (doc.exists) {
        const roomData = doc.data();
        handleRoomUpdate(roomData);
      } else {
        // Room deleted
        window.ModalManager.showAlert('Match cancelled by opponent.', 'info');
        cleanupOnlineGame();
        window.renderHome();
      }
    }, (error) => {
      console.error('Room listener error:', error);
      cleanupOnlineGame();
      window.renderHome();
    });
}

// Handle room data updates
function handleRoomUpdate(roomData) {
  if (roomData.status === 'waiting') {
    // Still waiting
    return;
  }
  
  if (roomData.status === 'active') {
    if (!window.onlineGameActive) {
      // Match found, start game
      startOnlineGame(roomData);
    } else {
      // Update game state
      updateOnlineGameState(roomData);
    }
  }
  
  if (roomData.status === 'finished') {
    // Game ended
    endOnlineGame(roomData);
  }
}

// Start the online game
async function startOnlineGame(roomData) {
  window.onlineGameActive = true;
  
  // Determine opponent
  const opponent = window.isHost ? roomData.player2 : roomData.player1;
  window.opponentName = opponent.username;
  
  // Load questions
  await window.loadQuestions();
  
  // Initialize game state
  window.board = roomData.board || Array(9).fill(null);
  window.currentPlayer = roomData.currentPlayer || 'X';
  window.userScore = window.isHost ? roomData.player1.score : roomData.player2.score;
  window.opponentScore = window.isHost ? roomData.player2.score : roomData.player1.score;
  window.currentQuestionIndex = roomData.currentQuestionIndex || 0;
  window.gameQuestions = roomData.gameQuestions || window.gameQuestions;
  window.allAnswers = roomData.allAnswers || [];
  
  // Render online interface
  renderOnlineInterface();
  
  // Show match found message
  window.ModalManager.showAlert(`✅ Opponent found! Starting match against ${window.opponentName}...`, 'success');
}

// Render online PvP interface
function renderOnlineInterface() {
  document.getElementById('app').innerHTML = `
    <main class="online-page">
      <div class="gradient-bg">
        <h2 class="page-title">🌐 Online PvP vs ${window.opponentName}</h2>
        <div class="header-flex">
          <div class="players-flex">
            <div class="player-info player-x ${window.currentPlayer === 'X' ? 'active' : ''}">
              <span>${window.currentUser.username || window.currentUser.email} = X</span>
              <span>Score: <span id="user-score">${window.userScore}</span></span>
            </div>
            <div class="player-info player-o ${window.currentPlayer === 'O' ? 'active' : ''}">
              <span>${window.opponentName} = O</span>
              <span>Score: <span id="opponent-score">${window.opponentScore}</span></span>
            </div>
          </div>
        </div>
        <div class="board-grid" id="board"></div>
        <div class="chat-section">
          <div class="chat-messages" id="chat-messages"></div>
          <div class="chat-input">
            <input type="text" id="chat-input" placeholder="Type a message..." maxlength="100">
            <button class="btn btn-small" onclick="window.sendChatMessage()">Send</button>
          </div>
        </div>
        <div class="bottom-buttons">
          <button class="btn btn-small primary" onclick="window.handleBackToHome()">Back to Home</button>
        </div>
      </div>
    </main>
  `;
  
  // Render board
  renderOnlineBoard();
  
  // Render initial chat
  renderChat();
}

// Render the online board
function renderOnlineBoard() {
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
      // Only allow moves if it's the player's turn
      const isPlayerTurn = (window.isHost && window.currentPlayer === 'X') || (!window.isHost && window.currentPlayer === 'O');
      if (isPlayerTurn) {
        cell.addEventListener('click', () => attemptOnlineMove(i));
      }
    }
    boardEl.appendChild(cell);
  }
}

// Attempt a move in online game
async function attemptOnlineMove(index) {
  if (window.board[index] !== null) return;
  
  // Check if it's player's turn
  const isPlayerTurn = (window.isHost && window.currentPlayer === 'X') || (!window.isHost && window.currentPlayer === 'O');
  if (!isPlayerTurn) {
    window.ModalManager.showAlert('It\'s not your turn!', 'info');
    return;
  }
  
  window.currentMoveIndex = index;
  window.showQuestion();
}

// Override submitAnswer for online
window.submitAnswer = async function() {
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
    
    // Update score
    if (window.isHost) {
      window.userScore += 10;
    } else {
      window.opponentScore += 10;
    }
    
    window.ModalManager.hideModal('question-modal');
    if (window.timerInterval) {
      clearInterval(window.timerInterval);
      window.timerInterval = null;
    }
    
    // Sync move to Firestore
    await syncOnlineMove();
    window.currentQuestionIndex++;
  } else {
    // Wrong answer handling
    const feedbackHtml = `
      <p><strong>Wrong!</strong></p>
      <p>Correct answer: <strong>${window.currentQuestion.answer}</strong></p>
      <p>Tip: ${window.currentQuestion.explanation || 'Practice more!'}</p>
    `;
    const content = `
      <div id="question-feedback">${feedbackHtml}</div>
      <button class="btn btn-small" onclick="window.continueWrongOnline()">Continue</button>
    `;
    window.ModalManager.showModal('question-modal', content, 'error');

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
  }
};

// Continue after wrong answer in online
window.continueWrongOnline = function() {
  window.questionPending = false;
  window.ModalManager.hideModal('question-modal');
  // Switch player and sync
  switchOnlinePlayer();
};

// Sync move to Firestore
async function syncOnlineMove() {
  try {
    const updateData = {
      board: window.board,
      currentPlayer: window.currentPlayer,
      currentQuestionIndex: window.currentQuestionIndex,
      gameQuestions: window.gameQuestions,
      allAnswers: window.allAnswers,
      lastActivity: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (window.isHost) {
      updateData.player1 = { ...updateData.player1, score: window.userScore };
    } else {
      updateData.player2 = { ...updateData.player2, score: window.opponentScore };
    }
    
    await window.db.collection('rooms').doc(window.onlineRoomId).update(updateData);
  } catch (error) {
    console.error('Error syncing move:', error);
  }
}

// Switch player in online game
function switchOnlinePlayer() {
  window.currentPlayer = window.currentPlayer === 'X' ? 'O' : 'X';
  // Sync the switch
  syncOnlineMove();
}

// Update game state from Firestore
function updateOnlineGameState(roomData) {
  window.board = roomData.board;
  window.currentPlayer = roomData.currentPlayer;
  window.currentQuestionIndex = roomData.currentQuestionIndex;
  window.gameQuestions = roomData.gameQuestions;
  window.allAnswers = roomData.allAnswers;
  
  // Update scores
  if (window.isHost) {
    window.userScore = roomData.player1.score;
    window.opponentScore = roomData.player2.score;
  } else {
    window.userScore = roomData.player2.score;
    window.opponentScore = roomData.player1.score;
  }
  
  // Update UI
  document.getElementById('user-score').textContent = window.userScore;
  document.getElementById('opponent-score').textContent = window.opponentScore;
  renderOnlineBoard();
  
  // Update chat
  if (roomData.chat && roomData.chat !== window.chatMessages) {
    window.chatMessages = roomData.chat;
    renderChat();
  }
  
  // Check for winner
  const winner = window.checkWinner(window.board);
  if (winner) {
    endOnlineGame(roomData, winner);
  } else if (window.board.every(cell => cell !== null)) {
    endOnlineGame(roomData, 'draw');
  }
}

// End online game
async function endOnlineGame(roomData, result = null) {
  window.onlineGameActive = false;
  
  // Determine winner
  let winner = result;
  if (!winner) {
    winner = window.checkWinner(roomData.board);
    if (!winner && roomData.board.every(cell => cell !== null)) {
      winner = 'draw';
    }
  }
  
  // Determine if current user won
  let userWon = false;
  let pointsEarned = 0;
  
  if (window.isHost) {
    if (winner === 'X') {
      userWon = true;
      pointsEarned = roomData.player1.score;
    }
  } else {
    if (winner === 'O') {
      userWon = true;
      pointsEarned = roomData.player2.score;
    }
  }
  
  // Update online achievements
  await window.updateOnlineAchievements(window.currentUser.uid, winner, pointsEarned, userWon);
  
  // Upload winner's score to leaderboard (only if won)
  if (userWon) {
    await addOnlineScore(window.currentUser.uid, window.currentUser.username || window.currentUser.email, pointsEarned);
  }
  
  // Update room status
  await window.db.collection('rooms').doc(window.onlineRoomId).update({
    status: 'finished',
    winner: winner,
    finishedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  // Show result
  let message = '';
  if (userWon) {
    message = '🏆 You Win!';
  } else if (winner === 'draw') {
    message = '🤝 It\'s a draw!';
  } else {
    message = '😢 You Lost.';
  }
  
  window.ModalManager.showAlert(message, userWon ? 'success' : winner === 'draw' ? 'info' : 'error');
  
  // Re-render board to show final state
  renderOnlineBoard();
  
  // Show post-game buttons
  const buttonsHtml = `
    <div class="post-game-buttons" id="post-game-buttons">
      <button class="btn" onclick="window.startOnlinePvP()">Play Again</button>
      <button class="btn" onclick="window.renderHome()">Back to Home</button>
    </div>
  `;
  document.querySelector('.bottom-buttons').innerHTML = buttonsHtml;
  
  // Cleanup
  cleanupOnlineGame();
}

// Add online score to leaderboard
async function addOnlineScore(uid, username, points) {
  try {
    const userDocRef = window.db.collection('scores').doc(uid);
    const userDoc = await userDocRef.get();
    let playerData;
    
    if (userDoc.exists) {
      playerData = userDoc.data();
      playerData.wins = (playerData.wins || 0) + 1;
      playerData.totalGames = (playerData.totalGames || 0) + 1;
      playerData.totalCorrect = (playerData.totalCorrect || 0) + Math.floor(points / 10); // Assuming 10 points per correct answer
      playerData.totalScore = (playerData.totalScore || 0) + points;
      playerData.accuracy = playerData.totalQuestions > 0 ? Math.round(playerData.totalCorrect / playerData.totalQuestions * 100) : 0;
    } else {
      playerData = {
        uid: uid,
        user: username,
        wins: 1,
        losses: 0,
        draws: 0,
        totalGames: 1,
        totalCorrect: Math.floor(points / 10),
        totalQuestions: Math.floor(points / 10), // Simplified
        totalTime: 0,
        averageTime: 0,
        accuracy: 100,
        streak: 1,
        highestStreak: 1,
        level: 1,
        totalScore: points,
        categoryScores: {},
        rankTier: 'Bronze',
        achievements: [],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      };
    }
    
    await userDocRef.set(playerData);
    console.log('Online score added for:', username);
  } catch (error) {
    console.error('Error adding online score:', error);
  }
}

// Send chat message
window.sendChatMessage = async function() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;
  
  const chatMessage = {
    sender: window.currentUser.username || window.currentUser.email,
    message: message,
    timestamp: Date.now()
  };
  
  try {
    const roomRef = window.db.collection('rooms').doc(window.onlineRoomId);
    const roomDoc = await roomRef.get();
    const roomData = roomDoc.data();
    const chat = roomData.chat || [];
    chat.push(chatMessage);
    
    await roomRef.update({ chat: chat });
    input.value = '';
  } catch (error) {
    console.error('Error sending chat message:', error);
  }
};

// Render chat messages
function renderChat() {
  const chatEl = document.getElementById('chat-messages');
  if (!chatEl) return;
  
  chatEl.innerHTML = window.chatMessages.map(msg => `
    <div class="chat-message">
      <strong>${msg.sender}:</strong> ${msg.message}
    </div>
  `).join('');
  
  // Scroll to bottom
  chatEl.scrollTop = chatEl.scrollHeight;
}

// Cancel matchmaking
window.cancelOnlineMatchmaking = function() {
  if (window.matchmakingTimeout) {
    clearTimeout(window.matchmakingTimeout);
    window.matchmakingTimeout = null;
  }
  if (window.onlineRoomId && window.isHost) {
    // Delete waiting room
    window.db.collection('rooms').doc(window.onlineRoomId).delete();
  }
  cleanupOnlineGame();
  window.renderHome();
};

// Cleanup online game
function cleanupOnlineGame() {
  if (window.roomListener) {
    window.roomListener();
    window.roomListener = null;
  }
  if (window.matchmakingTimeout) {
    clearTimeout(window.matchmakingTimeout);
    window.matchmakingTimeout = null;
  }
  window.onlineRoomId = null;
  window.isHost = false;
  window.opponentName = '';
  window.onlineGameActive = false;
  window.chatMessages = [];
}
