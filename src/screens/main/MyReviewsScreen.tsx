import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';

export const MyReviewsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, 'reviews'), where('toUserId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by createdAt descending in JS (avoids composite index requirement)
      data.sort((a: any, b: any) => {
        const aT = a.createdAt?.toDate?.()?.getTime() ?? 0;
        const bT = b.createdAt?.toDate?.()?.getTime() ?? 0;
        return bT - aT;
      });
      setReviews(data);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user?.uid]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '—';

  const formatDate = (ts: any) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const renderStars = (rating: number) =>
    [1, 2, 3, 4, 5].map(i => (
      <Ionicons
        key={i}
        name={i <= rating ? 'star' : 'star-outline'}
        size={14}
        color={i <= rating ? Colors.warning : Colors.textMuted}
      />
    ));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Mes avis</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary card */}
      <View style={styles.summaryCard}>
        <Text style={styles.avgRating}>{avgRating}</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(i => (
            <Ionicons
              key={i}
              name={i <= Math.round(parseFloat(avgRating) || 0) ? 'star' : 'star-outline'}
              size={20}
              color={Colors.warning}
            />
          ))}
        </View>
        <Text style={styles.reviewCount}>
          {reviews.length === 0 ? "Aucun avis pour l'instant" : `${reviews.length} avis reçu${reviews.length > 1 ? 's' : ''}`}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={Colors.primary} /></View>
      ) : reviews.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>⭐</Text>
          <Text style={styles.emptyTitle}>Pas encore d'avis</Text>
          <Text style={styles.emptySub}>
            Termine des échanges pour recevoir des évaluations de la communauté !
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.emptyBtnText}>Explorer les membres</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardAvatar}>{item.fromAvatar || '🧑'}</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.fromName || 'Membre Swapify'}</Text>
                  <View style={styles.starsRowSmall}>{renderStars(item.rating)}</View>
                </View>
                <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
              </View>
              {item.comment ? (
                <Text style={styles.cardComment}>« {item.comment} »</Text>
              ) : null}
              {item.skillExchanged ? (
                <View style={styles.skillBadge}>
                  <Ionicons name="swap-horizontal" size={11} color={Colors.primary} />
                  <Text style={styles.skillBadgeText}>{item.skillExchanged}</Text>
                </View>
              ) : null}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  summaryCard: {
    backgroundColor: Colors.surface, marginHorizontal: 20, borderRadius: 20,
    padding: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginBottom: 16,
  },
  avgRating: { color: Colors.text, fontSize: 52, fontWeight: '800', lineHeight: 60 },
  starsRow: { flexDirection: 'row', gap: 4, marginVertical: 8 },
  starsRowSmall: { flexDirection: 'row', gap: 2, marginTop: 2 },
  reviewCount: { color: Colors.textMuted, fontSize: 13 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardAvatar: { fontSize: 34, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  cardDate: { color: Colors.textMuted, fontSize: 11 },
  cardComment: {
    color: Colors.textSecondary, fontSize: 14, lineHeight: 20,
    fontStyle: 'italic', marginBottom: 10,
  },
  skillBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primaryTransparent, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
  },
  skillBadgeText: { color: Colors.primary, fontSize: 11, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  emptySub: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 8,
  },
  emptyBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
});
