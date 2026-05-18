import {
  collection, addDoc, onSnapshot, query,
  serverTimestamp, getDoc, doc,
} from 'firebase/firestore';
import { db } from './firebase';
import { notifyNewMessage } from './notifications';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
}

// Send a message in an exchange chat + notify recipient
export const sendMessage = async (
  exchangeId: string,
  senderId: string,
  senderName: string,
  text: string,
) => {
  await addDoc(collection(db, 'exchanges', exchangeId, 'messages'), {
    senderId,
    senderName,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });

  // Notify the other person
  try {
    const exchSnap = await getDoc(doc(db, 'exchanges', exchangeId));
    const exchData = exchSnap.data();
    if (exchData) {
      const recipientId = exchData.requesterId === senderId
        ? exchData.providerId
        : exchData.requesterId;
      const recipientSnap = await getDoc(doc(db, 'users', recipientId));
      const recipientData = recipientSnap.data();
      if (recipientData?.pushToken) {
        await notifyNewMessage(recipientData.pushToken, senderName, text);
      }
    }
  } catch (e) {}
};

// Listen to messages in real time (no orderBy = no index needed, sort in JS)
export const subscribeToMessages = (
  exchangeId: string,
  callback: (messages: ChatMessage[]) => void,
) => {
  const q = query(collection(db, 'exchanges', exchangeId, 'messages'));
  return onSnapshot(q, snap => {
    const msgs: ChatMessage[] = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as any),
    }));
    // Sort by createdAt ascending in JS
    msgs.sort((a, b) => {
      const ta = (a.createdAt as any)?.toMillis?.() ?? 0;
      const tb = (b.createdAt as any)?.toMillis?.() ?? 0;
      return ta - tb;
    });
    callback(msgs);
  }, (e) => { console.log('messages error:', e); });
};
