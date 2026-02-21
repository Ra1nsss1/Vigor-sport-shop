import { initializeApp, getApps, getApp } from "firebase/app"; // Додали getApps та getApp
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDCljFCS1_k20AX0Y0-hlYAF6e9NMhMkUA", // <-- Уважно встав ключ сюди (в лапках!)
  authDomain: "vigor-sport-acd02.firebaseapp.com",
  projectId: "vigor-sport-acd02",
  storageBucket: "vigor-sport-acd02.firebasestorage.app",
  messagingSenderId: "783915610704",
  appId: "1:783915610704:web:79d358ce039abdb9c51755",
  measurementId: "G-8SEVLYD7K4"
};

// Розумна ініціалізація: перевіряє, чи Firebase вже запущено. Якщо ні - запускає.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);