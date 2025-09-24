function addScore(username){
  let scores = JSON.parse(localStorage.getItem('scores')) || [];
  let player = scores.find(p => p.user === username);
  if(player) {
    player.wins = (player.wins || 0) + 1;
    player.totalGames = (player.totalGames || 0) + 1;
    player.streak = (player.streak || 0) + 1;
    player.accuracy = player.totalQuestions > 0 ? Math.round((player.totalCorrect || 0) / player.totalQuestions * 100) : 0;
    player.level = Math.floor((player.totalScore || 0) / 100) + 1;
  } else {
    scores.push({
      user: username,
      wins: 1,
      losses: 0,
      draws: 0,
      totalGames: 1,
      streak: 1,
      accuracy: 0,
      level: 1,
      achievements: [],
      rankTier: 'Bronze'
    });
  }
  localStorage.setItem('scores', JSON.stringify(scores));
}

function renderLeaderboard(){
  let scores = JSON.parse(localStorage.getItem('scores')) || [];
  let sortBy = document.getElementById('sort-select')?.value || 'wins';
  let filter = document.getElementById('filter-select')?.value || 'all';
  scores.sort((a,b) => b[sortBy] - a[sortBy]);
  if(filter === 'friends') scores = scores.filter(s => s.isFriend);
  let list = scores.slice(0,10).map((s,i) => {
    let medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
    let rankColor = s.rankTier === 'Gold' ? 'gold' : s.rankTier === 'Silver' ? 'silver' : 'bronze';
    let achievementsHTML = s.achievements.map(a => `<span class="badge">${a}</span>`).join('');
    return `<li class="player-row" data-user="${s.user}">
<span class="player-info">
<span class="medal">${medal}</span>
<span class="username">${s.user}</span>
<span class="rank-tier" style="color: ${rankColor}">${s.rankTier}</span>
</span>
<span class="stats">
<span>Wins: ${s.wins}</span>
<span>Accuracy: ${s.accuracy}%</span>
<span>Streak: ${s.streak}</span>
<span>Level: ${s.level}</span>
</span>
<span class="achievements">${achievementsHTML}</span>
</li>`;
  }).join("");
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
</div>
<ul>${list}</ul>
<button class="btn" onclick="renderHome()">Back</button>
</div>`;
  addHoverEffects();
}

function addHoverEffects(){
  document.querySelectorAll('.player-row').forEach(row => {
    row.addEventListener('mouseenter', () => {
      let user = row.dataset.user;
      let scores = JSON.parse(localStorage.getItem('scores')) || [];
      let player = scores.find(p => p.user === user);
      if(player) {
        let tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `
<p>Total Games: ${player.totalGames}</p>
<p>Losses: ${player.losses}</p>
<p>Draws: ${player.draws}</p>
<p>Highest Streak: ${player.streak}</p>
<p>Achievements: ${player.achievements.join(', ') || 'None'}</p>
`;
        row.appendChild(tooltip);
      }
    });
    row.addEventListener('mouseleave', () => {
      let tooltip = row.querySelector('.tooltip');
      if(tooltip) tooltip.remove();
    });
  });
}
