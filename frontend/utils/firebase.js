// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "nexusai-b11ac.firebaseapp.com",
  projectId: "nexusai-b11ac",
  storageBucket: "nexusai-b11ac.firebasestorage.app",
  messagingSenderId: "187798469369",
  appId: "1:187798469369:web:cf40f9010367b022f10028",
  measurementId: "G-MYD6TN5WL4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export const auth=getAuth(app);
export const googleProvider= new GoogleAuthProvider()