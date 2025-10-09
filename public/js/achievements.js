// Achievements data and logic

const achievements = [
  {
    id: 'common',
    name: 'Common',
    description: 'Play 1 game',
    image: 'assets/badges/common.png',
    requirement: (stats) => stats.gamesPlayed >= 1,
    progressMax: 1,
  },
  {
    id: 'uncommon',
    name: 'Uncommon',
    description: 'Win 5 games',
    image: 'assets/badges/uncommon.png',
    requirement: (stats) => stats.gamesWon >= 5,
    progressMax: 5,
  },
  {
    id: 'rare',
    name: 'Rare',
    description: 'Score 100 points',
    image: 'assets/badges/rare.png',
    requirement: (stats) => stats.pointsScored >= 100,
    progressMax: 100,
  },
  {
    id: 'epic',
    name: 'Epic',
    description: 'Win 20 games',
    image: 'assets/badges/epic.png',
    requirement: (stats) => stats.gamesWon >= 20,
    progressMax: 20,
  },
  {
    id: 'legendary',
    name: 'Legendary',
    description: 'Score 500 points',
    image: 'assets/badges/legendary.png',
    requirement: (stats) => stats.pointsScored >= 500,
    progressMax: 500,
  },
  {
    id: 'mythical',
    name: 'Mythical',
    description: 'Complete all previous achievements',
    image: 'assets/badges/mythical.png',
    requirement: (stats, unlocked) => unlocked.length === achievements.length - 1,
    progressMax: 1,
  }
];

// Load achievement progress from localStorage
function loadAchievementProgress() {
  const userId = window.currentUser ? window.currentUser.email : 'guest';
  const progress = localStorage.getItem(`achievementProgress_${userId}`);
  return progress ? JSON.parse(progress) : {};
}

// Reset all achievements to locked state
function resetAchievements() {
  const userId = window.currentUser ? window.currentUser.email : 'guest';
  const resetProgress = {};
  achievements.forEach(ach => {
    resetProgress[ach.id] = { current: 0, unlocked: false };
  });
  localStorage.setItem(`achievementProgress_${userId}`, JSON.stringify(resetProgress));
  if (typeof updateAchievements === 'function') {
    updateAchievements();
  }
}

// Make resetAchievements global
window.resetAchievements = resetAchievements;

// Save achievement progress to localStorage
function saveAchievementProgress(progress) {
  const userId = window.currentUser ? window.currentUser.email : 'guest';
  localStorage.setItem(`achievementProgress_${userId}`, JSON.stringify(progress));
}

// Get user game stats from localStorage or default
function getUserStats() {
  const userId = window.currentUser ? window.currentUser.email : 'guest';
  const stats = localStorage.getItem(`gameStats_${userId}`);
  return stats ? JSON.parse(stats) : { gamesPlayed: 0, gamesWon: 0, pointsScored: 0 };
}

// Check and update achievements progress
function updateAchievements() {
  const stats = getUserStats();
  let progress = loadAchievementProgress();
  let unlocked = Object.keys(progress).filter(id => progress[id].unlocked);

  achievements.forEach(ach => {
    if (!progress[ach.id]) {
      progress[ach.id] = { current: 0, unlocked: false };
    }
    if (!progress[ach.id].unlocked) {
      // Calculate current progress based on requirement
      if (ach.id === 'mythical') {
        // Mythical unlocks if all others unlocked
        if (achievements.slice(0, -1).every(a => progress[a.id] && progress[a.id].unlocked)) {
          progress[ach.id].current = 1;
          progress[ach.id].unlocked = true;
          triggerUnlockEffects(ach);
        }
      } else {
        // For others, update current progress
        let currentProgress = 0;
        switch (ach.id) {
          case 'common':
            currentProgress = Math.min(stats.gamesPlayed, ach.progressMax);
            break;
          case 'uncommon':
            currentProgress = Math.min(stats.gamesWon, ach.progressMax);
            break;
          case 'rare':
            currentProgress = Math.min(stats.pointsScored, ach.progressMax);
            break;
          case 'epic':
            currentProgress = Math.min(stats.gamesWon, ach.progressMax);
            break;
          case 'legendary':
            currentProgress = Math.min(stats.pointsScored, ach.progressMax);
            break;
        }
        progress[ach.id].current = currentProgress;
        if (ach.requirement(stats)) {
          progress[ach.id].unlocked = true;
          triggerUnlockEffects(ach);
        }
      }
    }
  });

  saveAchievementProgress(progress);
  return progress;
}

// Trigger badge unlock animation and reward message
function triggerUnlockEffects(achievement) {
  // Show badge unlock animation
  console.log(`✨ Badge Unlock Animation for ${achievement.name}`);

  // Show custom reward notification instead of alert
  showUnlockNotification(achievement);

  // Add glowing effect to the unlocked badge
  setTimeout(() => {
    const badge = document.querySelector(`.achievement-badge[data-id="${achievement.id}"]`);
    if (badge) {
      badge.classList.add('just-unlocked');
      setTimeout(() => {
        badge.classList.remove('just-unlocked');
      }, 3000);
    }
  }, 500);

  // Unlock next tier handled in updateAchievements by checking conditions
  // Save progress already done in updateAchievements
}

// Show custom unlock notification
function showUnlockNotification(achievement) {
  const notification = document.createElement('div');
  notification.id = 'unlock-notification';
  notification.innerHTML = `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10000; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 40px rgba(102, 126, 234, 0.5); text-align: center; font-family: 'Arial', sans-serif; animation: unlockPopup 0.5s ease-out;">
      <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
      <h2 style="margin: 0 0 10px 0; font-size: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Badge Unlocked!</h2>
      <p style="margin: 0; font-size: 18px; opacity: 0.9;">You earned the <strong>${achievement.name}</strong> badge!</p>
      <div style="margin-top: 20px; font-size: 14px; opacity: 0.7;">${achievement.description}</div>
    </div>
  `;
  document.body.appendChild(notification);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'unlockFadeOut 0.5s ease-in';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }
  }, 4000);
}

window.showAchievements = function() {
  const progress = updateAchievements();

  let badgesHTML = achievements.map(ach => {
    const achProgress = progress[ach.id] || { current: 0, unlocked: false };
    const progressPercent = Math.min(achProgress.current / ach.progressMax * 100, 100);
    const unlockedClass = achProgress.unlocked ? 'unlocked' : 'locked';

    // Only show badges that have a valid image path
    if (!ach.image || ach.image.trim() === '') {
      return '';
    }

    return `
      <div class="achievement-badge ${unlockedClass}" data-id="${ach.id}" style="border: 3px solid transparent; border-radius: 15px; padding: 15px; margin: 10px; width: 140px; cursor: pointer; box-shadow: 0 0 10px rgba(0,0,0,0.2); text-align: center; background: #222; color: white; transition: box-shadow 0.3s ease;">
        <img src="${ach.image}" alt="${ach.name}" style="width: 64px; height: 64px; margin-bottom: 10px; filter: ${achProgress.unlocked ? 'none' : 'grayscale(100%) brightness(0.5)'}; transition: filter 0.3s ease;">
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${ach.name}</div>
        <div style="font-size: 12px; margin-bottom: 10px;">${ach.description}</div>
        <progress value="${achProgress.current}" max="${ach.progressMax}" style="width: 100%; height: 12px; border-radius: 6px; overflow: hidden;"></progress>
        <div style="font-size: 12px; margin-top: 5px;">${achProgress.current} / ${ach.progressMax}</div>
      </div>
    `;
  }).join('');

  const content = `
    <style>
      .achievement-badge {
        position: relative;
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      .achievement-badge:hover {
        transform: translateY(-5px) scale(1.05);
        box-shadow: 0 15px 35px rgba(0,0,0,0.4), 0 0 20px rgba(147, 112, 219, 0.3);
      }
      .achievement-badge.unlocked {
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.2);
        border: 3px solid gold;
      }
      .achievement-badge.just-unlocked {
        animation: unlockGlow 2s ease-in-out infinite alternate;
      }
      .achievement-badge img {
        transition: all 0.3s ease;
      }
      .achievement-badge.unlocked img {
        filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
      }
      progress {
        -webkit-appearance: none;
        appearance: none;
        background: linear-gradient(90deg, #333 0%, #555 100%);
        border-radius: 6px;
        height: 12px;
        overflow: hidden;
      }
      progress::-webkit-progress-bar {
        background: linear-gradient(90deg, #333 0%, #555 100%);
        border-radius: 6px;
      }
      progress::-webkit-progress-value {
        background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
        border-radius: 6px;
        transition: width 0.5s ease;
      }
      progress::-moz-progress-bar {
        background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
        border-radius: 6px;
      }
      @keyframes unlockGlow {
        0% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.2), 0 0 60px rgba(255, 215, 0, 0.1); }
        100% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4), 0 0 90px rgba(255, 215, 0, 0.2); }
      }
      @keyframes unlockPopup {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
      @keyframes unlockFadeOut {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      }
      .achievement-badge::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
        transform: rotate(45deg);
        transition: all 0.6s ease;
        opacity: 0;
      }
      .achievement-badge:hover::before {
        opacity: 1;
        animation: shine 0.6s ease;
      }
      @keyframes shine {
        0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
      }
    </style>
    <div style="padding: 20px; max-height: 80vh; overflow-y: auto; color: white; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); border-radius: 20px; box-shadow: 0 0 50px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1);">
      <h2 style="text-align: center; margin-bottom: 30px; font-size: 32px; text-shadow: 0 0 20px rgba(255, 255, 255, 0.5); background: linear-gradient(45deg, #fff, #9370DB); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">🏆 Achievements</h2>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;">
        ${badgesHTML}
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <button onclick="window.ModalManager.hideModal('achievements-modal')" style="padding: 12px 30px; border-radius: 30px; border: none; background: linear-gradient(135deg, #9370DB 0%, #764ba2 100%); color: white; font-weight: bold; cursor: pointer; box-shadow: 0 8px 25px rgba(147, 112, 219, 0.4); transition: all 0.3s ease; font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 35px rgba(147, 112, 219, 0.6)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(147, 112, 219, 0.4)'">✕ Close</button>
      </div>
    </div>
  `;

  window.ModalManager.showModal('achievements-modal', content, 'info');

  // Add click handlers for badges to show progress details
  document.querySelectorAll('.achievement-badge').forEach(badge => {
    badge.addEventListener('click', () => {
      const id = badge.getAttribute('data-id');
      showAchievementDetails(id);
    });
  });
};

// Show detailed progress for a specific achievement
function showAchievementDetails(id) {
  const ach = achievements.find(a => a.id === id);
  if (!ach) return;

  const progress = loadAchievementProgress();
  const achProgress = progress[id] || { current: 0, unlocked: false };
  const progressPercent = Math.min(achProgress.current / ach.progressMax * 100, 100);

  const content = `
    <style>
      .detail-progress {
        -webkit-appearance: none;
        appearance: none;
        background: linear-gradient(90deg, #333 0%, #555 100%);
        border-radius: 10px;
        height: 20px;
        overflow: hidden;
        margin: 15px 0;
      }
      .detail-progress::-webkit-progress-bar {
        background: linear-gradient(90deg, #333 0%, #555 100%);
        border-radius: 10px;
      }
      .detail-progress::-webkit-progress-value {
        background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
        border-radius: 10px;
        transition: width 0.8s ease;
      }
      .detail-progress::-moz-progress-bar {
        background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
        border-radius: 10px;
      }
      .detail-badge-img {
        transition: all 0.5s ease;
        border-radius: 50%;
        box-shadow: ${achProgress.unlocked ? '0 0 30px rgba(255, 215, 0, 0.6)' : '0 0 15px rgba(0,0,0,0.3)'};
      }
      .detail-modal {
        background: linear-gradient(135deg, #2a2a4e 0%, #1e1e3f 50%, #0f0f23 100%);
        border: 2px solid rgba(255,255,255,0.1);
        box-shadow: 0 0 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1);
      }
    </style>
    <div class="detail-modal" style="padding: 30px; color: white; border-radius: 25px; max-width: 450px; margin: 0 auto; text-align: center;">
      <h3 style="margin-bottom: 20px; font-size: 28px; text-shadow: 0 0 15px rgba(255,255,255,0.5); background: linear-gradient(45deg, #fff, #9370DB); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${ach.name} Badge</h3>
      <img class="detail-badge-img" src="${ach.image}" alt="${ach.name}" style="width: 120px; height: 120px; margin-bottom: 20px; filter: ${achProgress.unlocked ? 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))' : 'grayscale(100%) brightness(0.5) drop-shadow(0 0 10px rgba(0,0,0,0.5))'};">
      <p style="margin-bottom: 20px; font-size: 16px; opacity: 0.9; line-height: 1.4;">${ach.description}</p>
      <progress class="detail-progress" value="${achProgress.current}" max="${ach.progressMax}"></progress>
      <p style="margin-top: 15px; font-size: 14px; opacity: 0.8;">Progress: <strong>${achProgress.current} / ${ach.progressMax}</strong></p>
      <div style="margin-top: 25px;">
        <button onclick="window.ModalManager.hideModal('achievement-detail-modal'); window.showAchievements();" style="padding: 12px 30px; border-radius: 30px; border: none; background: linear-gradient(135deg, #9370DB 0%, #764ba2 100%); color: white; font-weight: bold; cursor: pointer; box-shadow: 0 8px 25px rgba(147, 112, 219, 0.4); transition: all 0.3s ease; font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 35px rgba(147, 112, 219, 0.6)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(147, 112, 219, 0.4)'">⬅ Back to Achievements</button>
      </div>
    </div>
  `;

  window.ModalManager.showModal('achievement-detail-modal', content, 'info');
}

// Make updateAchievements global
window.updateAchievements = updateAchievements;
