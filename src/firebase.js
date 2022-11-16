// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// For initializing the app once. Is used to initialize other Firebase SDKs

import { initializeApp } from "firebase/app";

// For Firebase Authentication
import { getAuth, GoogleAuthProvider, EmailAuthCredential, EmailAuthProvider, signInWithPopup, createUserWithEmailAndPassword} from "firebase/auth";

// For Firebase Cloud Firestore (Firestore DB)
import { getFirestore, collection, doc, getDoc, query, onSnapshot, setDoc} from "firebase/firestore";

// For Firebase Cloud Storage
import { getStorage } from "firebase/storage";

// For Firebase Analytics
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBnoX0koTAAnZDHMsW4XYETuzlakciiJVE",
  authDomain: "lateral-incline-365622.firebaseapp.com",
  projectId: "lateral-incline-365622",
  storageBucket: "lateral-incline-365622.appspot.com",
  messagingSenderId: "596326794480",
  appId: "1:596326794480:web:78643020d43b5032b8ae35",
  measurementId: "G-X3YWS1RDJM"
};

console.log(firebaseConfig.apiKey);
// Name of our Firebase application
const appName = "Spaced Out - Web";

//Initialization of Firebase application with configuration data and custom application name
const fireApp = initializeApp(firebaseConfig, appName);


// Initialization and exportation of Firebase Products used in the application
export const fireAuth = getAuth(fireApp);
export const fireDB = getFirestore(fireApp);
export const fireStorage = getStorage(fireApp);
export const fireLytics = getAnalytics(fireApp);
export {collection, doc, getDoc, query, onSnapshot, GoogleAuthProvider, setDoc};

