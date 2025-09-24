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
  let sortBy = document.getElementById('sort-select')?.value || 'wins';
  let filter = document.getElementById('filter-select')?.value || 'all';
  let search = document.getElementById('search-input')?.value.toLowerCase() || '';
  scores.sort((a,b) => b[sortBy] - a[sortBy]);
  if(filter === 'friends') scores = scores.filter(s => s.isFriend);
  if(search) scores = scores.filter(s => s.user.toLowerCase().includes(search));
  let page = parseInt(document.getElementById('page-select')?.value) || 1;
  let perPage = 10;
  let start = (page - 1) * perPage;
  let end = start + perPage;
  let paginatedScores = scores.slice(start, end);
  let list = paginatedScores.map((s,i) => {
    let rank = start + i + 1;
    let medal = rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':'#'+rank;
    let rankColor = s.rankTier === 'Gold' ? 'gold' : s.rankTier === 'Silver' ? 'silver' : 'bronze';
    let achievementsHTML = s.achievements.map(a => `<span class="badge">${a}</span>`).join('');
    let progressBar = `<div class="progress-bar"><div class="progress" style="width: ${s.accuracy}%"></div></div>`;
    let categoryScoresHTML = Object.entries(s.categoryScores).map(([cat, score]) => `<span>${cat}: ${score}</span>`).join(', ');
    return `<div class="player-card" data-user="${s.user}">
<img src="${s.avatar}" alt="${s.user}" class="avatar" loading="lazy">
<div class="player-info">
<h3>${medal} ${s.user}</h3>
<span class="rank-tier" style="color: ${rankColor}">${s.rankTier}</span>
<div class="stats">
<p>Wins: ${s.wins} | Losses: ${s.losses} | Draws: ${s.draws}</p>
<p>Accuracy: ${s.accuracy}% ${progressBar}</p>
<p>Streak: ${s.streak} | Highest: ${s.highestStreak}</p>
<p>Average Time: ${Math.round(s.averageTime)}s</p>
<p>Level: ${s.level}</p>
<p>Category Scores: ${categoryScoresHTML || 'None'}</p>
</div>
<div class="achievements">${achievementsHTML}</div>
</div>
<div class="actions">
<button class="btn" onclick="viewProfile('${s.user}')">View Profile</button>
<button class="btn" onclick="challengePlayer('${s.user}')">Challenge</button>
</div>
</div>`;
  }).join("");
  let totalPages = Math.ceil(scores.length / perPage);
  let paginationHTML = '';
  for(let i=1; i<=totalPages; i++){
    paginationHTML += `<option value="${i}">${i}</option>`;
  }
  document.getElementById('app').innerHTML = `<div class="leaderboard">
<h2>Leaderboard</h2>
<div class="controls">
<select id="sort-select" onchange="renderLeaderboard()">
<option value="wins">Sort by Wins</option>
<option value="accuracy">Sort by Accuracy</option>
<option value="streak">Sort by Streak</option>
<option value="level">Sort by Level</option>
</select>
<select id="filter-select" onchange="renderLeaderboard()">
<option value="all">All Players</option>
<option value="friends">Friends Only</option>
</select>
<input type="text" id="search-input" placeholder="Search players..." onkeyup="renderLeaderboard()">
<select id="page-select" onchange="renderLeaderboard()">
${paginationHTML}
</select>
</div>
<div class="leaderboard-list">${list}</div>
<button class="btn" onclick="renderHome()">Back</button>
<button class="btn" onclick="shareLeaderboard()">Share</button>
</div>`;
  addAnimations();
  addHoverEffects();
  // Removed real-time updates to prevent lag
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
  alert(`Challenging ${user} to a PvP match! (Feature not implemented yet)`);
}

// Make functions global so they can be called from HTML
window.shareLeaderboard = function(){
  if(navigator.share){
    navigator.share({
      title: 'T-Gram Leaderboard',
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied to clipboard!'));
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
