// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// For initializing the app once. Is used to initialize other Firebase SDKs
import { initializeApp } from "firebase/app";

// For Firebase Authentication
import { getAuth } from "firebase/auth";

// For Firebase Cloud Firestore (Firestore DB)
import { getFirestore } from "firebase/firestore";

// For Firebase Cloud Storage
import { getStorage } from "firebase/storage";

// For Firebase Analytics
import { getAnalytics } from "firebase/analytics";

// For Firebase Cloud Functions
import { getFunctions } from "firebase/functions";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Name of our Firebase application
const appName = "Spaced Out - Web";

//Initialization of Firebase application with configuration data and custom application name
const fireApp = initializeApp(firebaseConfig, appName);


// Initialization and exportation of Firebase Products used in the application
export const fireAuth = getAuth(fireApp);
export const fireDB = getFirestore(fireApp);
export const fireStorage = getStorage(fireApp);
export const fireLytics = getAnalytics(fireApp);
export const fireFunctions = getFunctions(fireApp);


