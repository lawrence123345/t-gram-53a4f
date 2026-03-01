// Make variables global so they can be accessed from other files
window.currentUser = null;
window.authChecked = false; // Flag to track if auth state has been checked

if(!localStorage.getItem('scores')) localStorage.setItem('scores', JSON.stringify([]));

// Fallback timeout to show login page if auth takes too long
window.authTimeout = setTimeout(() => {
  if (!window.authChecked) {
    console.log('Auth check timed out, showing login page');
    window.authChecked = true;
    window.renderLogin();
    window.updateNav(false);
  }
}, 5000); // 5 seconds timeout

// Wait for Firebase to be ready before setting up auth listener
function setupAuthListener() {
    if (window.auth && window.db) {
        // Firebase Auth State Listener
        window.onAuthStateChanged(window.auth, async (user) => {
            // Clear the timeout since we got a response
            clearTimeout(window.authTimeout);
            
            window.authChecked = true; // Set flag when auth state is determined
            if (user) {
                // User is signed in
                try {
                    const userDocRef = window.doc(window.db, 'users', user.uid);
                    const userDoc = await window.getDoc(userDocRef);
                    if (userDoc.exists()) {
                        window.currentUser = { uid: user.uid, email: user.email, ...userDoc.data() };
                    } else {
                        // If no data, create default
                        window.currentUser = { uid: user.uid, email: user.email, username: 'Unknown', avatar: null, bio: '', age: null };
                        await window.setDoc(userDocRef, window.currentUser);
                    }
                    window.renderHome();
                    window.updateNav(true);
                    window.updateNavAvatar();
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    // Show login page on error
                    window.renderLogin();
                    window.updateNav(false);
                }
            } else {
                // User is signed out
                window.currentUser = null;
                window.renderLogin();
                window.updateNav(false);
                window.updateNavAvatar();
            }
        });
    } else {
        // Firebase not ready yet, check again in 500ms
        setTimeout(setupAuthListener, 500);
    }
}

// Start checking for Firebase
setupAuthListener();

// Email validation function
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Helper function to wait for Firebase to be ready
async function waitForFirebase() {
  let attempts = 0;
  while (!window.auth || !window.db || !window.signInWithEmailAndPassword) {
    if (attempts > 20) { // Wait up to 10 seconds
      throw new Error('Firebase failed to load. Please refresh the page.');
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    attempts++;
  }
  return { auth: window.auth, db: window.db };
}

// Make functions global so they can be called from HTML
window.handleLogin = async function(){
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;

  if (!email || !pass) {
    window.ModalManager.showAlert('Please enter email and password.', 'error');
    return;
  }

  try {
    // Wait for Firebase to be ready
    const { auth } = await waitForFirebase();
    
    const userCredential = await window.signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Get user data from Firestore
    const userDocRef = window.doc(window.db, 'users', user.uid);
    const userDoc = await window.getDoc(userDocRef);
    if (userDoc.exists()) {
      window.currentUser = { uid: user.uid, email: user.email, ...userDoc.data() };
    } else {
      // If no data, create default
      window.currentUser = { uid: user.uid, email: user.email, username: 'Unknown', avatar: null, bio: '', age: null };
      await window.setDoc(userDocRef, window.currentUser);
    }

    window.renderHome();
    window.updateNav(true);
    window.updateNavAvatar();
  } catch (error) {
    console.error('Login error:', error);
    window.ModalManager.showAlert(error.message, 'error');
  }
}

// Make functions global so they can be called from HTML
window.handleSignup = async function(){
  const username = document.getElementById('signup-user').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pass = document.getElementById('signup-pass').value;

  if (!username || !email || !pass) {
    window.ModalManager.showAlert('Please fill in all fields.', 'error');
    return;
  } else if (!isValidEmail(email)) {
    window.ModalManager.showAlert('Invalid email format.', 'error');
    return;
  } else if (pass.length < 6) {
    window.ModalManager.showAlert('Password must be at least 6 characters.', 'error');
    return;
  }

  try {
    // Wait for Firebase to be ready
    const { auth } = await waitForFirebase();
    
    const userCredential = await window.createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Store user data in Firestore
    const userDocRef = window.doc(window.db, 'users', user.uid);
    await window.setDoc(userDocRef, {
      username: username,
      email: email,
      avatar: null,
      bio: '',
      age: null
    });

    await window.signOut(auth);
    window.ModalManager.showAlert('Account created successfully! Please log in now.', 'success');
    window.renderLogin();
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 'auth/email-already-in-use') {
      window.ModalManager.showAlert('This email is already registered. Please log in instead.', 'error');
    } else {
      window.ModalManager.showAlert(error.message, 'error');
    }
  }
}

// Make functions global so they can be called from HTML
window.handleForgotPassword = function(){
  const content = `
    <h3><i class="fas fa-key"></i> Reset Your Password</h3>
    <p>Enter your email address and we'll send you a link to reset your password.</p>
    <div class="input-group">
      <i class="fas fa-envelope"></i>
      <input type="email" id="reset-email" placeholder="Email" required>
    </div>
    <button class="btn primary" onclick="window.sendReset()">Send Reset Link</button>
  `;
  window.ModalManager.showModal('forgot-modal', content, 'info');
}

// Send reset link
window.sendReset = function(){
  const email = document.getElementById('reset-email').value;
  if(email){
    // Placeholder: in real app, send reset email
    window.ModalManager.showAlert('Password reset email sent to ' + email, 'success');
    window.ModalManager.hideModal('forgot-modal');
  }
}

// Make functions global so they can be called from HTML
window.logout = function(){
    const confirmContent = `
    <div class="confirm-content">
      <p>Are you sure you want to log out? Your grammar progress will be saved.</p>
      <button onclick="window.confirmLogout()" class="btn primary">Log Out</button>
      <button onclick="ModalManager.hideModal('confirm-logout')" class="btn secondary">Cancel</button>
    </div>
  `;
  window.ModalManager.showModal('confirm-logout', confirmContent, 'info');
}

// Confirm logout
window.confirmLogout = async function(){
  ModalManager.hideModal('confirm-logout');
  // Save progress (assuming scores are already in localStorage)
  // Fade out
  const app = document.getElementById('app');
  app.style.transition = 'opacity 0.5s';
  app.style.opacity = '0';
  setTimeout(async () => {
    await window.signOut(window.auth);
    window.currentUser = null;
    window.renderLogin();
    window.updateNav(false);
    window.updateNavAvatar();
    app.style.opacity = '1';
    // Show message
    setTimeout(() => {
      const username = window.currentUser?.username || 'Player';
      window.ModalManager.showAlert(`Great work today, ${username}! Keep improving your grammar skills.`, 'success');
    }, 500);
  }, 500);
}

// Render Login Page
window.renderLogin = function(){
  if (!window.authChecked) {
    // Auth state not yet determined, keep loading state
    return;
  }
  document.getElementById('app').innerHTML = `
    <main class="login-container">
      <div class="login-card">
        <h2><i class="fas fa-sign-in-alt"></i> Welcome Back</h2>
        <p>Sign in to continue your learning journey</p>
        <form id="login-form">
          <div class="input-group">
            <i class="fas fa-envelope"></i>
            <input type="email" id="login-email" placeholder="Email" required>
          </div>
          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input type="password" id="login-pass" placeholder="Password" required>
          </div>
          <button type="button" class="btn primary" onclick="window.handleLogin()">
            <i class="fas fa-arrow-right"></i> Log In
          </button>
        </form>
        <p class="signup-link"><a onclick="window.handleForgotPassword()">Forgot Password?</a></p>
        <p class="signup-link">Don't have an account? <a onclick="window.showSignup()">Sign up</a></p>
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
        <p class="login-link">Already have an account? <a onclick="window.renderLogin()">Log in</a></p>
      </div>
      <div class="login-bg"></div>
    </main>
  `;
  window.updateNav(false);
};
