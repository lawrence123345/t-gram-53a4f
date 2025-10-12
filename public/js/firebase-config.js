// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcsUPTJHGsty4TysuoHRffPeBtHhCob90",
  authDomain: "t-gram-53a4f.firebaseapp.com",
  projectId: "t-gram-53a4f",
  storageBucket: "t-gram-53a4f.firebasestorage.app",
  messagingSenderId: "1014219227882",
  appId: "1:1014219227882:web:d7920fa32ee32080280d93"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
window.auth = firebase.auth();

// Initialize Cloud Firestore and get a reference to the service
window.db = firebase.firestore();
