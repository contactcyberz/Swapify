import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  if (getApps().length > 0) {
    try {
      firebaseAuth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
      console.log('[Firebase] initializeAuth OK');
    } catch (e: any) {
      if (e?.code === 'auth/already-initialized') {
        firebaseAuth = getAuth(app);
        console.log('[Firebase] getAuth (already-initialized) OK');
      } else {
        firebaseAuth = getAuth(app);
        console.log('[Firebase] getAuth (fallback) OK');
      }
    }
  }
} catch (e) {
  console.log('[Firebase] Auth init failed completely:', e);
}

if (!firebaseAuth) {
  console.error('[Firebase] auth is NULL — login will fail!');
}

export const auth = firebaseAuth;
export const storage = null;

let analyticsInstance: any = null;
isSupported().then(yes => {
  if (yes) analyticsInstance = getAnalytics(app);
}).catch(() => {});

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  try {
    if (analyticsInstance) logEvent(analyticsInstance, eventName, params);
  } catch (e) {}
};

export default app;