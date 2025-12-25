import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import the storage service

// Your web app's Firebase configuration is hard-coded here.
const firebaseConfig = {
    apiKey: "AIzaSyD9kvNqsFEVXb_rYVhdBqox_A7LD56nr4I",
    authDomain: "aatmikjagratimusics.firebaseapp.com",
    projectId: "aatmikjagratimusics",
    storageBucket: "aatmikjagratimusics.firebasestorage.app",
    messagingSenderId: "219264603558",
    appId: "1:219264603558:web:c282eb09d81ad94043ab67",
    measurementId: "G-QWK91ZGZYE"
};

// Initialize Firebase and its services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize and export Auth, Firestore, and Storage
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); 
export const db = getFirestore(app);
export const storage = getStorage(app); // Create and export the storage instance

// Export the main app instance
export default app;