import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getAuth, GoogleAuthProvider, signInWithPopup, signOut }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAWiaQepWKPl0vCZrJ8gd3dSuiLghv9IIw",
  authDomain: "video-c69df.firebaseapp.com",
  projectId: "video-c69df",
  storageBucket: "video-c69df.firebasestorage.app",
  messagingSenderId: "666194002818",
  appId: "1:666194002818:web:236309eb31ac5e51d4c59b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export { signInWithPopup, signOut };
