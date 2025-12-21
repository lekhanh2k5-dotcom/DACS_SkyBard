import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase config is valid
const isFirebaseConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;

let app = null;
let database = null;
let storage = null;
let auth = null;

if (isFirebaseConfigValid) {
    try {
        // Initialize Firebase
        app = initializeApp(firebaseConfig);
        database = getDatabase(app);
        storage = getStorage(app);
        auth = getAuth(app);
        console.log('✅ Firebase initialized successfully');
        console.log('📊 Config:', {
            projectId: firebaseConfig.projectId,
            authDomain: firebaseConfig.authDomain
        });
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        console.error('⚠️ Please check your Firebase config in .env file');
    }
} else {
    console.warn('⚠️ Firebase config not found - app will use local data only');
    console.warn('📝 Please create .env file with Firebase credentials');
}

export { database, storage, auth };
export default app;
