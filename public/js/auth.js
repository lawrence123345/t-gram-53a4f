// Make variables global so they can be accessed from other files
window.users = JSON.parse(localStorage.getItem('users')) || [
    {username:"Lawrence", email:"lawrence@gmail.com", password:"123456", avatar:"😀"},
    {username:"Unknown", email:"unknown@gmail.com", password:"123456", avatar:"😎"}
];
window.currentUser = null;
localStorage.setItem('users', JSON.stringify(window.users));

if(!localStorage.getItem('scores')) localStorage.setItem('scores', JSON.stringify([]));

// Make functions global so they can be called from app.js
window.renderLogin = function(){
  document.getElementById('app').innerHTML = `<div class="auth-card">
<h2>Log In</h2>
<input type="text" id="login-email" placeholder="Email or Username">
<input type="password" id="login-pass" placeholder="Password">
<button class="btn" onclick="handleLogin()">Log In</button>
<p>Don’t have an account? <a onclick="renderSignup()">Sign up here</a></p>
</div>`;
  updateNav(false);
}

// Make functions global so they can be called from HTML
window.renderSignup = function(){
  document.getElementById('app').innerHTML = `<div class="auth-card">
<h2>Sign Up</h2>
<input type="text" id="signup-user" placeholder="Username">
<input type="text" id="signup-email" placeholder="Email">
<input type="password" id="signup-pass" placeholder="Password">
<button class="btn" onclick="handleSignup()">Create Account</button>
<p>Already have an account? <a onclick="renderLogin()">Log in here</a></p>
</div>`;
  updateNav(false);
}

// Make functions global so they can be called from HTML
window.handleLogin = function(){
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;
  const user = users.find(u => u.email === email || u.username === email);
  if(user && user.password === pass){
    currentUser = user;
    renderHome();
    updateNav(true);
  } else alert("Invalid credentials");
}

// Make functions global so they can be called from HTML
window.handleSignup = function(){
  const username = document.getElementById('signup-user').value;
  const email = document.getElementById('signup-email').value;
  const pass = document.getElementById('signup-pass').value;
  if(users.find(u => u.email === email)){ alert("Email exists"); return; }
  const newUser = {username, email, password: pass, avatar: "😀"};
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  currentUser = newUser;
  renderHome();
  updateNav(true);
}

// Make functions global so they can be called from HTML
window.logout = function(){
  currentUser = null;
  renderLogin();
  updateNav(false);
}
