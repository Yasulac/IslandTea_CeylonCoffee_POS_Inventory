// Setup script for Firebase Authentication users
// Run this in a Node.js environment with Firebase Admin SDK

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

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
const auth = getAuth(app);

// Demo users to create
const demoUsers = [
  {
    email: 'admin@islandtea.com',
    password: 'admin123',
    displayName: 'Admin'
  },
  {
    email: 'cashier@islandtea.com',
    password: 'cashier123',
    displayName: 'Cashier'
  },
  {
    email: 'admin2@islandtea.com',
    password: 'admin456',
    displayName: 'Admin'
  },
  {
    email: 'cashier2@islandtea.com',
    password: 'cashier456',
    displayName: 'Cashier'
  }
];

async function createUsers() {
  console.log('Creating Firebase Authentication users...');
  
  for (const user of demoUsers) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        user.email, 
        user.password
      );
      
      console.log(`✅ Created user: ${user.email} (${user.displayName})`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  User already exists: ${user.email}`);
      } else {
        console.error(`❌ Failed to create user ${user.email}:`, error.message);
      }
    }
  }
  
  console.log('Setup complete!');
}

// Run the setup
createUsers().catch(console.error);
