import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ScrollView, Modal, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { createExchange } from '../../services/exchanges';
import { reportUser, REPORT_REASONS, ReportReason } from '../../services/reports';

const DURATIONS = ['30 min', '1h', '2h', '3h'];

export const ExchangeDetailScreen = ({ route, navigation }: any) => {
  const { provider } = route.params;
  const { user } = useAuth();

  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState('1h');
  const [mySkill, setMySkill] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exchangeId, setExchangeId] = useState('');
  const [showReport, setShowReport] = useState(false);

  const handleReport = (reason: ReportReason) => {
    if (!user?.uid) return;
    reportUser(user.uid, provider.id, provider.name, reason)
      .then(() => {
        setShowReport(false);
        Alert.alert('Signalement envoyé', 'Merci ! Notre équipe va examiner ce profil.');
      })
      .catch(() => Alert.alert('Erreur', 'Impossible d\'envoyer le signalement.'));
  };

  const offeredSkill = provider.skillsOffered?.[0] || 'Compétence';
  const wantedSkill = provider.skillsWanted?.[0] || 'À définir';

  const handlePropose = async () => {
    if (!message.trim()) {
      Alert.alert('Message requis', 'Écris un message pour te présenter !');
      return;
    }
    if (!user?.uid) {
      Alert.alert('Erreur', 'Tu dois être connecté pour proposer un échange.');
      return;
    }

    setLoading(true);
    try {
      const id = await createExchange({
        requesterId: user.uid,
        requesterName: user.displayName || 'Utilisateur',
        requesterAvatar: '🧑',
        providerId: provider.id,
        providerName: provider.name,
        providerAvatar: provider.avatar || '🧑',
        skillOffered: offeredSkill,
        skillWanted: mySkill || wantedSkill,
        message: message.trim(),
        duration,
        status: 'pending',
      });
      setExchangeId(id);
      setShowSuccess(true);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'envoyer la proposition. Réessaie !');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Proposer un échange</Text>
          <TouchableOpacity onPress={() => setShowReport(true)} style={styles.reportBtn}>
            <Ionicons name="flag-outline" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Profil du membre */}
        <View style={styles.profileCard}>
          <Text style={styles.avatar}>{provider.avatar || '🧑'}</Text>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{provider.name}</Text>
              {provider.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
              )}
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={Colors.warning} />
              <Text style={styles.rating}>
                {provider.rating > 0
                  ? `${provider.rating} (${provider.reviewCount} avis)`
                  : 'Nouveau membre'}
              </Text>
            </View>
            {provider.bio && (
              <Text style={styles.bio} numberOfLines={2}>{provider.bio}</Text>
            )}
          </View>
        </View>

        {/* Ses compétences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ce qu'il/elle propose</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.skillsScroll}>
            {(provider.skillsOffered || [offeredSkill]).map((s: string, i: number) => (
              <View key={i} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{s}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* L'échange */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>L'échange proposé</Text>
          <View style={styles.exchangeBox}>
            <View style={styles.skillSide}>
              <Text style={styles.skillLabel}>Il/Elle offre</Text>
              <View style={styles.skillBadge}>
                <Text style={styles.skillBadgeText}>{offeredSkill}</Text>
              </View>
            </View>
            <View style={styles.arrowCenter}>
              <Ionicons name="swap-horizontal" size={28} color={Colors.primary} />
            </View>
            <View style={styles.skillSide}>
              <Text style={styles.skillLabel}>Tu offres</Text>
              <View style={[styles.skillBadge, styles.skillBadgeGreen]}>
                <Text style={[styles.skillBadgeText, { color: Colors.accent }]}>
                  {mySkill || wantedSkill}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ce que TU offres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ta compétence à offrir</Text>
          <TextInput
            style={styles.smallInput}
            placeholder={`Ex: ${wantedSkill}`}
            placeholderTextColor={Colors.textMuted}
            value={mySkill}
            onChangeText={setMySkill}
          />
          <Text style={styles.hint}>Laisse vide pour offrir "{wantedSkill}" (ce qu'il/elle cherche)</Text>
        </View>

        {/* Durée */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Durée souhaitée</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.durationChip, duration === d && styles.durationChipActive]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.durationText, duration === d && styles.durationTextActive]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ton message</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Bonjour ! Je suis intéressé par un échange avec toi. Voici pourquoi..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
          />
        </View>

        {/* Bouton */}
        <TouchableOpacity
          style={[styles.proposeBtn, loading && { opacity: 0.7 }]}
          onPress={handlePropose}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="paper-plane" size={18} color={Colors.white} />
              <Text style={styles.proposeBtnText}>Envoyer la proposition</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal signalement */}
      <Modal visible={showReport} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowReport(false)} />
          <View style={styles.reportModal}>
            <View style={styles.reportHandle} />
            <Text style={styles.reportTitle}>🚩 Signaler {provider.name}</Text>
            <Text style={styles.reportSubtitle}>Pourquoi signales-tu ce profil ?</Text>
            {REPORT_REASONS.map(r => (
              <TouchableOpacity
                key={r.id}
                style={styles.reportOption}
                onPress={() => handleReport(r.id)}
              >
                <Text style={styles.reportEmoji}>{r.emoji}</Text>
                <Text style={styles.reportLabel}>{r.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowReport(false)} style={styles.reportCancel}>
              <Text style={styles.reportCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal succès */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Proposition envoyée !</Text>
            <Text style={styles.modalSubtitle}>
              {provider.name} recevra ta demande et pourra te répondre dans les messages.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setShowSuccess(false);
                navigation.navigate('Messages');
              }}
            >
              <Ionicons name="chatbubbles" size={16} color={Colors.white} />
              <Text style={styles.modalBtnText}>Voir mes messages</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnSecondary}
              onPress={() => { setShowSuccess(false); navigation.navigate('Home'); }}
            >
              <Text style={styles.modalBtnSecondaryText}>Retour à l'accueil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 120 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  profileCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.surface, borderRadius: 20,
    padding: 16, marginBottom: 20, borderWidth: 1, borderColor: Colors.border,
  },
  avatar: { fontSize: 48, marginRight: 16 },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  name: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  rating: { color: Colors.textSecondary, fontSize: 13 },
  bio: { color: Colors.textMuted, fontSize: 12, lineHeight: 18 },
  section: { marginBottom: 24 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  skillsScroll: { marginBottom: 4 },
  skillChip: {
    backgroundColor: Colors.primaryTransparent, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
    borderWidth: 1, borderColor: Colors.primary + '44',
  },
  skillChipText: { color: Colors.primary, fontSize: 13, fontWeight: '500' },
  exchangeBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: Colors.border,
  },
  skillSide: { flex: 1, alignItems: 'center' },
  skillLabel: { color: Colors.textMuted, fontSize: 11, marginBottom: 8 },
  skillBadge: {
    backgroundColor: Colors.primaryTransparent,
    borderRadius: 10, padding: 10, alignItems: 'center', width: '100%',
  },
  skillBadgeGreen: { backgroundColor: Colors.accent + '22' },
  skillBadgeText: { color: Colors.primary, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  arrowCenter: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryTransparent,
    alignItems: 'center', justifyContent: 'center', marginHorizontal: 8,
  },
  smallInput: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    padding: 12, color: Colors.text, fontSize: 15, marginBottom: 6,
  },
  hint: { color: Colors.textMuted, fontSize: 11 },
  durationRow: { flexDirection: 'row', gap: 10 },
  durationChip: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  durationChipActive: { backgroundColor: Colors.primaryTransparent, borderColor: Colors.primary },
  durationText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
  durationTextActive: { color: Colors.primary, fontWeight: '700' },
  messageInput: {
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    padding: 14, color: Colors.text, fontSize: 15,
    minHeight: 120, textAlignVertical: 'top',
  },
  proposeBtn: {
    backgroundColor: Colors.primary, borderRadius: 16,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  proposeBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  modalCard: {
    backgroundColor: Colors.surface, borderRadius: 24,
    padding: 32, alignItems: 'center', width: '100%',
  },
  modalEmoji: { fontSize: 56, marginBottom: 16 },
  modalTitle: { color: Colors.text, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  modalSubtitle: {
    color: Colors.textSecondary, fontSize: 14,
    textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },
  modalBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 32,
    marginBottom: 12, width: '100%',
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  modalBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  modalBtnSecondary: { paddingVertical: 10 },
  modalBtnSecondaryText: { color: Colors.textMuted, fontSize: 14 },
  reportBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  reportModal: { backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  reportHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  reportTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  reportSubtitle: { color: Colors.textMuted, fontSize: 13, marginBottom: 16 },
  reportOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  reportEmoji: { fontSize: 20 },
  reportLabel: { flex: 1, color: Colors.text, fontSize: 15 },
  reportCancel: { marginTop: 16, alignItems: 'center', paddingVertical: 12 },
  reportCancelText: { color: Colors.textMuted, fontSize: 15 },
});
