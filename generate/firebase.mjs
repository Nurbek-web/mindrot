import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBcNaGmNQXFWArzvh0NP4J-1JRZqlwx_RM",
  authDomain: "brainrot-9d77e.firebaseapp.com",
  projectId: "brainrot-9d77e",
  storageBucket: "brainrot-9d77e.appspot.com",
  messagingSenderId: "780222194901",
  appId: "1:780222194901:web:d062a3b7970006b65d6e5c",
  measurementId: "G-9T18H1D4PW",
};

const app = firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

export const updateStatusVideo = async (videoId, message, progress) => {
  if (progress) {
    await db
      .collection("pending-videos")
      .doc(videoId)
      .update({ status: message, progress: progress });
  } else {
    await db
      .collection("pending-videos")
      .doc(videoId)
      .update({ status: message });
  }
};

export default db;
