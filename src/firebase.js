import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Add this line
import { getStorage } from "firebase/storage"; // Add this line

const firebaseConfig = {
  apiKey: "AIzaSyB7NJnzDU3R7z5Fy9lXEjQR-rP9MlmHFU4",
  authDomain: "nextrendstore-5d9c8.firebaseapp.com",
  projectId: "nextrendstore-5d9c8",
  storageBucket: "nextrendstore-5d9c8.firebasestorage.app",
  messagingSenderId: "550237910683",
  appId: "1:550237910683:web:6cb3bba164c33a7d50383e",
  measurementId: "G-F1RVQP4S4P",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// EXPORT these so Admin.js and App.js can see them
export const db = getFirestore(app);
export const storage = getStorage(app);
