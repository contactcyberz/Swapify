import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, TextInput, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { logoutUser } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { SKILL_CATEGORIES } from '../../types';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { registerForPushNotifications } from '../../services/notifications';
import { Share } from 'react-native';

const AVATAR_OPTIONS = ['🧑', '👩', '👨', '🧕', '🧔', '👧', '🧒', '👴', '👵', '🦸', '🧙', '🧑‍💻', '🧑‍🎨', '🧑‍🍳', '🧑‍🎤'];

export const ProfileScreen = ({ navigation }: any) => {

  const { user, profile } = useAuth();

  const [skillsOffered, setSkillsOffered] = useState<string[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<string[]>([]);
  const [avatar, setAvatar] = useState('🧑');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
{ icon: 'help-circle-outline', label: 'Aide & Support', color: Colors.textSecondary, onPress: () => navigation.navigate('Help') },
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'offered' | 'wanted'>('offered');
  const [newSkill, setNewSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Avatar picker
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  useEffect(() => {
    if (profile) {
      setSkillsOffered(profile.skillsOffered || []);
      setSkillsWanted(profile.skillsWanted || []);
      if (profile.avatar) setAvatar(profile.avatar);
      if (profile.photoUri) setPhotoUri(profile.photoUri);
    }
    // Register push notifications when profile loads
    if (user?.uid) {
      registerForPushNotifications(user.uid).catch(() => {});
    }
  }, [profile, user?.uid]);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted' && status !== 'limited') {
  Alert.alert('Permission requise', 'Autorise l\'accès à tes photos dans les réglages.', [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Ouvrir les réglages', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() },
  ]);
  return;
}
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) {
      // Resize to 300x300 to keep Firestore document small
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true },
      );
      const dataUri = `data:image/jpeg;base64,${manipulated.base64}`;
      setPhotoUri(dataUri);
      // Save to Firestore
      if (user?.uid) {
        try {
          await updateDoc(doc(db, 'users', user.uid), { photoUri: dataUri });
        } catch (e) { console.log('Photo save error:', e); }
      }
    }
  };

  const displayName = user?.displayName || profile?.name || 'Mon compte';
  const rating = profile?.rating || 0;
  const exchanges = profile?.exchangeCount || 0;
  const timeBalance = profile?.timeBalance || 0;

  const openModal = (type: 'offered' | 'wanted') => {
    setModalType(type);
    setNewSkill('');
    setSelectedCategory('');
    setModalVisible(true);
  };

  const addSkill = async () => {
    const skillName = newSkill.trim();
    if (!skillName) return;

    const updated = modalType === 'offered'
      ? [...skillsOffered, skillName]
      : [...skillsWanted, skillName];

    if (modalType === 'offered') setSkillsOffered(updated);
    else setSkillsWanted(updated);

    // Save to Firestore
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          [modalType === 'offered' ? 'skillsOffered' : 'skillsWanted']: updated,
        });
      } catch (e) {
        console.log('Firestore update error:', e);
      }
    }

    setModalVisible(false);
    setNewSkill('');
  };

  const removeSkill = async (type: 'offered' | 'wanted', skill: string) => {
    const updated = type === 'offered'
      ? skillsOffered.filter(s => s !== skill)
      : skillsWanted.filter(s => s !== skill);

    if (type === 'offered') setSkillsOffered(updated);
    else setSkillsWanted(updated);

    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          [type === 'offered' ? 'skillsOffered' : 'skillsWanted']: updated,
        });
      } catch (e) {}
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Tu veux vraiment te déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logoutUser },
    ]);
  };
  const handleDeleteAccount = () => {
  Alert.alert(
    'Supprimer mon compte',
    'Cette action est irréversible. Toutes tes données seront supprimées définitivement.',
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          Alert.alert(
            'Confirmer la suppression',
            'Es-tu vraiment sûr(e) ? Ton compte et toutes tes données seront perdus.',
            [
              { text: 'Annuler', style: 'cancel' },
              {
                text: 'Oui, supprimer',
                style: 'destructive',
                onPress: async () => {
                  try {
                    if (user?.uid) {
                      const { deleteDoc, doc: firestoreDoc } = await import('firebase/firestore');
                      await deleteDoc(firestoreDoc(db, 'users', user.uid));
                    }
                    await logoutUser();
                  } catch (e) {
                    Alert.alert('Erreur', 'Impossible de supprimer le compte. Réessaie plus tard.');
                  }
                },
              },
            ]
          );
        },
      },
    ]
  );
};

  const QUICK_SKILLS_OFFERED = ['Python', 'Guitare', 'Yoga', 'Anglais', 'Cuisine', 'Photo', 'Dessin', 'Excel'];
  const QUICK_SKILLS_WANTED = ['Espagnol', 'Piano', 'Jardinage', 'Comptabilité', 'Montage vidéo', 'Musculation'];

  const quickSkills = modalType === 'offered' ? QUICK_SKILLS_OFFERED : QUICK_SKILLS_WANTED;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mon profil</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="settings-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Avatar + Info */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={pickPhoto} style={styles.avatarContainer}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarPhoto} />
            ) : (
              <Text style={styles.avatar}>{avatar}</Text>
            )}
            <View style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={14} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.location}>📍 Montréal, Canada</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{timeBalance}h</Text>
              <Text style={styles.statLabel}>Solde temps</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{exchanges}</Text>
              <Text style={styles.statLabel}>Échanges</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{rating > 0 ? `${rating}⭐` : '—'}</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
          </View>
        </View>

        {/* Skills offered */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ce que j'offre</Text>
            <TouchableOpacity onPress={() => openModal('offered')}>
              <Text style={styles.addLink}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>
          {skillsOffered.length === 0 ? (
            <TouchableOpacity style={styles.emptySkills} onPress={() => openModal('offered')}>
              <Ionicons name="add-circle-outline" size={28} color={Colors.primary} />
              <Text style={styles.emptyText}>Ajoute tes premières compétences !</Text>
              <Text style={styles.emptySubText}>Ce que tu peux enseigner aux autres</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.tagsContainer}>
              {skillsOffered.map((skill, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.tagOffered}
                  onLongPress={() => Alert.alert('Supprimer', `Retirer "${skill}" de tes compétences ?`, [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Supprimer', style: 'destructive', onPress: () => removeSkill('offered', skill) },
                  ])}
                >
                  <Text style={styles.tagOfferedText}>{skill}</Text>
                  <Ionicons name="close" size={14} color={Colors.primary} onPress={() => removeSkill('offered', skill)} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.tagAdd} onPress={() => openModal('offered')}>
                <Ionicons name="add" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Skills wanted */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ce que je cherche</Text>
            <TouchableOpacity onPress={() => openModal('wanted')}>
              <Text style={styles.addLink}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>
          {skillsWanted.length === 0 ? (
            <TouchableOpacity style={styles.emptySkills} onPress={() => openModal('wanted')}>
              <Ionicons name="search-outline" size={28} color={Colors.accent} />
              <Text style={styles.emptyText}>Qu'est-ce que tu veux apprendre ?</Text>
              <Text style={styles.emptySubText}>Dis ce que tu cherches à apprendre</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.tagsContainer}>
              {skillsWanted.map((skill, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.tagWanted}
                  onLongPress={() => Alert.alert('Supprimer', `Retirer "${skill}" de ta liste ?`, [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Supprimer', style: 'destructive', onPress: () => removeSkill('wanted', skill) },
                  ])}
                >
                  <Text style={styles.tagWantedText}>{skill}</Text>
                  <Ionicons name="close" size={14} color={Colors.accent} onPress={() => removeSkill('wanted', skill)} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.tagAddAccent} onPress={() => openModal('wanted')}>
                <Ionicons name="add" size={16} color={Colors.accent} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Menu items */}
        <View style={styles.menuSection}>
          {[
            { icon: 'time-outline', label: 'Historique des échanges', color: Colors.primary, onPress: () => navigation.navigate('ExchangeHistory') },
            { icon: 'star-outline', label: 'Mes avis', color: Colors.warning, onPress: () => navigation.navigate('MyReviews') },
            { icon: 'share-outline', label: 'Partager mon profil', color: Colors.primary, onPress: () => Share.share({ message: `Je suis sur Swapify ! Je peux t'enseigner des compétences et apprendre de toi. Rejoins-moi : https://swapify.app`, title: 'Swapify' }) },
            { icon: 'shield-checkmark-outline', label: 'Vérifier mon compte', color: Colors.accent, onPress: () => navigation.navigate('VerifyAccount') },
            { icon: 'help-circle-outline', label: 'Aide & Support', color: Colors.textSecondary, onPress: () => navigation.navigate('Help') },
      { icon: 'trash-outline', label: 'Supprimer mon compte', color: Colors.error, onPress: handleDeleteAccount },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuItem, i === arr.length - 1 && { borderBottomWidth: 0 }]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIconBg, { backgroundColor: item.color + '22' }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Skill Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {modalType === 'offered' ? '🎓 Ce que tu offres' : '🔍 Ce que tu cherches'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {modalType === 'offered' ? 'Quelle compétence peux-tu enseigner ?' : 'Qu\'est-ce que tu veux apprendre ?'}
            </Text>

            {/* Text input */}
            <TextInput
              style={styles.input}
              placeholder="Ex: Cours de piano, Yoga, Python..."
              placeholderTextColor={Colors.textMuted}
              value={newSkill}
              onChangeText={setNewSkill}
              onSubmitEditing={addSkill}
              returnKeyType="done"
              autoFocus
            />

            {/* Quick suggestions */}
            <Text style={styles.suggestTitle}>Suggestions rapides :</Text>
            <View style={styles.suggestContainer}>
              {quickSkills.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.suggestChip, newSkill === s && styles.suggestChipActive]}
                  onPress={() => setNewSkill(s)}
                >
                  <Text style={[styles.suggestText, newSkill === s && styles.suggestTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Confirm button */}
            <TouchableOpacity
              style={[styles.confirmBtn, !newSkill.trim() && styles.confirmBtnDisabled]}
              onPress={addSkill}
              disabled={!newSkill.trim()}
            >
              <Text style={styles.confirmBtnText}>Ajouter cette compétence</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Avatar Picker Modal */}
      <Modal visible={avatarModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setAvatarModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choisis ton avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((av, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.avatarOption, avatar === av && styles.avatarOptionActive]}
                  onPress={() => { setAvatar(av); setAvatarModalVisible(false); }}
                >
                  <Text style={styles.avatarOptionText}>{av}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text },
  editBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: Colors.surface, marginHorizontal: 20, borderRadius: 20,
    padding: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { fontSize: 64 },
  avatarPhoto: { width: 80, height: 80, borderRadius: 40 },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: -4,
    backgroundColor: Colors.primary, borderRadius: 12,
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
  },
  name: { color: Colors.text, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  location: { color: Colors.textMuted, fontSize: 13, marginBottom: 20 },
  statsRow: {
    flexDirection: 'row', width: '100%',
    backgroundColor: Colors.background, borderRadius: 14, padding: 16,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  statLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  addLink: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  emptySkills: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 24,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
    borderStyle: 'dashed', gap: 6,
  },
  emptyText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  emptySubText: { color: Colors.textMuted, fontSize: 12, textAlign: 'center' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagOffered: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primaryTransparent, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.primary + '44',
  },
  tagOfferedText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  tagWanted: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.accent + '22', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.accent + '44',
  },
  tagWantedText: { color: Colors.accent, fontSize: 13, fontWeight: '600' },
  tagAdd: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.primaryTransparent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primary + '44',
  },
  tagAddAccent: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.accent + '22',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.accent + '44',
  },
  menuSection: {
    marginHorizontal: 20, backgroundColor: Colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 20, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12,
  },
  menuIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, color: Colors.text, fontSize: 15 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, padding: 16, borderRadius: 14,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.error + '44', gap: 8,
  },
  logoutText: { color: Colors.error, fontSize: 15, fontWeight: '600' },

  // Modal styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  modalSubtitle: { color: Colors.textMuted, fontSize: 14, marginBottom: 20 },
  input: {
    backgroundColor: Colors.background, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    color: Colors.text, fontSize: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
  },
  suggestTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 10 },
  suggestContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  suggestChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
  },
  suggestChipActive: { backgroundColor: Colors.primaryTransparent, borderColor: Colors.primary },
  suggestText: { color: Colors.textSecondary, fontSize: 13 },
  suggestTextActive: { color: Colors.primary, fontWeight: '600' },
  confirmBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },

  // Avatar picker
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 12 },
  avatarOption: {
    width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.background, borderWidth: 2, borderColor: 'transparent',
  },
  avatarOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryTransparent },
  avatarOptionText: { fontSize: 30 },
});
