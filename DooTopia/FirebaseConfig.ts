// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, initializeAuth } from "firebase/auth";
// import { getReactNativePersistence } from "firebase/auth/react-native"; // Remove this line
// import AsyncStorage from "@react-native-async-storage/async-storage"; // Remove this line

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCG5JANGORfs8X2t9WZJo98JqO82Ee2FCA",
  authDomain: "dootopia-9452a.firebaseapp.com",
  projectId: "dootopia-9452a",
  storageBucket: "dootopia-9452a.firebasestorage.app",
  messagingSenderId: "82803952890",
  appId: "1:82803952890:web:9e16a17284cbb9d8f3cd43",
  measurementId: "G-BSC9PCEHW2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app);