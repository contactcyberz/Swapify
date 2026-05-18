import * as Notifications from 'expo-notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register device and save push token to Firestore
export const registerForPushNotifications = async (userId: string) => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission denied');
      return null;
    }

    // Get push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'f82f9260-6a42-4dcb-b1f2-f356a10c8ac9', // Expo project ID
    });
    const token = tokenData.data;

    // Save token to Firestore
    await updateDoc(doc(db, 'users', userId), { pushToken: token });

    // Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Swapify',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
      });
    }

    return token;
  } catch (e) {
    console.log('Push notification setup error:', e);
    return null;
  }
};

// Send a push notification via Expo Push API
export const sendPushNotification = async (
  toToken: string,
  title: string,
  body: string,
  data?: any,
) => {
  if (!toToken) return;
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: toToken,
        sound: 'default',
        title,
        body,
        data: data || {},
        priority: 'high',
      }),
    });
  } catch (e) {
    console.log('sendPushNotification error:', e);
  }
};

// Helpers for specific events
export const notifyNewExchange = (token: string, requesterName: string) =>
  sendPushNotification(
    token,
    '🔄 Nouvelle proposition d\'échange !',
    `${requesterName} veut échanger des compétences avec toi`,
    { screen: 'Messages' },
  );

export const notifyNewMessage = (token: string, senderName: string, text: string) =>
  sendPushNotification(
    token,
    `💬 ${senderName}`,
    text.length > 60 ? text.substring(0, 60) + '...' : text,
    { screen: 'Messages' },
  );

export const notifyExchangeAccepted = (token: string, providerName: string) =>
  sendPushNotification(
    token,
    '✅ Échange accepté !',
    `${providerName} a accepté ton échange ! Commence à discuter.`,
    { screen: 'Messages' },
  );
