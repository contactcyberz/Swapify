import { useState, useEffect } from 'react';
import { onAuthChange, getUserProfile } from '../services/auth';
import { registerForPushNotifications } from '../services/notifications';
import { trackEvent } from '../services/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser: any) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await getUserProfile(firebaseUser.uid);
        setProfile(p);
        registerForPushNotifications(firebaseUser.uid);
        trackEvent('login', { method: 'email' });
      } else {
        setProfile(null);
        trackEvent('logout');
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, profile, loading };
};
