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

// Avoid re-initializing on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

// Firebase Auth: works in EAS Build (production), not in Expo Go
// In production, we replace the mock auth with real Firebase Auth
let firebaseAuth: any = null;
try {
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  firebaseAuth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Expo Go: Firebase Auth not compatible with New Architecture
  // Using AsyncStorage mock auth instead (see auth.ts)
  console.log('Firebase Auth not available in Expo Go — using mock auth');
}

export const auth = firebaseAuth;
export const storage = null;
export default app;
