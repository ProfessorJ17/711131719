// firebase-config.js
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,  // GitHub secret for API key
  authDomain: process.env.FIREBASE_AUTH_DOMAIN, // GitHub secret for Auth domain
  projectId: process.env.FIREBASE_PROJECT_ID,  // GitHub secret for project ID
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // GitHub secret for storage bucket
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,  // GitHub secret for messaging sender ID
  appId: process.env.FIREBASE_APP_ID, // GitHub secret for app ID
};
