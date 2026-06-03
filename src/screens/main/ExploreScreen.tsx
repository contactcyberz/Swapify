import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { SKILL_CATEGORIES } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { getNearbyUsers } from '../../services/users';

export const ExploreScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    getNearbyUsers(user.uid).then(result => {
      setAllUsers(result);
      setLoading(false);
    });
  }, [user?.uid]);

  // Filter users by search term or category
  const filtered = allUsers.filter(u => {
    const allSkills = [
      ...(u.skillsOffered || []),
      ...(u.skillsWanted || []),
      u.name || '',
    ].join(' ').toLowerCase();

    const matchesSearch = search.length === 0 || allSkills.includes(search.toLowerCase());

    const categoryKeywords: Record<string, string[]> = {
      tech: ['python', 'react', 'code', 'web', 'javascript', 'machine', 'excel', 'photoshop', 'programmation'],
      language: ['anglais', 'espagnol', 'français', 'arabe', 'mandarin', 'langue', 'conversation'],
      music: ['guitare', 'piano', 'chant', 'batterie', 'ukulélé', 'musique'],
      cooking: ['cuisine', 'pâtisserie', 'boulangerie', 'chef', 'recette'],
      sports: ['yoga', 'musculation', 'running', 'natation', 'tennis', 'sport', 'fitness'],
      business: ['comptabilité', 'marketing', 'gestion', 'finance', 'revenus'],
      art: ['dessin', 'peinture', 'photographie', 'montage', 'design', 'aquarelle'],
      health: ['méditation', 'nutrition', 'santé', 'bien-être'],
      education: ['mathématiques', 'physique', 'histoire', 'tutorat'],
      home: ['jardinage', 'bricolage', 'électricité', 'plomberie'],
    };

    const matchesCategory = !activeCategory ||
      (categoryKeywords[activeCategory] || []).some(kw => allSkills.includes(kw));

    return matchesSearch && matchesCategory;
  });

  const showResults = search.length > 0 || activeCategory !== null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorer</Text>
        <Text style={styles.subtitle}>{allUsers.length} membres actifs</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Compétence, prénom..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={text => { setSearch(text); setActiveCategory(null); }}
          returnKeyType="search"
        />
        {(search.length > 0 || activeCategory) && (
          <TouchableOpacity onPress={() => { setSearch(''); setActiveCategory(null); }}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

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
              {/* Search results */}
              {showResults ? (
                <>
                  <Text style={styles.sectionTitle}>
                    {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
                    {search ? ` pour "${search}"` : ''}
                  </Text>
                  {filtered.length === 0 ? (
                    <View style={styles.noResult}>
                      <Text style={styles.noResultEmoji}>🔍</Text>
                      <Text style={styles.noResultText}>Aucun résultat</Text>
                      <Text style={styles.noResultSub}>Essaie un autre mot-clé</Text>
                    </View>
                  ) : (
                    filtered.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.memberCard}
                        onPress={() => navigation.navigate('ExchangeDetail', { provider: item })}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.memberAvatar}>{item.avatar || '🧑'}</Text>
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
                          {item.rating > 0 && (
                            <Text style={styles.memberRating}>
                              ⭐ {item.rating} · {item.distance || 'Montréal'}
                            </Text>
                          )}
                        </View>
                       <View style={{ alignItems: 'center', gap: 6 }}>
  <View style={styles.proposeBtn}>
    <Text style={styles.proposeBtnText}>Échanger</Text>
  </View>
  <TouchableOpacity onPress={() => Alert.alert('Signaler / Bloquer', `Que veux-tu faire avec ${item.name} ?`, [
    { text: 'Annuler', style: 'cancel' },
    { text: '🚩 Signaler', onPress: () => Alert.alert('Signalé', 'Merci, nous allons examiner ce profil sous 24h.') },
    { text: '🚫 Bloquer', style: 'destructive', onPress: () => Alert.alert('Bloqué', `${item.name} a été bloqué.`) },
  ])}>
    <Text style={{ color: Colors.textMuted, fontSize: 11 }}>Signaler</Text>
  </TouchableOpacity>
</View>
                      </TouchableOpacity>
                    ))
                  )}
                </>
              ) : (
                <>
                  {/* Categories */}
                  <Text style={styles.sectionTitle}>📂 Catégories</Text>
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

                  {/* All members */}
                  <Text style={styles.sectionTitle}>👥 Tous les membres</Text>
                  {allUsers.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.memberCard}
                      onPress={() => navigation.navigate('ExchangeDetail', { provider: item })}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.memberAvatar}>{item.avatar || '🧑'}</Text>
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
                        {item.rating > 0 && (
                          <Text style={styles.memberRating}>⭐ {item.rating}</Text>
                        )}
                      </View>
                      <View style={{ alignItems: 'center', gap: 6 }}>
  <View style={styles.proposeBtn}>
    <Text style={styles.proposeBtnText}>Échanger</Text>
  </View>
  <TouchableOpacity onPress={() => Alert.alert('Signaler / Bloquer', `Que veux-tu faire avec ${item.name} ?`, [
    { text: 'Annuler', style: 'cancel' },
    { text: '🚩 Signaler', onPress: () => Alert.alert('Signalé', 'Merci, nous allons examiner ce profil sous 24h.') },
    { text: '🚫 Bloquer', style: 'destructive', onPress: () => Alert.alert('Bloqué', `${item.name} a été bloqué.`) },
  ])}>
    <Text style={{ color: Colors.textMuted, fontSize: 11 }}>Signaler</Text>
  </TouchableOpacity>
</View>
                    </TouchableOpacity>
                  ))}
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
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 14,
    marginHorizontal: 20, marginBottom: 16,
    paddingHorizontal: 14, borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15, paddingVertical: 14, marginLeft: 8 },
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
