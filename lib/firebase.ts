import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJSyDFFc0wiODLX6pwYvceSwWHtVoLTu8",
  authDomain: "cadeiras-app-2d9e0.firebaseapp.com",
  projectId: "cadeiras-app-2d9e0",
  storageBucket: "cadeiras-app-2d9e0.firebasestorage.app",
  messagingSenderId: "344523462451",
  appId: "1:344523462451:web:ab8f0bd30666a262b65046",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
