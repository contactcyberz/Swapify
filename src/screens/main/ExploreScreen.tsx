import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { SKILL_CATEGORIES } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { getNearbyUsers } from '../../services/users';
import { isUserOnline } from '../../services/presence';

type SortOption = 'default' | 'rating' | 'newest';

export const ExploreScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    getNearbyUsers(user.uid).then(result => {
      setAllUsers(result);
      setLoading(false);
    });
  }, [user?.uid]);

  const categoryKeywords: Record<string, string[]> = {
    tech: ['python', 'react', 'code', 'web', 'javascript', 'machine', 'excel', 'photoshop', 'programmation'],
    language: ['anglais', 'espagnol', 'francais', 'arabe', 'mandarin', 'langue', 'conversation'],
    music: ['guitare', 'piano', 'chant', 'batterie', 'ukulele', 'musique'],
    cooking: ['cuisine', 'patisserie', 'boulangerie', 'chef', 'recette'],
    sports: ['yoga', 'musculation', 'running', 'natation', 'tennis', 'sport', 'fitness'],
    business: ['comptabilite', 'marketing', 'gestion', 'finance', 'revenus'],
    art: ['dessin', 'peinture', 'photographie', 'montage', 'design', 'aquarelle'],
    health: ['meditation', 'nutrition', 'sante', 'bien-etre'],
    education: ['mathematiques', 'physique', 'histoire', 'tutorat'],
    home: ['jardinage', 'bricolage', 'electricite', 'plomberie'],
  };

  const activeFiltersCount = (onlineOnly ? 1 : 0) + (verifiedOnly ? 1 : 0) + (sortBy !== 'default' ? 1 : 0);

  let filtered = allUsers.filter(u => {
    const allSkills = [
      ...(u.skillsOffered || []),
      ...(u.skillsWanted || []),
      u.name || '',
    ].join(' ').toLowerCase();

    const matchesSearch = search.length === 0 || allSkills.includes(search.toLowerCase());
    const matchesCategory = !activeCategory ||
      (categoryKeywords[activeCategory] || []).some(kw => allSkills.includes(kw));
    const matchesOnline = !onlineOnly || isUserOnline(u.lastSeen);
    const matchesVerified = !verifiedOnly || u.isVerified === true;

    return matchesSearch && matchesCategory && matchesOnline && matchesVerified;
  });

  if (sortBy === 'rating') {
    filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === 'newest') {
    filtered = [...filtered].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }

  const showResults = search.length > 0 || activeCategory !== null || onlineOnly || verifiedOnly || sortBy !== 'default';

  const resetFilters = () => {
    setSearch('');
    setActiveCategory(null);
    setSortBy('default');
    setOnlineOnly(false);
    setVerifiedOnly(false);
  };

  const MemberCard = ({ item }: { item: any }) => {
    const online = isUserOnline(item.lastSeen);
    return (
      <TouchableOpacity
        style={styles.memberCard}
        onPress={() => navigation.navigate('ExchangeDetail', { provider: item })}
        activeOpacity={0.8}
      >
        <View style={{ position: 'relative' }}>
          <Text style={styles.memberAvatar}>{item.avatar || '🧑'}</Text>
          {online && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName}>{item.name}</Text>
            {item.isVerified && (
              <Ionicons name="checkmark-circle" size={14} color={Colors.accent} />
            )}
          </View>
          {item.skillsOffered?.length > 0 && (
            <Text style={styles.memberSkills} numberOfLines={1}>
              🎓 {item.skillsOffered.slice(0, 2).join(', ')}
            </Text>
          )}
          <Text style={styles.memberRating}>
            {item.rating > 0 ? `⭐ ${item.rating} · ` : ''}{online ? '🟢 En ligne' : 'Montréal'}
          </Text>
        </View>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <View style={styles.proposeBtn}>
            <Text style={styles.proposeBtnText}>Echanger</Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert('Signaler / Bloquer', `Que veux-tu faire avec ${item.name} ?`, [
            { text: 'Annuler', style: 'cancel' },
            { text: '🚩 Signaler', onPress: () => Alert.alert('Signale', 'Merci, nous allons examiner ce profil sous 24h.') },
            { text: '🚫 Bloquer', style: 'destructive', onPress: () => Alert.alert('Bloque', `${item.name} a ete bloque.`) },
          ])}>
            <Text style={{ color: Colors.textMuted, fontSize: 11 }}>Signaler</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorer</Text>
        <Text style={styles.subtitle}>{allUsers.length} membres actifs</Text>
      </View>

      {/* Search + Filter row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Competence, prenom..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={text => { setSearch(text); setActiveCategory(null); }}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={20} color={showFilters ? Colors.primary : Colors.textMuted} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          {/* Sort */}
          <Text style={styles.filterLabel}>Trier par</Text>
          <View style={styles.filterChips}>
            {([
              { id: 'default', label: 'Par défaut' },
              { id: 'rating', label: '⭐ Mieux notés' },
              { id: 'newest', label: '🆕 Plus récents' },
            ] as { id: SortOption; label: string }[]).map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.filterChip, sortBy === opt.id && styles.filterChipActive]}
                onPress={() => setSortBy(opt.id)}
              >
                <Text style={[styles.filterChipText, sortBy === opt.id && styles.filterChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Toggles */}
          <View style={styles.filterToggles}>
            <TouchableOpacity
              style={[styles.toggleChip, onlineOnly && styles.toggleChipActive]}
              onPress={() => setOnlineOnly(!onlineOnly)}
            >
              <View style={[styles.toggleDot, { backgroundColor: onlineOnly ? Colors.accent : Colors.textMuted }]} />
              <Text style={[styles.toggleText, onlineOnly && { color: Colors.accent }]}>En ligne seulement</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleChip, verifiedOnly && styles.toggleChipActive]}
              onPress={() => setVerifiedOnly(!verifiedOnly)}
            >
              <Ionicons name="checkmark-circle" size={14} color={verifiedOnly ? Colors.accent : Colors.textMuted} />
              <Text style={[styles.toggleText, verifiedOnly && { color: Colors.accent }]}>Membres verifies</Text>
            </TouchableOpacity>
          </View>

          {activeFiltersCount > 0 && (
            <TouchableOpacity onPress={resetFilters} style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>Reinitialiser les filtres</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Chargement des membres...</Text>
        </View>
      ) : (
        <FlatList
          data={[]}
          renderItem={() => null}
          keyExtractor={() => 'header'}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {showResults ? (
                <>
                  <Text style={styles.sectionTitle}>
                    {filtered.length} resultat{filtered.length !== 1 ? 's' : ''}
                    {search ? ` pour "${search}"` : ''}
                  </Text>
                  {filtered.length === 0 ? (
                    <View style={styles.noResult}>
                      <Text style={styles.noResultEmoji}>🔍</Text>
                      <Text style={styles.noResultText}>Aucun resultat</Text>
                      <Text style={styles.noResultSub}>Essaie un autre mot-cle ou modifie les filtres</Text>
                      <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                        <Text style={styles.resetBtnText}>Reinitialiser</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    filtered.map(item => <MemberCard key={item.id} item={item} />)
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>📂 Categories</Text>
                  <View style={styles.catGrid}>
                    {SKILL_CATEGORIES.map(cat => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.catCard, activeCategory === cat.id && styles.catCardActive]}
                        onPress={() => setActiveCategory(cat.id)}
                      >
                        <Text style={styles.catEmoji}>{cat.emoji}</Text>
                        <Text style={[styles.catName, activeCategory === cat.id && styles.catNameActive]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.sectionTitle}>👥 Tous les membres</Text>
                  {allUsers.map(item => <MemberCard key={item.id} item={item} />)}
                </>
              )}
            </>
          }
          contentContainerStyle={styles.content}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text },
  subtitle: { color: Colors.textMuted, fontSize: 13, marginTop: 2, marginBottom: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 10, marginBottom: 8 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 14,
    paddingHorizontal: 14, borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15, paddingVertical: 14, marginLeft: 8 },
  filterBtn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  filterBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryTransparent },
  filterBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  filterPanel: {
    backgroundColor: Colors.surface, marginHorizontal: 20,
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterChips: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primaryTransparent, borderColor: Colors.primary },
  filterChipText: { color: Colors.textSecondary, fontSize: 13 },
  filterChipTextActive: { color: Colors.primary, fontWeight: '600' },
  filterToggles: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  toggleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.border,
  },
  toggleChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + '15' },
  toggleDot: { width: 8, height: 8, borderRadius: 4 },
  toggleText: { color: Colors.textSecondary, fontSize: 13 },
  resetBtn: { marginTop: 12, alignItems: 'center', paddingVertical: 8 },
  resetBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: Colors.textMuted, fontSize: 14 },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 4 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  catCard: {
    width: '47%', backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  catCardActive: { backgroundColor: Colors.primaryTransparent, borderColor: Colors.primary },
  catEmoji: { fontSize: 28, marginBottom: 6 },
  catName: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500', textAlign: 'center' },
  catNameActive: { color: Colors.primary },
  memberCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border, gap: 12,
  },
  memberAvatar: { fontSize: 38 },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.accent, borderWidth: 2, borderColor: Colors.surface,
  },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  memberName: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  memberSkills: { color: Colors.textSecondary, fontSize: 12, marginBottom: 2 },
  memberRating: { color: Colors.textMuted, fontSize: 11 },
  proposeBtn: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 12,
  },
  proposeBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  noResult: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  noResultEmoji: { fontSize: 40 },
  noResultText: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  noResultSub: { color: Colors.textMuted, fontSize: 14 },
});
