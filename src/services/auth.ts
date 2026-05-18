import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { authState } from './authState';

const USER_KEY = '@swapify_user';
const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

// ─── Input sanitization helper ───────────────────────────────────────────────
const sanitizeString = (str: string, maxLen = 200): string => {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen).replace(/[<>]/g, ''); // strip basic XSS chars
};

// ─── REGISTER ────────────────────────────────────────────────────────────────
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  consent?: {
    termsAcceptedAt: string;
    privacyAcceptedAt: string;
    legalVersion: string;
    consentIp: string;
  }
) => {
  // Validate & sanitize inputs before any processing
  const cleanEmail = sanitizeString(email, 254).toLowerCase();
  const cleanName  = sanitizeString(name, 60);

  if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
    throw new Error('Email invalide');
  }
  if (cleanName.length < 1) {
    throw new Error('Prénom invalide');
  }
  if (password.length < 6) {
    throw new Error('Mot de passe trop court');
  }

  let uid: string;
  let user: any;

  if (auth) {
    // ✅ PRODUCTION (EAS Build) — Real Firebase Auth
    const { createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    await updateProfile(cred.user, { displayName: cleanName });
    uid = cred.user.uid;
    user = { uid, email: cleanEmail, displayName: cleanName };
  } else {
    // 🛠 EXPO GO — Mock auth with AsyncStorage
    uid = generateId();
    user = { uid, email: cleanEmail, displayName: cleanName };
  }

  // Save to Firestore with consent record
  try {
    await setDoc(doc(db, 'users', uid), {
      id: uid,
      name: cleanName,
      email: cleanEmail,
      city: 'Montréal',
      country: 'Canada',
      skillsOffered: [],
      skillsWanted: [],
      timeBalance: 0,
      rating: 0,
      reviewCount: 0,
      exchangeCount: 0,
      isVerified: false,
      createdAt: serverTimestamp(),
      // ── Consentement légal horodaté (Loi 25 / LPRPDE) ──
      consent: consent ? {
        termsAcceptedAt:   consent.termsAcceptedAt,
        privacyAcceptedAt: consent.privacyAcceptedAt,
        legalVersion:      consent.legalVersion,
        consentSource:     consent.consentIp,
        recordedAt:        serverTimestamp(),
      } : null,
    });
  } catch (e) {
    console.log('Firestore error (non-blocking):', e);
  }

  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  authState.setUser(user);
  return user;
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const loginUser = async (email: string, password: string) => {
  if (auth) {
    // ✅ PRODUCTION — Real Firebase Auth
    const { signInWithEmailAndPassword } = require('firebase/auth');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
    };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    authState.setUser(user);
    return user;
  } else {
    // 🛠 EXPO GO — Mock auth
    const stored = await AsyncStorage.getItem(USER_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      if (user.email === email) {
        authState.setUser(user);
        return user;
      }
    }
    throw new Error('Email ou mot de passe incorrect');
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logoutUser = async () => {
  if (auth) {
    const { signOut } = require('firebase/auth');
    await signOut(auth);
  }
  await AsyncStorage.removeItem(USER_KEY);
  authState.setUser(null);
};

// ─── AUTH STATE CHANGE ────────────────────────────────────────────────────────
export const onAuthChange = (callback: (user: any) => void) => {
  if (auth) {
    // ✅ PRODUCTION — Real Firebase Auth listener
    const { onAuthStateChanged } = require('firebase/auth');
    return onAuthStateChanged(auth, async (firebaseUser: any) => {
      if (firebaseUser) {
        const user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        };
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        authState.setUser(user);
        callback(user);
      } else {
        await AsyncStorage.removeItem(USER_KEY);
        authState.setUser(null);
        callback(null);
      }
    });
  } else {
    // 🛠 EXPO GO — Mock auth listener
    AsyncStorage.getItem(USER_KEY).then(stored => {
      const user = stored ? JSON.parse(stored) : null;
      authState.setUser(user);
      callback(user);
    });
    return authState.subscribe(callback);
  }
};

// ─── GET USER PROFILE ─────────────────────────────────────────────────────────
export const getUserProfile = async (uid: string) => {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
};
