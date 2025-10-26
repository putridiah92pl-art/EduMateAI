// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// =================================================================================
// TODO: PASTE YOUR FIREBASE CONFIGURATION HERE
// =================================================================================
// Your web app's Firebase configuration.
//
// 1. Go to your Firebase project console: https://console.firebase.google.com/
// 2. In the project settings, find your web app's configuration object.
// 3. Copy the entire object and paste it here, replacing the placeholder values.
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyA6vxf_eJe3MMIiuS3Fqso-6RDthh4qRfQ",
  authDomain: "YOUR_AUTH_DOMAIN.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
// This check prevents re-initialization on hot-reloads
if (!firebase.apps.length) {
  // Add a console warning for developers if placeholder values are still being used.
  if (firebaseConfig.apiKey === "YOUR_API_KEY" || firebaseConfig.authDomain.startsWith("YOUR_")) {
    console.warn("Firebase is using placeholder credentials. Please update your configuration in 'services/firebase.ts' for the app to function correctly.");
  }
  firebase.initializeApp(firebaseConfig);
}

// Export auth instance to be used in other parts of the app
export const auth = firebase.auth();
export default firebase;