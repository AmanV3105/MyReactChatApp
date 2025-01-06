// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3exDtwqePZxXKI-6RY4lN5IeY7LEB_JA",
  authDomain: "reactchatapp-41568.firebaseapp.com",
  projectId: "reactchatapp-41568",
  storageBucket: "reactchatapp-41568.firebasestorage.app",
  messagingSenderId: "581572485979",
  appId: "1:581572485979:web:1bca2e6bd6bc882808b07e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage(app);
