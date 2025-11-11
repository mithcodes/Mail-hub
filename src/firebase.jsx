// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCfS-5LOdd97QvcZSOUelqxtMks8QxBgE0",
  authDomain: "mailhub-70884.firebaseapp.com",
  projectId: "mailhub-70884",
  storageBucket: "mailhub-70884.firebasestorage.app",
  messagingSenderId: "1032515429895",
  appId: "1:1032515429895:web:9b77b7176be5f4c0c6eca2",
  measurementId: "G-3FRXKT2R1D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();