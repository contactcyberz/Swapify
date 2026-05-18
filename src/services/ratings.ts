import {
  collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, increment,
} from 'firebase/firestore';
import { db } from './firebase';

export const submitRating = async (
  reviewerId: string,
  reviewerName: string,
  reviewedId: string,
  exchangeId: string,
  rating: number,
  comment: string,
) => {
  // Save review
  await addDoc(collection(db, 'reviews'), {
    reviewerId, reviewerName, reviewedId,
    exchangeId, rating, comment,
    createdAt: serverTimestamp(),
  });

  // Update user's average rating
  const userSnap = await getDoc(doc(db, 'users', reviewedId));
  const userData = userSnap.data();
  if (userData) {
    const currentCount = userData.reviewCount || 0;
    const currentRating = userData.rating || 0;
    const newCount = currentCount + 1;
    const newRating = Math.round(((currentRating * currentCount + rating) / newCount) * 10) / 10;
    await updateDoc(doc(db, 'users', reviewedId), {
      rating: newRating,
      reviewCount: newCount,
    });
  }

  // Mark exchange as completed + add 1h to both users
  await updateDoc(doc(db, 'exchanges', exchangeId), { status: 'completed', ratedBy: reviewerId });
  await updateDoc(doc(db, 'users', reviewerId), { timeBalance: increment(1) });
  await updateDoc(doc(db, 'users', reviewedId), { timeBalance: increment(1) });
};
