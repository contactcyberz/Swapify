import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToMyExchanges } from '../../services/exchanges';

export const NotificationsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToMyExchanges(user.uid, (data) => {
      setExchanges(data);
    });
    return unsub;
  }, [user?.uid]);

  // Build notifications from exchanges
  const notifications = exchanges.flatMap(ex => {
    const isRequester = ex.requesterId === user?.uid;
    const otherName = isRequester ? ex.providerName : ex.requesterName;
    const otherAvatar = isRequester ? ex.providerAvatar : ex.requesterAvatar;
    const items = [];

    if (!isRequester && ex.status === 'pending') {
      items.push({
        id: ex.id + '_pending',
        exchange: ex,
        avatar: otherAvatar,
        title: `${otherName} veut échanger avec toi !`,
        body: `Il/elle propose "${ex.skillOffered}" en échange de "${ex.skillWanted}"`,
        icon: 'swap-horizontal',
        color: Colors.warning,
        time: ex.createdAt,
      });
    }
    if (isRequester && ex.status === 'accepted') {
      items.push({
        id: ex.id + '_accepted',
        exchange: ex,
        avatar: otherAvatar,
        title: `${otherName} a accepté ton échange ! 🎉`,
        body: `Tu peux maintenant discuter et planifier votre échange`,
        icon: 'checkmark-circle',
        color: Colors.accent,
        time: ex.createdAt,
      });
    }
    if (isRequester && ex.status === 'declined') {
      items.push({
        id: ex.id + '_declined',
        exchange: ex,
        avatar: otherAvatar,
        title: `${otherName} n'est pas disponible`,
        body: `Ta demande d'échange a été refusée. Essaie un autre membre !`,
        icon: 'close-circle',
        color: Colors.error,
        time: ex.createdAt,
      });
    }
    return items;
  });

  const formatTime = (ts: any) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = Date.now() - d.getTime();
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={styles.emptyTitle}>Pas encore de notifications</Text>
          <Text style={styles.emptySub}>Tu seras alerté quand quelqu'un propose un échange ou te répond !</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.notifCard}
              onPress={() => navigation.navigate('Chat', { exchange: item.exchange })}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBg, { backgroundColor: item.color + '22' }]}>
                <Text style={styles.avatar}>{item.avatar}</Text>
                <View style={[styles.iconBadge, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={10} color={Colors.white} />
                </View>
              </View>
              <View style={styles.notifInfo}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.notifTime}>{formatTime(item.time)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  list: { padding: 20, gap: 12 },
  notifCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 12, alignItems: 'flex-start' },
  iconBg: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatar: { fontSize: 28 },
  iconBadge: { position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.surface },
  notifInfo: { flex: 1 },
  notifTitle: { color: Colors.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  notifBody: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 6 },
  notifTime: { color: Colors.textMuted, fontSize: 11 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  emptySub: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
