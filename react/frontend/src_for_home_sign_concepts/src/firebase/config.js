// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDH0H6mgPvHe4FVMZNYMFBZ0ocKWT2wvw8",
  authDomain: "signease-7a44e.firebaseapp.com",
  projectId: "signease-7a44e",
  storageBucket: "signease-7a44e.firebasestorage.app",
  messagingSenderId: "840206671288",
  appId: "1:840206671288:web:901c50213c205cecd8434d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const provider = new GoogleAuthProvider();
export const auth = getAuth(app);