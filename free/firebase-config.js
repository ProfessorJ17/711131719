// firebase-config.js
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,  // Use GitHub secret for API key
  authDomain: process.env.FIREBASE_AUTH_DOMAIN, // Use GitHub secret for Auth domain
  projectId: process.env.FIREBASE_PROJECT_ID,  // Use GitHub secret for project ID
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Use GitHub secret for storage bucket
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,  // Use GitHub secret for messaging sender ID
  appId: process.env.FIREBASE_APP_ID, // Use GitHub secret for app ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
