// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCJDIGmrH0K-IoSm63XZihoq5KkNG02YVw",
    authDomain: "islandtea-cc-pos-inventorys.firebaseapp.com",
    projectId: "islandtea-cc-pos-inventorys",
    storageBucket: "islandtea-cc-pos-inventorys.firebasestorage.app",
    messagingSenderId: "56002617338",
    appId: "1:56002617338:web:c6b3afad5f9ac408c6ce43"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you plan to use
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
