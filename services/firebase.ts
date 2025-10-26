// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// Your web app's Firebase configuration
// IMPORTANT: Replace with your actual Firebase project configuration from your Firebase console.
const firebaseConfig = {
  apiKey: "AIzaSyABC-123DEF456GHI789JKL-MNO", // Replace with your value
  authDomain: "your-project-id.firebaseapp.com", // Replace with your value
  projectId: "your-project-id", // Replace with your value
  storageBucket: "your-project-id.appspot.com", // Replace with your value
  messagingSenderId: "123456789012", // Replace with your value
  appId: "1:123456789012:web:a1b2c3d4e5f6g7h8i9j0" // Replace with your value
};

// Initialize Firebase
// This check prevents re-initialization on hot-reloads
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export auth instance to be used in other parts of the app
export const auth = firebase.auth();
export default firebase;
