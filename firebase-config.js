// Firebase configuration and initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBgquv4Ks6_5e0FyUj7wZd0HjM0-aOUc_0",
  authDomain: "sociality-e43a5.firebaseapp.com",
  projectId: "sociality-e43a5",
  storageBucket: "sociality-e43a5.firebasestorage.app",
  messagingSenderId: "282309210752",
  appId: "1:282309210752:web:fa8d45907a188e82f7ac65",
  measurementId: "G-PQWDHNXVFW"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export the app for other modules
export default app;
