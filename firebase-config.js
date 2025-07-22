// Firebase configuration and initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB_Xa-AgdgEYWbOXQvXSku9Vb9pgWv8EEY",
    authDomain: "blog-af357.firebaseapp.com",
    projectId: "blog-af357",
    storageBucket: "blog-af357.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:742174134068:web:c5facec576b08de36f5f61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export the app for other modules
export default app;
