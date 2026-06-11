import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, ActivityIndicator, RefreshControl, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { SKILL_CATEGORIES, SkillCategory } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { getNearbyUsers, seedDemoUsers } from '../../services/users';
import { toggleFavorite, getFavorites } from '../../services/favorites';
import { updatePresence, isUserOnline } from '../../services/presence';
import { Share } from 'react-native';

// ── Avatar avec initiales (style pro) ─────────────────────────
const AVATAR_GRADIENTS = [
  ['#0EA5E9', '#6366F1'],
  ['#8B5CF6', '#EC4899'],
  ['#10B981', '#0EA5E9'],
  ['#F59E0B', '#EF4444'],
  ['#6366F1', '#8B5CF6'],
  ['#EC4899', '#F59E0B'],
];

const getInitials = (name: string) => {
  const parts = name?.trim().split(' ') || [];
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] || '?').toUpperCase();
};

const getGradient = (name: string) => {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx] as [string, string];
};

const Avatar = ({ name, size = 56, online = false }: { name: string; size?: number; online?: boolean }) => (
  <View style={{ width: size, height: size }}>
    <LinearGradient
      colors={getGradient(name)}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{
        width: size, height: size, borderRadius: size / 2,
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: size * 0.35, fontWeight: '700', letterSpacing: 0.5 }}>
        {getInitials(name)}
      </Text>
    </LinearGradient>
    {online && (
      <View style={{
        position: 'absolute', bottom: 1, right: 1,
        width: size * 0.25, height: size * 0.25,
        borderRadius: size * 0.125,
        backgroundColor: '#10B981',
        borderWidth: 2, borderColor: Colors.surface,
      }} />
    )}
  </View>
);

// ── Carte membre premium ───────────────────────────────────────
const MemberCard = ({ item, isFav, onFav, onShare, onPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const online = isUserOnline(item.lastSeen);

  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 200 }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 200 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {/* Top accent bar */}
        <LinearGradient
          colors={getGradient(item.name)}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.cardAccentBar}
        />

        {/* Card content */}
        <View style={styles.cardContent}>
          {/* Header row */}
          <View style={styles.cardHeader}>
            <Avatar name={item.name} size={54} online={online} />

            <View style={styles.cardMeta}>
              <View style={styles.nameRow}>
                <Text style={styles.memberName}>{item.name}</Text>
                {item.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#0EA5E9" />
                    <Text style={styles.verifiedText}>Vérifié</Text>
                  </View>
                )}
              </View>

              <View style={styles.metaRow}>
                {item.rating > 0 ? (
                  <View style={styles.ratingPill}>
                    <Ionicons name="star" size={11} color="#F59E0B" />
                    <Text style={styles.ratingText}>{item.rating} ({item.reviewCount})</Text>
                  </View>
                ) : (
                  <View style={styles.newPill}>
                    <Text style={styles.newText}>✨ Nouveau</Text>
                  </View>
                )}
                {item.distance && (
                  <View style={styles.distancePill}>
                    <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                    <Text style={styles.distanceText}>{item.distance}</Text>
                  </View>
                )}
                {online && (
                  <View style={styles.onlinePill}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>En ligne</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => onShare(item)}>
                <Ionicons name="share-outline" size={17} color={Colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, isFav && styles.actionBtnFav]} onPress={() => onFav(item.id)}>
                <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={18} color={isFav ? '#EF4444' : Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Exchange section */}
          <View style={styles.exchangeSection}>
            <View style={styles.exchangeCol}>
              <Text style={styles.exchangeLabel}>J'OFFRE</Text>
              <Text style={styles.exchangeSkill} numberOfLines={1}>
                {item.skillsOffered?.[0] || 'À définir'}
              </Text>
            </View>

            <LinearGradient
              colors={['#0EA5E9', '#6366F1']}
              style={styles.swapIcon}
            >
              <Ionicons name="swap-horizontal" size={16} color="#fff" />
            </LinearGradient>

            <View style={[styles.exchangeCol, { alignItems: 'flex-end' }]}>
              <Text style={styles.exchangeLabel}>JE CHERCHE</Text>
              <Text style={styles.exchangeSkill} numberOfLines={1}>
                {item.skillsWanted?.[0] || 'Ouvert'}
              </Text>
            </View>
          </View>

          {/* Extra skills chips */}
          {item.skillsOffered?.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              {item.skillsOffered.slice(1, 4).map((s: string, i: number) => (
                <View key={i} style={styles.skillChip}>
                  <Text style={styles.skillChipText}>{s}</Text>
                </View>
              ))}
              {item.skillsOffered.length > 4 && (
                <View style={styles.moreChip}>
                  <Text style={styles.moreChipText}>+{item.skillsOffered.length - 4}</Text>
                </View>
              )}
            </ScrollView>
          )}

          {/* CTA Button */}
          <TouchableOpacity style={styles.ctaBtn} onPress={onPress}>
            <LinearGradient
              colors={['#0EA5E9', '#6366F1']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.ctaBtnGradient}
            >
              <Ionicons name="swap-horizontal-outline" size={16} color="#fff" />
              <Text style={styles.ctaBtnText}>Proposer un échange</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Main Screen ────────────────────────────────────────────────
export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'all'>('all');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const firstName = user?.displayName?.split(' ')[0] || 'toi';

  const loadUsers = async () => {
    if (!user?.uid) return;
    try {
      await seedDemoUsers();
      const [result, favs] = await Promise.all([
        getNearbyUsers(user.uid),
        getFavorites(user.uid),
      ]);
      setUsers(result);
      setFavorites(favs);
      updatePresence(user.uid);
    } catch (e) {
      console.log('loadUsers error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFavorite = async (memberId: string) => {
    if (!user?.uid) return;
    const newState = await toggleFavorite(user.uid, memberId);
    setFavorites(prev => newState ? [...prev, memberId] : prev.filter(id => id !== memberId));
  };

  const handleShare = async (item: any) => {
    await Share.share({
      message: `Découvre ${item.name} sur Swapify ! Il/elle offre "${item.skillsOffered?.[0]}" en échange. Télécharge l'app : https://swapify.app`,
    });
  };

  useEffect(() => { loadUsers(); }, [user?.uid]);
  const onRefresh = () => { setRefreshing(true); loadUsers(); };

  const categoryKeywords: Record<string, string[]> = {
    tech: ['python', 'react', 'code', 'web', 'javascript', 'machine', 'excel', 'photoshop'],
    language: ['anglais', 'espagnol', 'français', 'arabe', 'mandarin', 'langue'],
    music: ['guitare', 'piano', 'chant', 'batterie', 'ukulélé', 'musique'],
    cooking: ['cuisine', 'pâtisserie', 'boulangerie', 'cuisinier', 'chef'],
    sports: ['yoga', 'musculation', 'running', 'tennis', 'sport', 'fitness'],
    business: ['comptabilité', 'marketing', 'gestion', 'finance'],
    art: ['dessin', 'peinture', 'photographie', 'montage', 'design'],
    health: ['méditation', 'nutrition', 'santé', 'bien-être'],
    education: ['mathématiques', 'physique', 'tutorat'],
    home: ['jardinage', 'bricolage', 'électricité', 'plomberie'],
  };

  const matchesCategory = (userItem: any, cat: SkillCategory) => {
    const keywords = categoryKeywords[cat] || [];
    const skills = (userItem.skillsOffered || []).join(' ').toLowerCase();
    return keywords.some(kw => skills.includes(kw));
  };

  const filtered = activeCategory === 'all' ? users : users.filter(u => matchesCategory(u, activeCategory));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {firstName} 👋</Text>
          <Text style={styles.headerTitle}>Découvrir des talents</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Explore')}
          >
            <Ionicons name="search-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Stats banner ── */}
      <LinearGradient
        colors={['#091A30', '#0F2744']}
        style={styles.statsBanner}
      >
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={18} color="#0EA5E9" />
          <Text style={styles.statValue}>0h</Text>
          <Text style={styles.statLabel}>Solde</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={18} color="#6366F1" />
          <Text style={styles.statValue}>{users.length}</Text>
          <Text style={styles.statLabel}>Membres</Text>
        </View>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Map')}>
          <Ionicons name="map-outline" size={18} color="#10B981" />
          <Text style={[styles.statValue, { color: '#10B981' }]}>Carte</Text>
          <Text style={styles.statLabel}>Voir la map</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* ── Categories ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        <TouchableOpacity
          style={[styles.catChip, activeCategory === 'all' && styles.catChipActive]}
          onPress={() => setActiveCategory('all')}
        >
          {activeCategory === 'all' ? (
            <LinearGradient colors={['#0EA5E9', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.catChipGrad}>
              <Text style={styles.catTextActive}>Tout</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.catText}>Tout</Text>
          )}
        </TouchableOpacity>

        {SKILL_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, activeCategory === cat.id && styles.catChipActive]}
            onPress={() => setActiveCategory(cat.id)}
          >
            {activeCategory === cat.id ? (
              <LinearGradient colors={['#0EA5E9', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.catChipGrad}>
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={styles.catTextActive}>{cat.label}</Text>
              </LinearGradient>
            ) : (
              <>
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={styles.catText}>{cat.label}</Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Members list ── */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Chargement des membres...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIcon}>
            <Ionicons name="search-outline" size={32} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Aucun membre trouvé</Text>
          <Text style={styles.emptySubtitle}>Essaie une autre catégorie</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          renderItem={({ item }) => (
            <MemberCard
              item={item}
              isFav={favorites.includes(item.id)}
              onFav={handleFavorite}
              onShare={handleShare}
              onPress={() => navigation.navigate('ExchangeDetail', { provider: item })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  greeting: { color: Colors.textMuted, fontSize: 13, fontWeight: '500', marginBottom: 2 },
  headerTitle: { color: Colors.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },

  // Stats banner
  statsBanner: {
    flexDirection: 'row', marginHorizontal: 20, borderRadius: 18,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  statLabel: { color: Colors.textMuted, fontSize: 11 },
  statDivider: { width: 1, backgroundColor: Colors.border },

  // Categories
  categories: { paddingHorizontal: 20, paddingBottom: 14, gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 24, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border, gap: 5, overflow: 'hidden',
  },
  catChipActive: { borderColor: 'transparent', padding: 0 },
  catChipGrad: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8, gap: 5,
  },
  catEmoji: { fontSize: 14 },
  catText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  catTextActive: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // List
  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: Colors.textMuted, fontSize: 14 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  emptySubtitle: { color: Colors.textMuted, fontSize: 14 },

  // Card
  card: {
    backgroundColor: Colors.surface, borderRadius: 24,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
  },
  cardAccentBar: { height: 4, width: '100%' },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardMeta: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' },
  memberName: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(14,165,233,0.12)', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  verifiedText: { color: '#0EA5E9', fontSize: 10, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(245,158,11,0.12)', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  ratingText: { color: '#F59E0B', fontSize: 11, fontWeight: '600' },
  newPill: {
    backgroundColor: 'rgba(99,102,241,0.12)', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  newText: { color: '#6366F1', fontSize: 11, fontWeight: '600' },
  distancePill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.background, borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  distanceText: { color: Colors.textMuted, fontSize: 11 },
  onlinePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(16,185,129,0.12)', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  onlineText: { color: '#10B981', fontSize: 11, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 6, marginLeft: 4 },
  actionBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  actionBtnFav: { backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' },

  // Exchange section
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },
  exchangeSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  exchangeCol: { flex: 1 },
  exchangeLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
  exchangeSkill: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  swapIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 12,
  },

  // Chips
  chipsRow: { marginBottom: 14 },
  skillChip: {
    backgroundColor: 'rgba(14,165,233,0.08)',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
    marginRight: 6, borderWidth: 1, borderColor: 'rgba(14,165,233,0.2)',
  },
  skillChipText: { color: '#0EA5E9', fontSize: 12, fontWeight: '500' },
  moreChip: {
    backgroundColor: Colors.background, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.border,
  },
  moreChipText: { color: Colors.textMuted, fontSize: 12, fontWeight: '500' },

  // CTA
  ctaBtn: { borderRadius: 14, overflow: 'hidden' },
  ctaBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
  },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
