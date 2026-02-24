async function addScore(uid, username, correct, total, time, categoryScores = {}){
  try {
    const userDocRef = window.db.collection('scores').doc(uid);
    const userDoc = await userDocRef.get();
    let playerData;
    if (userDoc.exists) {
      playerData = userDoc.data();
      playerData.wins = (playerData.wins || 0) + (correct === total ? 1 : 0);
      playerData.losses = (playerData.losses || 0) + (correct === 0 ? 1 : 0);
      playerData.draws = (playerData.draws || 0) + (correct > 0 && correct < total ? 1 : 0);
      playerData.totalGames = (playerData.totalGames || 0) + 1;
      playerData.totalCorrect = (playerData.totalCorrect || 0) + correct;
      playerData.totalQuestions = (playerData.totalQuestions || 0) + total;
      playerData.totalTime = (playerData.totalTime || 0) + time;
      playerData.averageTime = playerData.totalTime / playerData.totalGames;
      playerData.accuracy = playerData.totalQuestions > 0 ? Math.round(playerData.totalCorrect / playerData.totalQuestions * 100) : 0;
      playerData.streak = correct === total ? (playerData.streak || 0) + 1 : 0;
      playerData.highestStreak = Math.max(playerData.highestStreak || 0, playerData.streak);
      playerData.level = Math.floor((playerData.totalScore || 0) / 100) + 1;
      playerData.totalScore = (playerData.totalScore || 0) + (correct * 10);
      playerData.categoryScores = playerData.categoryScores || {};
      Object.keys(categoryScores).forEach(cat => {
        playerData.categoryScores[cat] = (playerData.categoryScores[cat] || 0) + categoryScores[cat];
      });
      playerData.rankTier = playerData.wins >= 50 ? 'Gold' : playerData.wins >= 25 ? 'Silver' : 'Bronze';
      playerData.achievements = playerData.achievements || [];
      if(playerData.wins === 10 && !playerData.achievements.includes('10 Wins')) playerData.achievements.push('10 Wins');
      if(playerData.streak === 5 && !playerData.achievements.includes('5 Streak')) playerData.achievements.push('5 Streak');
      if(playerData.accuracy >= 90 && !playerData.achievements.includes('90% Accuracy')) playerData.achievements.push('90% Accuracy');
      playerData.avatar = playerData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    } else {
      playerData = {
        uid: uid,
        user: username,
        wins: correct === total ? 1 : 0,
        losses: correct === 0 ? 1 : 0,
        draws: correct > 0 && correct < total ? 1 : 0,
        totalGames: 1,
        totalCorrect: correct,
        totalQuestions: total,
        totalTime: time,
        averageTime: time,
        accuracy: total > 0 ? Math.round(correct / total * 100) : 0,
        streak: correct === total ? 1 : 0,
        highestStreak: correct === total ? 1 : 0,
        level: 1,
        totalScore: correct * 10,
        categoryScores: categoryScores,
        rankTier: 'Bronze',
        achievements: [],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      };
    }
    await userDocRef.set(playerData);
  } catch (error) {
    console.error('Error adding score:', error);
  }
}

// Make functions global so they can be called from HTML
window.renderLeaderboard = async function(){
  if (window.isOnline) {
    // Online: Fetch from Firebase Firestore
    try {
      const scoresSnapshot = await window.db.collection('scores').get();
      let onlineScores = [];
      scoresSnapshot.forEach(doc => {
        onlineScores.push(doc.data());
      });

      // Cache online scores locally for offline fallback
      localStorage.setItem('cachedOnlineScores', JSON.stringify(onlineScores));

      renderOnlineLeaderboard(onlineScores);
    } catch (error) {
      console.error('Error loading online Leaderboard:', error);
      // Fallback to cached scores if available
      const cachedScores = JSON.parse(localStorage.getItem('cachedOnlineScores') || '[]');
      if (cachedScores.length > 0) {
        renderOnlineLeaderboard(cachedScores);
      } else {
        renderOfflineLeaderboard();
      }
    }
  } else {
    // Offline: Use cached scores or local scores
    const cachedScores = JSON.parse(localStorage.getItem('cachedOnlineScores') || '[]');
    if (cachedScores.length > 0) {
      renderOnlineLeaderboard(cachedScores);
    } else {
      renderOfflineLeaderboard();
    }
  }
}

function renderOnlineLeaderboard(scores) {
  scores.sort((a,b) => b.totalScore - a.totalScore);
  let topScores = scores.slice(0, 10);
  let rows = topScores.map((s, i) => {
    let rank = i + 1;
    let medal = rank === 1 ? '���' : rank === 2 ? '���' : rank === 3 ? '���' : rank;
    return `<div class="leaderboard-row">
<div class="rank-item">${medal} ${rank}</div>
<div class="username-item">${s.user}</div>
<div class="stat-item">${s.wins}</div>
<div class="stat-item">${s.losses}</div>
<div class="stat-item">${s.totalScore}</div>
</div>`;
  }).join("");
  document.getElementById('app').innerHTML = `<div class="leaderboard">
<h2>Leaderboard</h2>
<p class="leaderboard-description">Global rankings from online players. Connect to see real-time updates.</p>
<div class="leaderboard-header">
<div class="rank-item">Rank</div>
<div class="username-item">Username</div>
<div class="stat-item">Wins</div>
<div class="stat-item">Losses</div>
<div class="stat-item">Total Score</div>
</div>
<div class="leaderboard-rows">
${rows}
</div>
<button class="btn btn-small back-btn" onclick="renderHome()">Back</button>
</div>`;
}

function renderOfflineLeaderboard() {
  document.getElementById('app').innerHTML = `<div class="leaderboard">
<h2>📴 Leaderboard Unavailable</h2>
<p class="leaderboard-description">The Leaderboard is not available while offline. Please connect to the internet to view rankings and save your scores.</p>
<div class="offline-message">
  <div class="offline-icon">📡</div>
  <p>Connect to the internet to access the Leaderboard and track your progress globally.</p>
</div>
<button class="btn btn-small back-btn" onclick="renderHome()">Back</button>
</div>`;
}

// New function to reset Leaderboard and game stats
window.resetLeaderboardAndStats = function() {
  const userId = window.currentUser ? window.currentUser.email : 'guest';
  localStorage.setItem('scores', JSON.stringify([]));
  localStorage.setItem(`gameStats_${userId}`, JSON.stringify({ gamesPlayed: 0, gamesWon: 0, pointsScored: 0 }));
  if (typeof updateAchievements === 'function') {
    updateAchievements();
  }
  alert('Leaderboard and game stats have been reset.');
}

function addHoverEffects(){
  document.querySelectorAll('.player-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      let user = card.dataset.user;
      let scores = JSON.parse(localStorage.getItem('scores')) || [];
      let player = scores.find(p => p.user === user);
      if(player) {
        let tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `
<p>Total Games: ${player.totalGames}</p>
<p>Losses: ${player.losses}</p>
<p>Draws: ${player.draws}</p>
<p>Highest Streak: ${player.highestStreak}</p>
<p>Achievements: ${player.achievements.join(', ') || 'None'}</p>
<p>Category Scores: ${Object.entries(player.categoryScores).map(([cat, score]) => `${cat}: ${score}`).join(', ')}</p>
`;
        card.appendChild(tooltip);
      }
    });
    card.addEventListener('mouseleave', () => {
      let tooltip = card.querySelector('.tooltip');
      if(tooltip) tooltip.remove();
    });
  });
}

function addAnimations(){
  document.querySelectorAll('.player-card').forEach((card, i) => {
    card.style.animation = `fadeIn 0.5s ease-in-out ${i * 0.1}s both`;
  });
}

// Make functions global so they can be called from HTML
window.viewProfile = async function(user){
  try {
    const snapshot = await window.db.collection('scores').where('user', '==', user).get();
    if (!snapshot.empty) {
      const player = snapshot.docs[0].data();
      document.getElementById('app').innerHTML = `<div class="profile">
<h2>${player.user}'s Profile</h2>
<img src="${player.avatar}" alt="${player.user}" class="avatar">
<p>Wins: ${player.wins}</p>
<p>Losses: ${player.losses}</p>
<p>Draws: ${player.draws}</p>
<p>Total Games: ${player.totalGames}</p>
<p>Accuracy: ${player.accuracy}%</p>
<p>Streak: ${player.streak}</p>
<p>Highest Streak: ${player.highestStreak}</p>
<p>Average Time: ${Math.round(player.averageTime)}s</p>
<p>Level: ${player.level}</p>
<p>Achievements: ${player.achievements.join(', ') || 'None'}</p>
<button class="btn btn-small" onclick="renderLeaderboard()">Back</button>
</div>`;
    } else {
      document.getElementById('app').innerHTML = `<div class="profile">
<h2>Profile Not Found</h2>
<p>User not found.</p>
<button class="btn btn-small" onclick="renderLeaderboard()">Back</button>
</div>`;
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    document.getElementById('app').innerHTML = `<div class="profile">
<h2>Error</h2>
<p>Error loading profile.</p>
<button class="btn btn-small" onclick="renderLeaderboard()">Back</button>
</div>`;
  }
}

// Make functions global so they can be called from HTML
window.challengePlayer = function(user){
  window.ModalManager.showAlert(`Challenging ${user} to a PvP match! (Feature not implemented yet)`, 'info');
  window.messages.push({ type: 'info', content: `Challenging ${user} to a PvP match! (Feature not implemented yet)`, timestamp: Date.now() });
}

// Make functions global so they can be called from HTML
window.shareLeaderboard = function(){
  if(navigator.share){
    navigator.share({
      title: 'T-Gram Leaderboard',
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      window.ModalManager.showAlert('Link copied to clipboard!', 'success');
      window.messages.push({ type: 'success', content: 'Link copied to clipboard!', timestamp: Date.now() });
    });
  }
}

// Make functions global so they can be called from HTML
window.renderHome = function(){
  document.getElementById('app').innerHTML = `<div class="home">
<h1>T-Gram</h1>
<p>A grammar learning game.</p>
<button class="btn btn-small" onclick="startGame()">Start Game</button>
<button class="btn btn-small" onclick="renderLeaderboard()">Leaderboard</button>
</div>`;
}