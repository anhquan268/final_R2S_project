// Import the necessary Firebase modules from Firebase SDK v9+
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAhfo3784zKGWVJRQbhbZEuxZpdCP4yw5k",
    authDomain: "chat-reactjs-54898.firebaseapp.com",
    projectId: "chat-reactjs-54898",
    storageBucket: "chat-reactjs-54898.firebasestorage.app",
    messagingSenderId: "250177889716",
    appId: "1:250177889716:web:6385820525645a5a8e3ee1",
    measurementId: "G-YMS03SMKBZ"
  };

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Get Firestore instance
const db = getFirestore(firebaseApp);

export { db };
