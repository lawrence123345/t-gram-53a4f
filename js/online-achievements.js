// Online Achievements System for T-Gram
// Tracks online-only achievements in Firestore

// Online Achievement Definitions
const ONLINE_ACHIEVEMENTS = {
  firstOnlineMatch: {
    name: 'First Online Match',
    description: 'Play 1 Online PvP game',
    rarity: '🥇 Online Common',
    requirement: { onlineGames: 1 },
    unlocked: false
  },
  win3Online: {
    name: 'Win 3 Online Games',
    description: 'Win 3 Online PvP matches',
    rarity: '⚡ Online Uncommon',
    requirement: { onlineWins: 3 },
    unlocked: false
  },
  onlineChampion: {
    name: 'Online Champion',
    description: 'Win 10 Online PvP matches',
    rarity: '👑 Online Rare',
    requirement: { onlineWins: 10 },
    unlocked: false
  },
  unstoppableStreak: {
    name: 'Unstoppable Streak',
    description: 'Win 5 matches in a row (without losing)',
    rarity: '🧠 Online Epic',
    requirement: { onlineStreak: 5 },
    unlocked: false
  },
  score1000Online: {
    name: 'Score 1000 Online Points',
    description: 'Reach a total of 1000 points from online matches',
    rarity: '🔥 Online Legendary',
    requirement: { onlinePoints: 1000 },
    unlocked: false
  },
  masterGrammarArena: {
    name: 'Master of the Grammar Arena',
    description: 'Complete all other online achievements',
    rarity: '🌈 Online Mythical',
    requirement: { allOnline: true },
    unlocked: false
  }
};

// Initialize online achievements for user
window.initOnlineAchievements = async function(userUid) {
  if (!userUid) return;
  
  try {
    const userDocRef = window.db.collection('online_achievements').doc(userUid);
    const doc = await userDocRef.get();
    
    if (!doc.exists) {
      // Initialize with zero stats
      const initialStats = {
        onlineGames: 0,
        onlineWins: 0,
        onlinePoints: 0,
        onlineStreak: 0,
        currentStreak: 0,
        unlockedAchievements: []
      };
      await userDocRef.set(initialStats);
      console.log('Initialized online achievements for user:', userUid);
    }
  } catch (error) {
    console.error('Error initializing online achievements:', error);
  }
};

// Update online stats after a match
window.updateOnlineAchievements = async function(userUid, matchResult, pointsEarned, isWin = false) {
  if (!userUid || !window.isOnline) return;
  
  try {
    const userDocRef = window.db.collection('online_achievements').doc(userUid);
    const doc = await userDocRef.get();
    
    if (!doc.exists) {
      await window.initOnlineAchievements(userUid);
      return;
    }
    
    const data = doc.data();
    let updatedData = { ...data };
    
    // Update stats
    updatedData.onlineGames += 1;
    updatedData.onlinePoints += pointsEarned;
    
    if (isWin) {
      updatedData.onlineWins += 1;
      updatedData.currentStreak += 1;
      updatedData.onlineStreak = Math.max(updatedData.onlineStreak, updatedData.currentStreak);
    } else {
      updatedData.currentStreak = 0;
    }
    
    // Check and unlock achievements
    const newUnlocks = await checkAndUnlockAchievements(updatedData, userUid);
    
    // Save updated data
    await userDocRef.set(updatedData);
    
    // Show toasts for new unlocks
    newUnlocks.forEach(achievement => {
      showAchievementToast(achievement);
    });
    
    console.log('Updated online achievements for user:', userUid);
  } catch (error) {
    console.error('Error updating online achievements:', error);
  }
};

// Check for achievement unlocks
async function checkAndUnlockAchievements(stats, userUid) {
  const newUnlocks = [];
  const unlocked = stats.unlockedAchievements || [];
  
  // First Online Match
  if (stats.onlineGames >= 1 && !unlocked.includes('firstOnlineMatch')) {
    unlocked.push('firstOnlineMatch');
    newUnlocks.push(ONLINE_ACHIEVEMENTS.firstOnlineMatch);
  }
  
  // Win 3 Online Games
  if (stats.onlineWins >= 3 && !unlocked.includes('win3Online')) {
    unlocked.push('win3Online');
    newUnlocks.push(ONLINE_ACHIEVEMENTS.win3Online);
  }
  
  // Online Champion
  if (stats.onlineWins >= 10 && !unlocked.includes('onlineChampion')) {
    unlocked.push('onlineChampion');
    newUnlocks.push(ONLINE_ACHIEVEMENTS.onlineChampion);
  }
  
  // Unstoppable Streak
  if (stats.onlineStreak >= 5 && !unlocked.includes('unstoppableStreak')) {
    unlocked.push('unstoppableStreak');
    newUnlocks.push(ONLINE_ACHIEVEMENTS.unstoppableStreak);
  }
  
  // Score 1000 Online Points
  if (stats.onlinePoints >= 1000 && !unlocked.includes('score1000Online')) {
    unlocked.push('score1000Online');
    newUnlocks.push(ONLINE_ACHIEVEMENTS.score1000Online);
  }
  
  // Master of the Grammar Arena
  const allOnlineKeys = Object.keys(ONLINE_ACHIEVEMENTS).filter(key => key !== 'masterGrammarArena');
  const allUnlocked = allOnlineKeys.every(key => unlocked.includes(key));
  if (allUnlocked && !unlocked.includes('masterGrammarArena')) {
    unlocked.push('masterGrammarArena');
    newUnlocks.push(ONLINE_ACHIEVEMENTS.masterGrammarArena);
  }
  
  // Update unlocked list in stats
  const userDocRef = window.db.collection('online_achievements').doc(userUid);
  await userDocRef.update({ unlockedAchievements: unlocked });
  
  return newUnlocks;
}

// Show achievement unlock toast
function showAchievementToast(achievement) {
  if (window.ModalManager && window.ModalManager.showAlert) {
    const message = `🏆 Achievement Unlocked: ${achievement.name}!`;
    window.ModalManager.showAlert(message, 'success');
  } else {
    // Fallback alert
    alert(`🏆 Achievement Unlocked: ${achievement.name}!`);
  }
  
  // Add to messages for notification system
  if (window.messages) {
    window.messages.push({
      type: 'success',
      content: `Achievement: ${achievement.name}`,
      timestamp: Date.now()
    });
  }
}

// Get user's online achievements for display
window.getOnlineAchievements = async function(userUid) {
  if (!userUid) return [];
  
  try {
    const userDocRef = window.db.collection('online_achievements').doc(userUid);
    const doc = await userDocRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      const unlocked = data.unlockedAchievements || [];
      return unlocked.map(key => ONLINE_ACHIEVEMENTS[key]).filter(Boolean);
    }
  } catch (error) {
    console.error('Error fetching online achievements:', error);
  }
  
  return [];
};

// Reset online achievements (for testing)
window.resetOnlineAchievements = async function(userUid) {
  if (!userUid) return;
  
  try {
    await window.db.collection('online_achievements').doc(userUid).delete();
    console.log('Reset online achievements for user:', userUid);
  } catch (error) {
    console.error('Error resetting online achievements:', error);
  }
};
