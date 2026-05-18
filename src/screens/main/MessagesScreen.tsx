import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToMyExchanges } from '../../services/exchanges';

const statusColor: Record<string, string> = {
  pending: Colors.warning,
  accepted: Colors.accent,
  declined: Colors.error,
  completed: Colors.primary,
};
const statusLabel: Record<string, string> = {
  pending: 'En attente',
  accepted: 'Accepté',
  declined: 'Refusé',
  completed: 'Terminé',
};

export const MessagesScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToMyExchanges(user.uid, (data) => {
      setExchanges(data);
      setLoading(false);
    });
    return unsub;
  }, [user?.uid]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{exchanges.length}</Text>
        </View>
      </View>

      {exchanges.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>Aucun message pour l'instant</Text>
          <Text style={styles.emptySubtitle}>
            Propose un échange depuis l'accueil pour commencer à discuter !
          </Text>
          <TouchableOpacity
            style={styles.goHomeBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.goHomeBtnText}>Voir les membres</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={exchanges}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isRequester = item.requesterId === user?.uid;
            const otherName = isRequester ? item.providerName : item.requesterName;
            const otherAvatar = isRequester ? item.providerAvatar : item.requesterAvatar;
            const color = statusColor[item.status] || Colors.textMuted;
            const label = statusLabel[item.status] || item.status;

            // Show notification dot for providers with pending requests
            const hasAlert = !isRequester && item.status === 'pending';

            return (
              <TouchableOpacity
                style={styles.conversation}
                onPress={() => navigation.navigate('Chat', { exchange: item })}
                activeOpacity={0.8}
              >
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatar}>{otherAvatar || '🧑'}</Text>
                  {hasAlert && <View style={styles.alertDot} />}
                </View>

                <View style={styles.convInfo}>
                  <View style={styles.convRow}>
                    <Text style={styles.convName}>{otherName}</Text>
                    <Text style={styles.convTime}>{formatDate(item.createdAt)}</Text>
                  </View>

                  <View style={styles.convRow}>
                    <Text style={styles.convSkills} numberOfLines={1}>
                      {item.skillOffered} ↔ {item.skillWanted}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: color + '22' }]}>
                      <Text style={[styles.statusText, { color }]}>{label}</Text>
                    </View>
                  </View>

                  {item.message ? (
                    <Text style={styles.convMessage} numberOfLines={1}>
                      💬 "{item.message}"
                    </Text>
                  ) : null}
                </View>

                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text },
  countBadge: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  countText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  conversation: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1,
    borderBottomColor: Colors.border, gap: 12,
  },
  avatarContainer: { position: 'relative' },
  avatar: { fontSize: 40 },
  alertDot: {
    position: 'absolute', top: -2, right: -4,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: Colors.warning,
    borderWidth: 2, borderColor: Colors.background,
  },
  convInfo: { flex: 1 },
  convRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  convName: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  convTime: { color: Colors.textMuted, fontSize: 11 },
  convSkills: { color: Colors.textSecondary, fontSize: 12, flex: 1, marginRight: 8 },
  convMessage: { color: Colors.textMuted, fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: {
    color: Colors.textSecondary, fontSize: 14,
    textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },
  goHomeBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingHorizontal: 28, paddingVertical: 14,
  },
  goHomeBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
