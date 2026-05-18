import {
  collection, addDoc, doc, updateDoc, getDoc,
  query, where, serverTimestamp, onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { notifyNewExchange, notifyExchangeAccepted } from './notifications';

export interface ExchangeData {
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  skillOffered: string;
  skillWanted: string;
  message: string;
  duration: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
}

// Create a new exchange request + notify provider
export const createExchange = async (data: ExchangeData) => {
  try {
    const ref = await addDoc(collection(db, 'exchanges'), {
      ...data,
      createdAt: serverTimestamp(),
    });

    // Notify the provider
    try {
      const providerSnap = await getDoc(doc(db, 'users', data.providerId));
      const providerData = providerSnap.data();
      if (providerData?.pushToken) {
        await notifyNewExchange(providerData.pushToken, data.requesterName);
      }
    } catch (e) {}

    return ref.id;
  } catch (e) {
    console.log('createExchange error:', e);
    throw e;
  }
};

// Get all exchanges involving a user (real-time listener)
export const subscribeToMyExchanges = (
  userId: string,
  callback: (exchanges: any[]) => void,
) => {
  const q1 = query(collection(db, 'exchanges'), where('requesterId', '==', userId));
  const q2 = query(collection(db, 'exchanges'), where('providerId', '==', userId));

  let results1: any[] = [];
  let results2: any[] = [];

  const merge = () => {
    const all = [...results1, ...results2];
    const seen = new Set();
    const unique = all.filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
    unique.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
    callback(unique);
  };

  const unsub1 = onSnapshot(q1, snap => {
    results1 = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    merge();
  }, (e) => { console.log('unsub1 error:', e); callback([]); });

  const unsub2 = onSnapshot(q2, snap => {
    results2 = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    merge();
  }, (e) => { console.log('unsub2 error:', e); });

  return () => { unsub1(); unsub2(); };
};

// Accept or decline + notify requester
export const updateExchangeStatus = async (
  exchangeId: string,
  status: 'accepted' | 'declined' | 'completed',
) => {
  await updateDoc(doc(db, 'exchanges', exchangeId), { status });

  if (status === 'accepted') {
    try {
      const exchSnap = await getDoc(doc(db, 'exchanges', exchangeId));
      const exchData = exchSnap.data();
      if (exchData) {
        const requesterSnap = await getDoc(doc(db, 'users', exchData.requesterId));
        const requesterData = requesterSnap.data();
        if (requesterData?.pushToken) {
          await notifyExchangeAccepted(requesterData.pushToken, exchData.providerName);
        }
      }
    } catch (e) {}
  }
};
