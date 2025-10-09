// Default avatars
const defaultAvatars = [
  "https://i.ibb.co/WpVG6h57/iconos-de-persona-de-avatar-negro-icono-de-perfil-de-usuario.jpg",
  "https://i.ibb.co/cS1n3rYd/download.jpg",
  "https://i.ibb.co/ynjMJMwP/Astronaut-with-Planet-Balloons-Sticker-Sticker-Mania.jpg",
  "https://i.ibb.co/8nh2bR3w/Metal-Poster-Displate-Dabbing-Penguin.jpg",
  "https://i.ibb.co/Jjx7bdWt/download-4.jpg",
  "https://i.ibb.co/Q3st8z3w/game-icon.jpg",
  "https://i.ibb.co/FbGy2TpZ/download-7.jpg",
  "https://i.ibb.co/rR0bQv9G/V-voj-mobiln-ch-aplikac-na-m-ru-MEMOS-Software.jpg",
  "https://i.ibb.co/FLtbzztr/download-6.jpg",
  "https://i.ibb.co/ytjG9s8/download-5.jpg",  
];

// Make functions global so they can be called from HTML
window.renderProfile = function(){
  if (!window.currentUser) {
    window.ModalManager.showAlert('Please log in to view your profile.', 'error');
    window.messages.push({ type: 'error', content: 'Please log in to view your profile.', timestamp: Date.now() });
    renderLogin();
    return;
  }

  // Calculate ranking position
  let scores = JSON.parse(localStorage.getItem('scores')) || [];
  scores.sort((a, b) => b.totalScore - a.totalScore);
  let rank = scores.findIndex(s => s.user === window.currentUser.username) + 1;
  if (rank === 0) rank = 'Not ranked yet';

  // Track original values for change detection
  window.originalProfile = {
    username: window.currentUser.username,
    bio: window.currentUser.bio || '',
    age: window.currentUser.age || '',
    avatar: window.currentUser.avatar
  };

let leftAvatar = '';
let hasAvatar = !!window.currentUser.avatar;
if (hasAvatar) {
let avatarStyle = 'width: 150px; height: 150px; border-radius: 50%; flex-shrink: 0; border: 3px solid white; box-shadow: 0 0 0 3px black, 0 12px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.2); transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); position: relative; overflow: hidden;';
  if (window.currentUser.avatar.startsWith('http') || window.currentUser.avatar.startsWith('data:')) {
    avatarStyle += ' object-fit: cover; cursor: pointer;';
    leftAvatar = `<img src="${window.currentUser.avatar}" alt="Profile Avatar" style="${avatarStyle}" onclick="window.showAvatarSelection()" onmouseover="this.style.transform='scale(1.08) rotate(2deg)'; this.style.boxShadow='0 0 0 3px black, 0 8px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)'; this.style.borderColor='white'" onmouseout="this.style.transform='scale(1) rotate(0deg)'; this.style.boxShadow='0 0 0 3px black, 0 6px 25px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'; this.style.borderColor='white'">`;
  } else {
    avatarStyle += ' background: black; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer;';
    leftAvatar = `<div style="${avatarStyle}" onclick="window.showAvatarSelection()" onmouseover="this.style.transform='scale(1.08) rotate(2deg)'; this.style.boxShadow='0 0 0 3px black, 0 8px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)'; this.style.borderColor='white'" onmouseout="this.style.transform='scale(1) rotate(0deg)'; this.style.boxShadow='0 0 0 3px black, 0 6px 25px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'; this.style.borderColor='white'"></div>`;
  }
}

  let fieldsHTML = `
    <div style="margin-bottom: 25px; position: relative; animation: slideInLeft 0.6s ease;">
      <label style="display: flex; align-items: center; margin-bottom: 10px; font-weight: 600; color: #2c3e50; font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
        <span style="margin-right: 10px; font-size: 20px; animation: bounceIn 0.6s ease;">👤</span> Username
      </label>
      <input id="edit-username" value="${window.currentUser.username}" oninput="window.checkProfileChanges()" style="width: 100%; padding: 15px 18px; border: 2px solid #e0e6ed; border-radius: 12px; font-size: 16px; transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%); box-shadow: 0 2px 10px rgba(0,0,0,0.05);" type="text" />
    </div>
    <div style="margin-bottom: 25px; position: relative; animation: fadeIn 1s ease; display: flex; align-items: center; gap: 12px;">
      <label style="display: flex; align-items: center; font-weight: 700; color: #2c3e50; font-size: 18px; text-shadow: 0 1px 3px rgba(0,0,0,0.15); user-select: none;">
        <span style="margin-right: 12px; font-size: 24px; animation: bounceIn 1.2s ease infinite alternate; color: #f39c12;">🏆</span> Leaderboard Rank
      </label>
      <span style="padding: 12px 28px; background: linear-gradient(135deg, #f39c12, #e67e22); border-radius: 50px; display: inline-block; color: white; font-weight: 900; box-shadow: 0 8px 30px rgba(243, 156, 18, 0.6), inset 0 1px 0 rgba(255,255,255,0.3); transition: all 0.4s ease; font-size: 18px; text-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: default;" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 12px 40px rgba(243, 156, 18, 0.8), inset 0 1px 0 rgba(255,255,255,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 8px 30px rgba(243, 156, 18, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)'">${rank}</span>
    </div>
    <div style="margin-bottom: 25px; position: relative; animation: slideInLeft 0.8s ease;">
      <label style="display: flex; align-items: center; margin-bottom: 10px; font-weight: 600; color: #2c3e50; font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
        <span style="margin-right: 10px; font-size: 20px; animation: bounceIn 0.8s ease;">📝</span> Bio / About Me
      </label>
      <textarea id="edit-bio" placeholder="Tell us about yourself" oninput="window.checkProfileChanges()" style="width: 100%; padding: 15px 18px; border: 2px solid #e0e6ed; border-radius: 12px; min-height: 130px; resize: vertical; font-size: 16px; font-family: inherit; transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%); box-shadow: 0 2px 10px rgba(0,0,0,0.05); line-height: 1.5;" onfocus="this.style.borderColor='%23667eea'; this.style.boxShadow='0 0 0 4px rgba(102, 126, 234, 0.15), 0 4px 15px rgba(102, 126, 234, 0.1)'" onblur="this.style.borderColor='%23e0e6ed'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.05)'">${window.currentUser.bio || ''}</textarea>
    </div>
    <div style="margin-bottom: 25px; position: relative; animation: slideInLeft 0.9s ease;">
      <label style="display: flex; align-items: center; margin-bottom: 10px; font-weight: 600; color: #2c3e50; font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
        <span style="margin-right: 10px; font-size: 20px; animation: bounceIn 0.9s ease;">🎂</span> Age (Optional)
      </label>
      <input id="edit-age" type="number" min="1" max="120" value="${window.currentUser.age || ''}" oninput="window.checkProfileChanges()" placeholder="Enter your age" style="width: 100%; padding: 15px 18px; border: 2px solid #e0e6ed; border-radius: 12px; font-size: 16px; transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%); box-shadow: 0 2px 10px rgba(0,0,0,0.05);" />
    </div>
    <div style="margin-bottom: 25px; position: relative; animation: slideInLeft 1s ease;">
      <label style="display: flex; align-items: center; margin-bottom: 10px; font-weight: 600; color: #2c3e50; font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
        <span style="margin-right: 10px; font-size: 20px; animation: bounceIn 1s ease;">✉️</span> Email Address
      </label>
      <span style="padding: 15px 18px; background: linear-gradient(135deg, #3498db, #2980b9); border-radius: 12px; display: inline-block; color: white; font-weight: bold; box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4), inset 0 1px 0 rgba(255,255,255,0.2); transition: all 0.3s ease; font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${window.currentUser.email}</span>
    </div>
  `;

  let mainContent = '';
  if (hasAvatar) {
    // Add Achievements button below avatar
    let achievementsButton = `<button class="btn btn-small" style="margin-top: 15px; background: linear-gradient(135deg, #FF7F50, #9370DB); color: white; border: none; border-radius: 35px; cursor: pointer; font-weight: bold; box-shadow: 0 8px 25px rgba(147, 127, 219, 0.6); transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);" onclick="window.showAchievements()">🏅 Achievements</button>`;

    let avatarWithButton = `
      <div style="display: flex; flex-direction: column; align-items: center;">
        ${leftAvatar}
        ${achievementsButton}
      </div>
    `;

    mainContent = `
      <div style="display: flex; gap: 35px; align-items: flex-start; margin-bottom: 35px; animation: fadeInUp 0.8s ease;">
        ${avatarWithButton}
        <div style="flex: 1; padding: 30px; background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%); border-radius: 20px; box-shadow: 0 6px 25px rgba(0,0,0,0.1); border: 1px solid rgba(233,236,239,0.8); backdrop-filter: blur(10px);">
          ${fieldsHTML}
        </div>
      </div>
    `;
  } else {
    mainContent = `
      <div style="max-width: 550px; margin: 0 auto 35px; padding: 30px; background: linear-gradient(135deg, rgba(248,249,250,0.95) 0%, rgba(233,236,239,0.95) 100%); border-radius: 20px; box-shadow: 0 6px 25px rgba(0,0,0,0.1); text-align: center; animation: fadeInUp 0.8s ease; border: 1px solid rgba(233,236,239,0.8); backdrop-filter: blur(10px);">
        <div style="margin-bottom: 25px; font-size: 22px; color: #495057; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">👋 Add an avatar to personalize your profile!</div>
        <button class="btn btn-small" onclick="window.showAvatarSelection()" style="display: inline-block; margin: 0 auto 30px; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 35px; cursor: pointer; font-weight: bold; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4); transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);" onmouseover="this.style.transform='translateY(-3px) scale(1.02)'; this.style.boxShadow='0 12px 30px rgba(102, 126, 234, 0.5)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 8px 25px rgba(102, 126, 234, 0.4)'">Customize Avatar</button>
        <div style="padding: 30px; background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%); border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid rgba(222,226,230,0.8);">
          ${fieldsHTML}
        </div>
      </div>
    `;
  }

  let profileHTML = `
    <div style="padding: 50px; max-width: 1000px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); border-radius: 35px; box-shadow: 0 20px 60px rgba(102, 126, 234, 0.6), inset 0 1px 0 rgba(255,255,255,0.1); position: relative; overflow: hidden; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <!-- Menu Icon -->
      <div style="position: absolute; top: 30px; right: 30px; z-index: 3; cursor: pointer; font-size: 30px; color: white; transition: all 0.3s ease;" onclick="window.toggleProfileMenu()" onmouseover="this.style.transform='scale(1.1)'; this.style.color='#f0f8ff'" onmouseout="this.style.transform='scale(1)'; this.style.color='white'">☰</div>
      <!-- Slide-out Menu Panel -->
      <div id="profile-menu-panel" style="position: fixed; top: 0; right: -300px; width: 300px; height: 100%; background: linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95)); backdrop-filter: blur(20px); box-shadow: -10px 0 30px rgba(0,0,0,0.3); transition: right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); z-index: 1000; padding: 50px 20px; color: white; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="text-align: right; margin-bottom: 40px;">
          <span style="font-size: 28px; cursor: pointer; transition: all 0.3s ease;" onclick="window.closeProfileMenu()" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">✕</span>
        </div>
        <h3 style="color: #f0f8ff; margin-bottom: 30px; font-size: 24px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Navigation</h3>
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <button class="menu-btn" onclick="window.renderLeaderboard(); window.closeProfileMenu()" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 15px 20px; border-radius: 15px; cursor: pointer; font-size: 18px; font-weight: 600; transition: all 0.3s ease; text-align: left;" onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateX(5px)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.transform='translateX(0)'">📊 My Stats</button>
          <button class="menu-btn" onclick="window.showAchievements(); window.closeProfileMenu()" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 15px 20px; border-radius: 15px; cursor: pointer; font-size: 18px; font-weight: 600; transition: all 0.3s ease; text-align: left;" onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateX(5px)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.transform='translateX(0)'">🏅 Achievements</button>
          <button class="menu-btn" onclick="window.showSettings(); window.closeProfileMenu()" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 15px 20px; border-radius: 15px; cursor: pointer; font-size: 18px; font-weight: 600; transition: all 0.3s ease; text-align: left;" onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateX(5px)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.transform='translateX(0)'">⚙️ Settings</button>
          <button class="menu-btn" onclick="window.logout(); window.closeProfileMenu()" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 15px 20px; border-radius: 15px; cursor: pointer; font-size: 18px; font-weight: 600; transition: all 0.3s ease; text-align: left;" onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateX(5px)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.transform='translateX(0)'">🚪 Logout</button>
        </div>
      </div>
      <!-- Overlay for closing menu -->
      <div id="profile-menu-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); opacity: 0; visibility: hidden; transition: all 0.4s ease; z-index: 999;" onclick="window.closeProfileMenu()"></div>
      <!-- Particle Background -->
      <div class="particles" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden;">
        <div class="particle" style="position: absolute; width: 4px; height: 4px; background: rgba(255,255,255,0.6); border-radius: 50%; top: 20%; left: 10%; animation: float 6s ease-in-out infinite;"></div>
        <div class="particle" style="position: absolute; width: 6px; height: 6px; background: rgba(255,154,158,0.8); border-radius: 50%; top: 60%; left: 80%; animation: float 8s ease-in-out infinite reverse;"></div>
        <div class="particle" style="position: absolute; width: 3px; height: 3px; background: rgba(168,237,234,0.7); border-radius: 50%; top: 40%; left: 60%; animation: float 7s ease-in-out infinite;"></div>
        <div class="particle" style="position: absolute; width: 5px; height: 5px; background: rgba(255,255,255,0.5); border-radius: 50%; top: 80%; left: 30%; animation: float 9s ease-in-out infinite reverse;"></div>
        <div class="particle" style="position: absolute; width: 4px; height: 4px; background: rgba(240,147,251,0.6); border-radius: 50%; top: 10%; left: 70%; animation: float 5s ease-in-out infinite;"></div>
      </div>
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 10px; background: linear-gradient(90deg, #ff9a9e 0%, #fecfef 25%, #fecfef 75%, #fecfef 100%); box-shadow: 0 4px 20px rgba(255, 154, 158, 0.7); border-radius: 35px 35px 0 0;"></div>
      <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 10px; background: linear-gradient(90deg, #a8edea 0%, #fed6e3 100%); box-shadow: 0 -4px 20px rgba(168, 237, 234, 0.7); border-radius: 0 0 35px 35px;"></div>
      <h2 style="text-align: center; color: white; margin-bottom: 60px; font-size: 45px; font-weight: 800; text-shadow: 0 0 20px rgba(255,255,255,0.8), 0 6px 20px rgba(0,0,0,0.8); animation: fadeInDown 1s ease; position: relative; z-index: 2; letter-spacing: 1.5px; background: linear-gradient(45deg, #fff, #f0f8ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">My Game Profile</h2>
      ${mainContent}
      <div style="text-align: center; padding-top: 50px; border-top: 3px solid rgba(255,255,255,0.5); position: relative; z-index: 2;">
        <button id="save-changes-btn" class="btn btn-small" onclick="window.saveProfile()" disabled style="background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%); color: #bdc3c7; padding: 20px 55px; border: none; border-radius: 45px; margin-right: 30px; cursor: not-allowed; font-weight: 800; box-shadow: 0 8px 25px rgba(127, 140, 141, 0.4), inset 0 1px 0 rgba(255,255,255,0.2); transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); font-size: 20px; text-shadow: 0 2px 6px rgba(0,0,0,0.4); position: relative; overflow: hidden;" onmouseover="if(!this.disabled){this.style.transform='translateY(-5px) scale(1.08)'; this.style.boxShadow='0 18px 45px rgba(78, 205, 196, 0.9)'; this.querySelector('.btn-glow').style.opacity='1'}" onmouseout="if(!this.disabled){this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 12px 35px rgba(78, 205, 196, 0.8)'; this.querySelector('.btn-glow').style.opacity='0'}">💾 Save Changes <div class="btn-glow" style="position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); transition: opacity 0.5s; opacity: 0;"></div></button>
        <button class="btn btn-small secondary" onclick="window.renderHome()" style="background: rgba(255,255,255,0.25); color: white; padding: 20px 55px; border: 3px solid rgba(255,255,255,0.6); border-radius: 45px; cursor: pointer; font-weight: 800; transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); font-size: 20px; text-shadow: 0 2px 6px rgba(0,0,0,0.4); backdrop-filter: blur(10px);" onmouseover="this.style.background='rgba(255,255,255,0.4)'; this.style.transform='translateY(-5px) scale(1.08)'; this.style.borderColor='rgba(255,255,255,0.8)'" onmouseout="this.style.background='rgba(255,255,255,0.25)'; this.style.transform='translateY(0) scale(1)'; this.style.borderColor='rgba(255,255,255,0.6)'">🏠 Back to Home</button>
      </div>
    </div>
    <style>
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-60px) scale(0.9); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(60px) scale(0.9); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes slideInLeft {
        from { opacity: 0; transform: translateX(-50px) scale(0.95); }
        to { opacity: 1; transform: translateX(0) scale(1); }
      }
      @keyframes bounceIn {
        0% { transform: scale(0) rotate(-180deg); opacity: 0; }
        50% { transform: scale(1.2) rotate(0deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 5px rgba(255,255,255,0.5); }
        50% { box-shadow: 0 0 20px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.6); }
      }
      /* Button hover animations */
      .btn-small {
        transition: all 0.4s ease;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      }
      .btn-small:hover {
        box-shadow: 0 12px 35px rgba(0,0,0,0.3);
        transform: translateY(-4px) scale(1.05);
      }
      .particles .particle {
        animation: float 6s ease-in-out infinite, glow 3s ease-in-out infinite;
      }
    </style>
  `;

  document.getElementById('app').innerHTML = profileHTML;

  window.updateNavAvatar();
}

// Make functions global so they can be called from HTML
window.selectAvatar = function(avatar){
  window.currentUser.avatar = avatar;
  window.checkProfileChanges();
  window.updateNavAvatar();
  window.ModalManager.hideModal('avatar-modal');
  window.renderProfile();
}

// Make functions global so they can be called from HTML
window.uploadAvatar = function(){
  let file = document.getElementById('avatar-upload').files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = function(e) {
      window.currentUser.avatar = e.target.result;
      window.checkProfileChanges();
      window.updateNavAvatar();
      window.ModalManager.hideModal('avatar-modal');
      window.renderProfile();
    };
    reader.readAsDataURL(file);
  }
}

window.showAvatarSelection = function() {
  let avatarHTML = defaultAvatars.map(a => {
    const isSelected = window.currentUser.avatar === a;
    const borderStyle = isSelected ? '4px solid #667eea' : '2px solid #e9ecef';
    return `<div class="avatar-option" onclick="window.selectAvatar('${a}')" style="width: 90px; height: 90px; border-radius: 50%; cursor: pointer; border: ${borderStyle}; display: inline-block; margin: 8px; transition: all 0.3s ease; box-shadow: ${isSelected ? '0 0 0 4px rgba(102, 126, 234, 0.2)' : '0 2px 8px rgba(0,0,0,0.1)'}; position: relative; overflow: hidden;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'; this.style.border='4px solid #667eea'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.3)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'; this.style.border='${borderStyle}'; this.style.boxShadow='${isSelected ? '0 0 0 4px rgba(102, 126, 234, 0.2)' : '0 2px 8px rgba(0,0,0,0.1)'}'">
      <img src="${a}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; object-position: center; transition: filter 0.3s ease;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='brightness(1)'">
      ${isSelected ? '<div style="position: absolute; top: 5px; right: 5px; width: 20px; height: 20px; background: #667eea; border-radius: 50%; border: 2px solid white;"></div>' : ''}
    </div>`;
  }).join("");

  // Preview section
  let previewHTML = '';
      if (window.currentUser.avatar) {
        let previewAvatar = window.currentUser.avatar.startsWith('http') || window.currentUser.avatar.startsWith('data:') 
          ? `<img src="${window.currentUser.avatar}" alt="Preview" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #667eea; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">`
          : `<div style="width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #2c3e50, #1a252f); display: flex; align-items: center; justify-content: center; border: 3px solid #667eea; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);"></div>`;
        previewHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); min-width: 180px; min-height: 180px;">
            <h4 style="color: #495057; margin-bottom: 10px;">Current Preview</h4>
            ${previewAvatar}
          </div>
        `;
      }

  const content = `
    <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #1e1e2f, #2c2c44); border-radius: 25px; max-height: 85vh; overflow-y: auto; color: #f0f0f5; position: relative; box-shadow: 0 0 30px rgba(102, 126, 234, 0.7); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="position: absolute; top: 15px; right: 15px; cursor: pointer; font-size: 28px; opacity: 0.85; color: #bbb;" onclick="window.ModalManager.hideModal('avatar-modal')" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#bbb'">✕</div>
      <h3 style="color: #a3a3ff; margin-bottom: 15px; font-size: 32px; font-weight: 700; text-shadow: 0 0 10px #a3a3ff;">🎨 Personalize Your Avatar</h3>
      <p style="color: #cfcfff; margin-bottom: 30px; font-size: 18px; font-weight: 500; letter-spacing: 0.5px;">Pick an avatar or upload your own photo to make your profile stand out!</p>
      ${previewHTML}
      <div style="margin-bottom: 35px; padding: 25px; background: rgba(255,255,255,0.05); border-radius: 20px; backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 0 15px rgba(163, 163, 255, 0.3); transition: box-shadow 0.3s ease;">
        <input type="file" id="avatar-upload" accept="image/*" onchange="window.uploadAvatar()" style="display: none;">
        <label for="avatar-upload" class="upload-btn" style="display: inline-block; padding: 18px 40px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 40px; cursor: pointer; font-weight: 700; box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6); font-size: 18px; letter-spacing: 0.8px; user-select: none; transition: transform 0.3s ease, box-shadow 0.3s ease;" onmouseover="this.style.transform='translateY(-3px) scale(1.05)'; this.style.boxShadow='0 12px 40px rgba(102, 126, 234, 0.8)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 8px 30px rgba(102, 126, 234, 0.6)'">📁 Add Your Photo</label>
      </div>
      <div style="margin-bottom: 30px; padding: 25px; background: rgba(255,255,255,0.05); border-radius: 20px; backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 0 20px rgba(163, 163, 255, 0.3); transition: box-shadow 0.3s ease;">
        <h4 style="color: #b0b0ff; margin-bottom: 25px; text-align: center; font-size: 22px; font-weight: 700; text-shadow: 0 0 8px #b0b0ff;">Choose Your Avatar</h4>
        <div class="avatar-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 20px; max-width: 480px; margin: 0 auto; justify-items: center;">
          ${avatarHTML}
        </div>
      </div>
      <button class="btn btn-small" onclick="window.ModalManager.hideModal('avatar-modal')" style="padding: 14px 30px; background: rgba(255,255,255,0.1); color: #bbb; border: 2px solid rgba(255,255,255,0.3); border-radius: 35px; cursor: pointer; font-weight: 700; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-size: 18px; letter-spacing: 0.6px; user-select: none; transition: background 0.3s ease, color 0.3s ease, transform 0.3s ease;" onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.color='#eee'; this.style.transform='translateY(-3px) scale(1.05)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.color='#bbb'; this.style.transform='translateY(0) scale(1)'">✕ Close</button>
    </div>
  `;

  window.ModalManager.showModal('avatar-modal', content, 'info');
};

window.showAchievements = function() {
  // Lazy load achievements.js if not loaded
  if (!window.achievementsLoaded) {
    const script = document.createElement('script');
    script.src = 'js/achievements.js';
    script.onload = () => {
      window.achievementsLoaded = true;
      window.showAchievements();
    };
    document.head.appendChild(script);
    return;
  }
  // Call the showAchievements function from achievements.js
  if (window.showAchievements) {
    window.showAchievements();
  }
}

// Make functions global so they can be called from HTML
window.saveProfile = function(){
  window.currentUser.username = document.getElementById('edit-username').value;
  window.currentUser.bio = document.getElementById('edit-bio').value;
  const ageInput = document.getElementById('edit-age');
  if (ageInput.value) {
    window.currentUser.age = parseInt(ageInput.value);
  } else {
    delete window.currentUser.age; // Remove if empty
  }
  window.currentUser.lastLogin = new Date().toLocaleDateString();
  let idx = window.users.findIndex(u => u.email === window.currentUser.email);
  if (idx !== -1) window.users[idx] = window.currentUser;
  localStorage.setItem('users', JSON.stringify(window.users));
  window.ModalManager.showAlert('Profile updated!', 'success');
  window.messages.push({ type: 'success', content: 'Profile updated!', timestamp: Date.now() });
  window.updateNavAvatar();
  window.renderProfile();
}

// Function to update avatar in navigation bar
window.updateNavAvatar = function(){
  let navAvatar = document.getElementById('nav-avatar');
  if (navAvatar && window.currentUser) {
    if (window.currentUser.avatar && (window.currentUser.avatar.startsWith('http') || window.currentUser.avatar.startsWith('data:'))) {
      navAvatar.src = window.currentUser.avatar;
      navAvatar.alt = '';
    } else {
      // Black circle data URI for no avatar
      navAvatar.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzAwMDAwMCIvPjwvc3ZnPg==';
      navAvatar.alt = '';
    }
    navAvatar.style.display = 'block';
    navAvatar.onclick = () => window.renderProfile();
    navAvatar.style.cursor = 'pointer';
  } else if (navAvatar) {
    navAvatar.style.display = 'none';
  }
}

// Profile menu functions
window.toggleProfileMenu = function(){
  const panel = document.getElementById('profile-menu-panel');
  const overlay = document.getElementById('profile-menu-overlay');
  if (panel.style.right === '0px') {
    window.closeProfileMenu();
  } else {
    panel.style.right = '0px';
    overlay.style.opacity = '1';
    overlay.style.visibility = 'visible';
  }
}

window.closeProfileMenu = function(){
  const panel = document.getElementById('profile-menu-panel');
  const overlay = document.getElementById('profile-menu-overlay');
  panel.style.right = '-300px';
  overlay.style.opacity = '0';
  overlay.style.visibility = 'hidden';
}

// Change detection for save button
window.checkProfileChanges = function(){
  const username = document.getElementById('edit-username').value;
  const bio = document.getElementById('edit-bio').value;
  const age = document.getElementById('edit-age').value;
  const avatar = window.currentUser.avatar;

  const hasChanged = (
    username !== window.originalProfile.username ||
    bio !== window.originalProfile.bio ||
    age !== window.originalProfile.age ||
    avatar !== window.originalProfile.avatar
  );

  const saveBtn = document.getElementById('save-changes-btn');
  if (hasChanged) {
    saveBtn.disabled = false;
    saveBtn.style.background = 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)';
    saveBtn.style.color = 'white';
    saveBtn.style.cursor = 'pointer';
    saveBtn.style.boxShadow = '0 12px 35px rgba(78, 205, 196, 0.8), inset 0 1px 0 rgba(255,255,255,0.2)';
  } else {
    saveBtn.disabled = true;
    saveBtn.style.background = 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)';
    saveBtn.style.color = '#bdc3c7';
    saveBtn.style.cursor = 'not-allowed';
    saveBtn.style.boxShadow = '0 8px 25px rgba(127, 140, 141, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
  }
}

// Placeholder functions for menu items (to be implemented)
window.renderLeaderboard = function(){
  // Lazy load leaderboard.js if not loaded
  if (!window.leaderboardLoaded) {
    const script = document.createElement('script');
    script.src = 'js/leaderboard.js';
    script.onload = () => {
      window.leaderboardLoaded = true;
      window.renderLeaderboard();
    };
    document.head.appendChild(script);
    return;
  }
  if (window.renderLeaderboard) {
    window.renderLeaderboard();
  }
}

window.showSettings = function(){
  window.ModalManager.showAlert('Settings feature coming soon!', 'info');
}

window.logout = function(){
  window.currentUser = null;
  localStorage.removeItem('currentUser');
  window.renderLogin();
}
