import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export type ReportReason =
  | 'spam'
  | 'inappropriate'
  | 'fake'
  | 'harassment'
  | 'other';

export const REPORT_REASONS: { id: ReportReason; label: string; emoji: string }[] = [
  { id: 'spam', label: 'Spam ou publicité', emoji: '📢' },
  { id: 'inappropriate', label: 'Contenu inapproprié', emoji: '🚫' },
  { id: 'fake', label: 'Faux profil', emoji: '🎭' },
  { id: 'harassment', label: 'Harcèlement', emoji: '⚠️' },
  { id: 'other', label: 'Autre raison', emoji: '❓' },
];

export const reportUser = async (
  reporterId: string,
  reportedUserId: string,
  reportedName: string,
  reason: ReportReason,
  details?: string,
) => {
  await addDoc(collection(db, 'reports'), {
    reporterId,
    reportedUserId,
    reportedName,
    reason,
    details: details || '',
    status: 'pending', // pending | reviewed | resolved
    createdAt: serverTimestamp(),
  });
};
