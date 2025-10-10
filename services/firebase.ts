// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXVxoUhLpYGSjrkOXcYHZ47yGnr8Rkofk",
  authDomain: "meuapp-1b699.firebaseapp.com",
  projectId: "meuapp-1b699",
  storageBucket: "meuapp-1b699.firebasestorage.app",
  messagingSenderId: "955874276977",
  appId: "1:955874276977:web:bc729afcb698fecb460dd0",
  measurementId: "G-JL00DTE590"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);