// Firebase configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyCDdPwaB8mH9TsM5hyXFbF0fNpFaWXjmV0",
  authDomain: "novus-roleplay.firebaseapp.com",
  projectId: "novus-roleplay",
  storageBucket: "novus-roleplay.firebasestorage.app",
  messagingSenderId: "207082104048",
  appId: "1:207082104048:web:bbf438aba78c9a7e79ce35",
  measurementId: "G-V0LK42BXRT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

window.auth = auth;
window.db = db;
