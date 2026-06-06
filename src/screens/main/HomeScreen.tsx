import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, ActivityIndicator, RefreshControl, TextInput, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { SKILL_CATEGORIES, SkillCategory } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { getNearbyUsers, seedDemoUsers } from '../../services/users';
import { toggleFavorite, getFavorites } from '../../services/favorites';
import { updatePresence, isUserOnline } from '../../services/presence';
import { getUserProfile } from '../../services/auth';
import { Share } from 'react-native';

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'all'>('all');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [timeBalance, setTimeBalance] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const firstName = user?.displayName?.split(' ')[0] || 'toi';

  const loadUsers = async () => {
    if (!user?.uid) return;
    try {
      await seedDemoUsers();
      const [result, favs, profile] = await Promise.all([
        getNearbyUsers(user.uid),
        getFavorites(user.uid),
        getUserProfile(user.uid),
      ]);
      setUsers(result);
      setFavorites(favs);
      if (profile?.timeBalance) setTimeBalance(profile.timeBalance);
      updatePresence(user.uid);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
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
    setFavorites(prev =>
      newState ? [...prev, memberId] : prev.filter(id => id !== memberId)
    );
  };

  const handleShare = async (item: any) => {
    await Share.share({
      message: `Decouvre ${item.name} sur Swapify ! Il/elle offre "${item.skillsOffered?.[0]}" en echange de competences. Telecharge l'app : https://swapify.app`,
      title: 'Partager ce profil',
    });
  };

  useEffect(() => { loadUsers(); }, [user?.uid]);

  const onRefresh = () => { setRefreshing(true); loadUsers(); };

  const categoryKeywords: Record<string, string[]> = {
    tech: ['python', 'react', 'code', 'web', 'javascript', 'machine', 'excel', 'photoshop', 'html', 'css', 'programmation'],
    language: ['anglais', 'espagnol', 'francais', 'arabe', 'mandarin', 'portugais', 'langue', 'conversation'],
    music: ['guitare', 'piano', 'chant', 'batterie', 'ukulele', 'musique', 'violon'],
    cooking: ['cuisine', 'patisserie', 'boulangerie', 'cuisinier', 'chef', 'recette'],
    sports: ['yoga', 'musculation', 'running', 'natation', 'tennis', 'boxe', 'sport', 'fitness'],
    business: ['comptabilite', 'marketing', 'gestion', 'entrepreneur', 'finance', 'revenus'],
    art: ['dessin', 'peinture', 'photographie', 'montage', 'design', 'aquarelle', 'sculpture'],
    health: ['meditation', 'nutrition', 'sante', 'bien-etre', 'massotherapie'],
    education: ['mathematiques', 'physique', 'histoire', 'philosophie', 'tutorat'],
    home: ['jardinage', 'bricolage', 'electricite', 'plomberie', 'menuiserie'],
  };

  const matchesCategory = (userItem: any, cat: SkillCategory) => {
    const keywords = categoryKeywords[cat] || [];
    const skills = (userItem.skillsOffered || []).join(' ').toLowerCase();
    return keywords.some(kw => skills.includes(kw));
  };

  const filtered = users
    .filter(u => activeCategory === 'all' || matchesCategory(u, activeCategory))
    .filter(u => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        (u.skillsOffered || []).some((s: string) => s.toLowerCase().includes(q)) ||
        (u.skillsWanted || []).some((s: string) => s.toLowerCase().includes(q))
      );
    });

  const newMembers = [...users]
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .slice(0, 5);

  const renderUserCard = ({ item }: { item: any }) => {
    const offered = item.skillsOffered?.[0] || 'Competence a definir';
    const wanted = item.skillsWanted?.[0] || 'Ouvert aux echanges';
    const isFav = favorites.includes(item.id);
    const online = isUserOnline(item.lastSeen);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.92}
        onPress={() => navigation.navigate('ExchangeDetail', { provider: item })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarWrapper}>
            <Text style={styles.avatar}>{item.avatar || '🧑'}</Text>
            {online && <View style={styles.onlineDot} />}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={Colors.warning} />
              <Text style={styles.rating}>
                {item.rating > 0 ? `${item.rating} (${item.reviewCount})` : 'Nouveau'}
              </Text>
              {item.distance && <Text style={styles.distance}> • {item.distance}</Text>}
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => handleShare(item)} style={styles.actionBtn}>
              <Ionicons name="share-outline" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFavorite(item.id)} style={styles.actionBtn}>
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={20}
                color={isFav ? Colors.error : Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {item.skillsOffered?.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            {item.skillsOffered.slice(0, 4).map((s: string, i: number) => (
              <View key={i} style={styles.offerTag}>
                <Text style={styles.offerTagText}>{s}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.exchangeRow}>
          <View style={styles.skillBox}>
            <Text style={styles.skillLabel}>Offre</Text>
            <Text style={styles.skillName}>{offered}</Text>
          </View>
          <View style={styles.arrowBox}>
            <Ionicons name="swap-horizontal" size={20} color={Colors.primary} />
          </View>
          <View style={styles.skillBox}>
            <Text style={styles.skillLabel}>Cherche</Text>
            <Text style={styles.skillName}>{wanted}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.requestBtn}
          onPress={() => navigation.navigate('ExchangeDetail', { provider: item })}
        >
          <Ionicons name="swap-horizontal" size={16} color={Colors.white} />
          <Text style={styles.requestBtnText}>Proposer un echange</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour {firstName} 👋</Text>
          <Text style={styles.headerTitle}>Autour de toi</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <Animated.View style={[styles.statsBar, { opacity: fadeAnim }]}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{timeBalance}h</Text>
          <Text style={styles.statLabel}>Ton solde</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{users.length}</Text>
          <Text style={styles.statLabel}>Membres</Text>
        </View>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Explore')}>
          <Text style={[styles.statValue, { color: Colors.primary }]}>Explorer</Text>
          <Text style={styles.statLabel}>Toutes les skills</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Barre de recherche */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un membre ou une skill..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        <TouchableOpacity
          style={[styles.catChip, activeCategory === 'all' && styles.catChipActive]}
          onPress={() => setActiveCategory('all')}
        >
          <Text style={[styles.catText, activeCategory === 'all' && styles.catTextActive]}>Tout</Text>
        </TouchableOpacity>
        {SKILL_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, activeCategory === cat.id && styles.catChipActive]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
            <Text style={[styles.catText, activeCategory === cat.id && styles.catTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Users list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Chargement des membres...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>Aucun resultat</Text>
          <Text style={styles.emptySubtitle}>Essaie une autre recherche ou categorie !</Text>
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
          ListHeaderComponent={
            !search && activeCategory === 'all' && newMembers.length > 0 ? (
              <View style={styles.newSection}>
                <Text style={styles.sectionTitle}>🆕 Nouveaux membres</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.newScroll}>
                  {newMembers.map(m => (
                    <TouchableOpacity
                      key={m.id}
                      style={styles.newCard}
                      onPress={() => navigation.navigate('ExchangeDetail', { provider: m })}
                    >
                      <Text style={styles.newAvatar}>{m.avatar || '🧑'}</Text>
                      <Text style={styles.newName} numberOfLines={1}>{m.name}</Text>
                      <Text style={styles.newSkill} numberOfLines={1}>{m.skillsOffered?.[0] || '—'}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null
          }
          renderItem={renderUserCard}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  greeting: { color: Colors.textSecondary, fontSize: 14 },
  headerTitle: { color: Colors.text, fontSize: 26, fontWeight: '800' },
  notifBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  statsBar: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    marginHorizontal: 20, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: Colors.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  statLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 14,
    marginHorizontal: 20, marginBottom: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: Colors.text, fontSize: 14 },
  categories: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border, gap: 4,
  },
  catChipActive: { backgroundColor: Colors.primaryTransparent, borderColor: Colors.primary },
  catEmoji: { fontSize: 14 },
  catText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  catTextActive: { color: Colors.primary },
  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: Colors.textMuted, fontSize: 14 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  emptySubtitle: { color: Colors.textMuted, fontSize: 14 },
  newSection: { marginBottom: 16 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  newScroll: { marginHorizontal: -4 },
  newCard: {
    width: 90, backgroundColor: Colors.surface, borderRadius: 16,
    padding: 12, alignItems: 'center', marginHorizontal: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  newAvatar: { fontSize: 28, marginBottom: 6 },
  newName: { color: Colors.text, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  newSkill: { color: Colors.textMuted, fontSize: 10, textAlign: 'center', marginTop: 2 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 20,
    padding: 16, borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarWrapper: { position: 'relative', marginRight: 12 },
  avatar: { fontSize: 36 },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.accent, borderWidth: 2, borderColor: Colors.surface,
  },
  cardActions: { flexDirection: 'row', gap: 4 },
  actionBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },
  userInfo: { flex: 1 },
  userName: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  rating: { color: Colors.textSecondary, fontSize: 12, marginLeft: 3 },
  distance: { color: Colors.textMuted, fontSize: 12 },
  tagsScroll: { marginBottom: 10 },
  offerTag: {
    backgroundColor: Colors.primaryTransparent, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4, marginRight: 6,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  offerTagText: { color: Colors.primary, fontSize: 11, fontWeight: '500' },
  exchangeRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background, borderRadius: 12,
    padding: 12, marginBottom: 12,
  },
  skillBox: { flex: 1 },
  skillLabel: { color: Colors.textMuted, fontSize: 11, marginBottom: 2 },
  skillName: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  arrowBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryTransparent,
    alignItems: 'center', justifyContent: 'center', marginHorizontal: 8,
  },
  requestBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  requestBtnText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
});
