// Firebase SDK loader - loads Firebase from CDN
(function() {
    // Create script elements for Firebase SDKs
    const scripts = [
        'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js',
        'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js',
        'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'
    ];
    
    let loadedCount = 0;
    
    function initFirebase() {
        try {
            // Your web app's Firebase configuration
            const firebaseConfig = {
                apiKey: "AIzaSyAcsUPTJHGsty4TysuoHRffPeBtHhCob90",
                authDomain: "t-gram-53a4f.firebaseapp.com",
                projectId: "t-gram-53a4f",
                storageBucket: "t-gram-53a4f.firebasestorage.app",
                messagingSenderId: "1014219227882",
                appId: "1:1014219227882:web:d7920fa32ee32080280d93"
            };

            // Initialize Firebase
            const app = firebase.initializeApp(firebaseConfig);

            // Initialize Firebase Authentication
            const auth = firebase.auth();
            window.auth = auth;

            // Initialize Cloud Firestore
            const db = firebase.firestore();
            window.db = db;

            // Make auth functions global - directly from firebase.auth()
            // These are the actual Firebase SDK functions
            window.signInWithEmailAndPassword = firebase.auth().signInWithEmailAndPassword;
            window.createUserWithEmailAndPassword = firebase.auth().createUserWithEmailAndPassword;
            window.signOut = firebase.auth().signOut;
            window.onAuthStateChanged = firebase.auth().onAuthStateChanged;

            // Make Firestore functions global - directly from firebase.firestore()
            window.doc = function(collection, id) {
                return firebase.firestore().collection(collection).doc(id);
            };
            window.getDoc = function(docRef) {
                return docRef.get();
            };
            window.setDoc = function(docRef, data) {
                return docRef.set(data);
            };

            // Signal that Firebase is ready
            window.firebaseReady = true;
            console.log('Firebase initialized successfully');
            
            // Dispatch event to notify other scripts
            window.dispatchEvent(new Event('firebaseReady'));
        } catch (error) {
            console.error('Error initializing Firebase:', error);
        }
    }
    
    function loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = function() {
            loadedCount++;
            if (loadedCount === scripts.length) {
                callback();
            }
        };
        script.onerror = function() {
            console.error('Failed to load:', src);
            loadedCount++;
            if (loadedCount === scripts.length) {
                callback();
            }
        };
        document.head.appendChild(script);
    }
    
    // Load all Firebase scripts
    scripts.forEach(function(src) {
        loadScript(src, initFirebase);
    });
})();
