import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────────────────────
// SETUP INSTRUCTIONS
// 1. Go to https://console.firebase.google.com/ and create a new project
// 2. Click "Add app" → Web (</> icon)
// 3. Copy the firebaseConfig values below and replace the placeholders
// 4. In Firestore Database → Rules, set:
//       allow read, write: if true;   (for internal team use)
// ─────────────────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

// True only when real credentials have been filled in
export const FIREBASE_CONFIGURED = firebaseConfig.apiKey !== "YOUR_API_KEY";

const app = FIREBASE_CONFIGURED ? initializeApp(firebaseConfig) : null;
export const db = FIREBASE_CONFIGURED ? getFirestore(app) : null;
