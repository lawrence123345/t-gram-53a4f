// Firebase module for reusable exports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

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
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
