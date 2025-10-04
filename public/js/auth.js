// Make variables global so they can be accessed from other files
window.users = [
    {username:"Unknown", email:"CoffeeRain@gmail.com", password:"MoonLight", avatar:"https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown"}
];
window.currentUser = null;
localStorage.setItem('users', JSON.stringify(window.users));

if(!localStorage.getItem('scores')) localStorage.setItem('scores', JSON.stringify([]));



// Make functions global so they can be called from HTML
window.handleLogin = function(){
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;
  const user = window.users.find(u => u.email === email || u.username === email);
  if(user && user.password === pass){
    window.currentUser = user;
    window.renderHome();
    window.updateNav(true);
    window.updateNavAvatar();
  } else {
    window.ModalManager.showAlert('Invalid credentials', 'error');
    window.messages.push({ type: 'error', content: 'Invalid credentials', timestamp: Date.now() });
  }
}

// Make functions global so they can be called from HTML
window.handleSignup = function(){
  const username = document.getElementById('signup-user').value;
  const email = document.getElementById('signup-email').value;
  const pass = document.getElementById('signup-pass').value;
  if(window.users.find(u => u.email === email)){
    window.ModalManager.showAlert('Email exists', 'error');
    window.messages.push({ type: 'error', content: 'Email exists', timestamp: Date.now() });
    return;
  }
  const newUser = {username, email, password: pass, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`};
  window.users.push(newUser);
  localStorage.setItem('users', JSON.stringify(window.users));
  window.currentUser = newUser;
  window.renderHome();
  window.updateNav(true);
  window.updateNavAvatar();
}

// Make functions global so they can be called from HTML
window.logout = function(){
  window.currentUser = null;
  window.renderLogin();
  window.updateNav(false);
}

// Render Login Page
window.renderLogin = function(){
  document.getElementById('app').innerHTML = `
    <main class="login-container">
      <div class="login-card">
        <h2><i class="fas fa-sign-in-alt"></i> Welcome Back</h2>
        <p>Sign in to continue your learning journey</p>
        <form id="login-form">
          <div class="input-group">
            <i class="fas fa-envelope"></i>
            <input type="email" id="login-email" placeholder="Email or Username" required>
          </div>
          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input type="password" id="login-pass" placeholder="Password" required>
          </div>
          <button type="button" class="btn primary" onclick="window.handleLogin()">
            <i class="fas fa-arrow-right"></i> Log In
          </button>
        </form>
        <p class="signup-link">Don't have an account? <a onclick="window.showSignup()">Sign up here</a></p>
      </div>
      <div class="login-bg"></div>
    </main>
  `;
  window.updateNav(false);
};

// Show Signup Form (toggle between login and signup)
window.showSignup = function(){
  document.getElementById('app').innerHTML = `
    <main class="login-container">
      <div class="login-card">
        <h2><i class="fas fa-user-plus"></i> Create Account</h2>
        <p>Join T-Gram and start learning today</p>
        <form id="signup-form">
          <div class="input-group">
            <i class="fas fa-user"></i>
            <input type="text" id="signup-user" placeholder="Username" required>
          </div>
          <div class="input-group">
            <i class="fas fa-envelope"></i>
            <input type="email" id="signup-email" placeholder="Email" required>
          </div>
          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input type="password" id="signup-pass" placeholder="Password" required>
          </div>
          <button type="button" class="btn primary" onclick="window.handleSignup()">
            <i class="fas fa-user-plus"></i> Sign Up
          </button>
        </form>
        <p class="login-link">Already have an account? <a onclick="window.renderLogin()">Log in here</a></p>
      </div>
      <div class="login-bg"></div>
    </main>
  `;
  window.updateNav(false);
};