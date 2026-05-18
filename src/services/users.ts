import {
  collection, getDocs, doc, setDoc, getDoc, query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// Demo users to seed Firestore so the feed is not empty
const DEMO_USERS = [
  {
    id: 'demo_sara',
    name: 'Sara L.',
    email: 'sara@demo.com',
    avatar: '👩',
    city: 'Montréal',
    country: 'Canada',
    bio: 'Développeuse Python passionnée, adore enseigner !',
    skillsOffered: ['Cours de Python', 'React', 'Machine Learning'],
    skillsWanted: ['Espagnol', 'Guitare'],
    timeBalance: 12,
    rating: 4.9,
    reviewCount: 24,
    isVerified: true,
    location: { latitude: 45.508, longitude: -73.554 },
    distance: '0.3 km',
  },
  {
    id: 'demo_marc',
    name: 'Marc D.',
    email: 'marc@demo.com',
    avatar: '👨',
    city: 'Montréal',
    country: 'Canada',
    bio: 'Guitariste depuis 10 ans, cours tous niveaux.',
    skillsOffered: ['Guitare acoustique', 'Piano débutant', 'Ukulélé'],
    skillsWanted: ['Photoshop', 'Yoga'],
    timeBalance: 8,
    rating: 4.7,
    reviewCount: 11,
    isVerified: false,
    location: { latitude: 45.512, longitude: -73.561 },
    distance: '0.7 km',
  },
  {
    id: 'demo_amina',
    name: 'Amina K.',
    email: 'amina@demo.com',
    avatar: '🧕',
    city: 'Montréal',
    country: 'Canada',
    bio: 'Chef cuisinière, spécialité cuisine du Maghreb.',
    skillsOffered: ['Cuisine marocaine', 'Pâtisserie orientale', 'Yoga'],
    skillsWanted: ['Cours de yoga', 'Montage vidéo'],
    timeBalance: 20,
    rating: 5.0,
    reviewCount: 38,
    isVerified: true,
    location: { latitude: 45.498, longitude: -73.572 },
    distance: '1.2 km',
  },
  {
    id: 'demo_jean',
    name: 'Jean P.',
    email: 'jean@demo.com',
    avatar: '🧔',
    city: 'Montréal',
    country: 'Canada',
    bio: 'Comptable CPA, 15 ans d\'expérience.',
    skillsOffered: ['Comptabilité', 'Déclaration de revenus', 'Excel avancé'],
    skillsWanted: ['Jardinage', 'Espagnol'],
    timeBalance: 5,
    rating: 4.8,
    reviewCount: 17,
    isVerified: true,
    location: { latitude: 45.521, longitude: -73.568 },
    distance: '1.5 km',
  },
  {
    id: 'demo_lily',
    name: 'Lily T.',
    email: 'lily@demo.com',
    avatar: '👧',
    city: 'Montréal',
    country: 'Canada',
    bio: 'Professeure d\'anglais certifiée TESL.',
    skillsOffered: ['Cours d\'anglais', 'Conversation anglais', 'Rédaction'],
    skillsWanted: ['Piano', 'Dessin'],
    timeBalance: 15,
    rating: 4.6,
    reviewCount: 29,
    isVerified: true,
    location: { latitude: 45.502, longitude: -73.580 },
    distance: '2.1 km',
  },
];

// Seed demo users once if they don't exist
export const seedDemoUsers = async () => {
  try {
    const firstDemo = await getDoc(doc(db, 'users', 'demo_sara'));
    if (firstDemo.exists()) return; // already seeded

    for (const user of DEMO_USERS) {
      await setDoc(doc(db, 'users', user.id), {
        ...user,
        createdAt: serverTimestamp(),
      });
    }
    console.log('Demo users seeded!');
  } catch (e) {
    console.log('Seed error (non-blocking):', e);
  }
};

// Fetch all users except the current user
export const getNearbyUsers = async (currentUserId: string) => {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const users: any[] = [];
    snap.forEach(d => {
      const data = d.data();
      if (d.id !== currentUserId && (data.skillsOffered?.length > 0 || data.skillsWanted?.length > 0)) {
        users.push({ id: d.id, ...data });
      }
    });
    return users;
  } catch (e) {
    console.log('getNearbyUsers error:', e);
    return [];
  }
};
