function addScore(username, correct, total, time, categoryScores = {}){
  let scores = JSON.parse(localStorage.getItem('scores')) || [];
  let player = scores.find(p => p.user === username);
  if(player) {
    player.wins = (player.wins || 0) + (correct === total ? 1 : 0);
    player.losses = (player.losses || 0) + (correct === 0 ? 1 : 0);
    player.draws = (player.draws || 0) + (correct > 0 && correct < total ? 1 : 0);
    player.totalGames = (player.totalGames || 0) + 1;
    player.totalCorrect = (player.totalCorrect || 0) + correct;
    player.totalQuestions = (player.totalQuestions || 0) + total;
    player.totalTime = (player.totalTime || 0) + time;
    player.averageTime = player.totalTime / player.totalGames;
    player.accuracy = player.totalQuestions > 0 ? Math.round(player.totalCorrect / player.totalQuestions * 100) : 0;
    player.streak = correct === total ? (player.streak || 0) + 1 : 0;
    player.highestStreak = Math.max(player.highestStreak || 0, player.streak);
    player.level = Math.floor((player.totalScore || 0) / 100) + 1;
    player.totalScore = (player.totalScore || 0) + correct;
    player.categoryScores = player.categoryScores || {};
    Object.keys(categoryScores).forEach(cat => {
      player.categoryScores[cat] = (player.categoryScores[cat] || 0) + categoryScores[cat];
    });
    player.rankTier = player.wins >= 50 ? 'Gold' : player.wins >= 25 ? 'Silver' : 'Bronze';
    player.achievements = player.achievements || [];
    if(player.wins === 10 && !player.achievements.includes('10 Wins')) player.achievements.push('10 Wins');
    if(player.streak === 5 && !player.achievements.includes('5 Streak')) player.achievements.push('5 Streak');
    if(player.accuracy >= 90 && !player.achievements.includes('90% Accuracy')) player.achievements.push('90% Accuracy');
    player.avatar = player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
  } else {
    scores.push({
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
      totalScore: correct,
      categoryScores: categoryScores,
      rankTier: 'Bronze',
      achievements: [],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
    });
  }
  localStorage.setItem('scores', JSON.stringify(scores));
}

// Make functions global so they can be called from HTML
window.renderLeaderboard = function(){
  let scores = JSON.parse(localStorage.getItem('scores')) || [];
  scores.sort((a,b) => b.totalScore - a.totalScore);
  let topScores = scores.slice(0, 10);
  let rows = topScores.map((s, i) => {
    let rank = i + 1;
    let medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
    return `<div class="leaderboard-row">
<div class="rank-item">${medal} ${rank}</div>
<div class="username-item">${s.user}</div>
<div class="stat-item">${s.wins}</div>
<div class="stat-item">${s.losses}</div>
<div class="stat-item">${s.totalScore}</div>
</div>`;
  }).join("");
  document.getElementById('app').innerHTML = `<div class="leaderboard">
<h2>🏆 Leaderboard</h2>
<p class="leaderboard-description">The leaderboard highlights the top players, ranked from first to tenth, with a stylish display of their username, victories, defeats, and total score.</p>
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
<button class="btn back-btn" onclick="renderHome()">Back</button>
</div>`;

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
window.viewProfile = function(user){
  let scores = JSON.parse(localStorage.getItem('scores')) || [];
  let player = scores.find(p => p.user === user);
  if(player) {
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
<button class="btn" onclick="renderLeaderboard()">Back</button>
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
<button class="btn" onclick="startGame()">Start Game</button>
<button class="btn" onclick="renderLeaderboard()">Leaderboard</button>
</div>`;
}
