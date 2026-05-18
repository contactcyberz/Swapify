import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export const toggleFavorite = async (userId: string, targetId: string): Promise<boolean> => {
  const userSnap = await getDoc(doc(db, 'users', userId));
  const favorites: string[] = userSnap.data()?.favorites || [];
  const isFav = favorites.includes(targetId);

  await updateDoc(doc(db, 'users', userId), {
    favorites: isFav ? arrayRemove(targetId) : arrayUnion(targetId),
  });

  return !isFav; // return new state
};

export const getFavorites = async (userId: string): Promise<string[]> => {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.data()?.favorites || [];
};
