// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCYaLmJviBl2D-BJdYmBgeIzzrT_osfSWw",
    authDomain: "nomnom-b421a.firebaseapp.com",
    projectId: "nomnom-b421a",
    storageBucket: "nomnom-b421a.firebasestorage.app",
    messagingSenderId: "995269927569",
    appId: "1:995269927569:web:783f27c75025229e3ad530"
  };
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
