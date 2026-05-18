import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { authState } from '../../services/authState';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = '@swapify_user';

const AVATAR_OPTIONS = [
  '🧑', '👩', '👨', '🧕', '🧔', '👧', '🧒',
  '👴', '👵', '🦸', '🧙', '🧑‍💻', '🧑‍🎨', '🧑‍🍳', '🧑‍🎤',
  '🧑‍🏫', '🧑‍⚕️', '🧑‍🌾', '🧑‍🔧', '🧑‍🎓',
];

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, profile } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [avatar, setAvatar] = useState('🧑');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setName(user.displayName || '');
    if (profile) {
      setBio(profile.bio || '');
      setCity(profile.city || 'Montréal');
      setAvatar(profile.avatar || '🧑');
    }
  }, [user, profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nom requis', 'Entre ton prénom ou pseudonyme.');
      return;
    }
    setSaving(true);
    try {
      // Update Firestore
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          name: name.trim(),
          bio: bio.trim(),
          city: city.trim() || 'Montréal',
          avatar,
        });
      }

      // Update local AsyncStorage so displayName is reflected instantly
      const stored = await AsyncStorage.getItem(USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = { ...parsed, displayName: name.trim() };
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
        authState.setUser(updated);
      }

      Alert.alert('✅ Profil mis à jour !', 'Tes informations ont été sauvegardées.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder. Vérifie ta connexion.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Modifier le profil</Text>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color={Colors.white} size="small" />
                : <Text style={styles.saveBtnText}>Sauvegarder</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Avatar picker */}
          <View style={styles.section}>
            <Text style={styles.label}>Ton avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((av, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.avatarOption, avatar === av && styles.avatarOptionActive]}
                  onPress={() => setAvatar(av)}
                >
                  <Text style={styles.avatarText}>{av}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Prénom / Pseudonyme *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Sara, Marc D., ..."
              placeholderTextColor={Colors.textMuted}
              maxLength={30}
            />
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={bio}
              onChangeText={setBio}
              placeholder="Parle un peu de toi, de tes passions..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              maxLength={150}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{bio.length}/150</Text>
          </View>

          {/* City */}
          <View style={styles.section}>
            <Text style={styles.label}>Ville</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="location-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.inputInner}
                value={city}
                onChangeText={setCity}
                placeholder="Montréal"
                placeholderTextColor={Colors.textMuted}
                maxLength={50}
              />
            </View>
          </View>

          {/* Info box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>
              Pour modifier tes compétences, retourne sur l'écran Profil et utilise les boutons "+ Ajouter".
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 60 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 28,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 9, minWidth: 110, alignItems: 'center',
  },
  saveBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  section: { marginBottom: 24 },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    padding: 14, color: Colors.text, fontSize: 16,
  },
  inputMultiline: { minHeight: 90, paddingTop: 14 },
  charCount: { color: Colors.textMuted, fontSize: 11, textAlign: 'right', marginTop: 4 },
  inputWithIcon: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 8 },
  inputInner: { flex: 1, color: Colors.text, fontSize: 16, paddingVertical: 14 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  avatarOption: {
    width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface, borderWidth: 2, borderColor: 'transparent',
  },
  avatarOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryTransparent },
  avatarText: { fontSize: 26 },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: Colors.primaryTransparent, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: Colors.primary + '33',
  },
  infoText: { flex: 1, color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
