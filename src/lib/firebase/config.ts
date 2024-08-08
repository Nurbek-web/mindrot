// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcNaGmNQXFWArzvh0NP4J-1JRZqlwx_RM",
  authDomain: "brainrot-9d77e.firebaseapp.com",
  projectId: "brainrot-9d77e",
  storageBucket: "brainrot-9d77e.appspot.com",
  messagingSenderId: "780222194901",
  appId: "1:780222194901:web:d062a3b7970006b65d6e5c",
  measurementId: "G-9T18H1D4PW",
};

// Initialize Firebase
let firebase_app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default firebase_app;
