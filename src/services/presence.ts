import { doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// Update lastSeen every time user is active
export const updatePresence = async (userId: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      lastSeen: serverTimestamp(),
      isOnline: true,
    });
  } catch (e) {}
};

// Is user online? (lastSeen within 5 minutes)
export const isUserOnline = (lastSeen: any): boolean => {
  if (!lastSeen) return false;
  const date = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
  const diff = Date.now() - date.getTime();
  return diff < 5 * 60 * 1000; // 5 minutes
};

// Set offline when app goes to background
export const setOffline = async (userId: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), { isOnline: false });
  } catch (e) {}
};
