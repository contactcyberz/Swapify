import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBW8mkFPyB9g39siwSI08HCfMMNltJh8ok",
  authDomain: "swapify-756e9.firebaseapp.com",
  projectId: "swapify-756e9",
  storageBucket: "swapify-756e9.firebasestorage.app",
  messagingSenderId: "947642606213",
  appId: "1:947642606213:web:e2732ea0181c41a7473fec"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);

let firebaseAuth: any = null;
try {
  const { initializeAuth, getAuth, getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  
  // Si auth déjà initialisé (ex: hot reload ou iPad), utiliser getAuth
  const existingApps = getApps();
  try {
    firebaseAuth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    // Auth déjà initialisé — récupérer l'instance existante
    firebaseAuth = getAuth(app);
  }
} catch (e) {
  console.log('Firebase Auth not available — using mock auth');
}

export const auth = firebaseAuth;
export const storage = null;
export default app;
