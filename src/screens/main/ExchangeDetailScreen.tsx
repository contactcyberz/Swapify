import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ScrollView, Modal, ActivityIndicator,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { createExchange } from '../../services/exchanges';
import { reportUser, REPORT_REASONS, ReportReason } from '../../services/reports';

const DURATIONS = ['30 min', '1h', '2h', '3h'];
const MAX_MESSAGE = 300;

export const ExchangeDetailScreen = ({ route, navigation }: any) => {
  const { provider } = route.params;
  const { user } = useAuth();

  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState('1h');
  const [mySkill, setMySkill] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const successScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (showSuccess) {
      Animated.spring(successScale, { toValue: 1, useNativeDriver: true, tension: 80 }).start();
    } else {
      successScale.setValue(0.8);
    }
  }, [showSuccess]);

  const handleReport = (reason: ReportReason) => {
    if (!user?.uid) return;
    reportUser(user.uid, provider.id, provider.name, reason)
      .then(() => {
        setShowReport(false);
        Alert.alert('Signalement envoye', 'Merci ! Notre equipe va examiner ce profil.');
      })
      .catch(() => Alert.alert('Erreur', 'Impossible d\'envoyer le signalement.'));
  };

  const offeredSkill = provider.skillsOffered?.[0] || 'Competence';
  const wantedSkill = provider.skillsWanted?.[0] || 'A definir';

  const handlePropose = async () => {
    if (!message.trim()) {
      Alert.alert('Message requis', 'Ecris un message pour te presenter !');
      return;
    }
    if (!user?.uid) {
      Alert.alert('Erreur', 'Tu dois etre connecte pour proposer un echange.');
      return;
    }
    setLoading(true);
    try {
      await createExchange({
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
      setShowSuccess(true);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'envoyer la proposition. Reessaie !');
    } finally {
      setLoading(false);
    }
  };

  const charsLeft = MAX_MESSAGE - message.length;

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
            <Text style={styles.headerTitle}>Proposer un echange</Text>
            <TouchableOpacity onPress={() => setShowReport(true)} style={styles.reportBtn}>
              <Ionicons name="flag-outline" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Profil */}
          <Animated.View style={[styles.profileCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
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
              {provider.bio ? (
                <Text style={styles.bio} numberOfLines={2}>{provider.bio}</Text>
              ) : null}
            </View>
          </Animated.View>

          {/* Skills proposees */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ce qu'il/elle propose</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(provider.skillsOffered?.length > 0 ? provider.skillsOffered : [offeredSkill]).map((s: string, i: number) => (
                <View key={i} style={styles.skillChip}>
                  <Text style={styles.skillChipText}>{s}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Ce qu'il/elle cherche */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ce qu'il/elle cherche</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(provider.skillsWanted?.length > 0 ? provider.skillsWanted : [wantedSkill]).map((s: string, i: number) => (
                <View key={i} style={[styles.skillChip, styles.skillChipGreen]}>
                  <Text style={[styles.skillChipText, { color: Colors.accent }]}>{s}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* L'echange */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>L'echange propose</Text>
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

          {/* Ta competence */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ta competence a offrir</Text>
            <TextInput
              style={styles.smallInput}
              placeholder={`Ex: ${wantedSkill}`}
              placeholderTextColor={Colors.textMuted}
              value={mySkill}
              onChangeText={setMySkill}
            />
            <Text style={styles.hint}>Laisse vide pour offrir "{wantedSkill}"</Text>
          </View>

          {/* Duree */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duree souhaitee</Text>
            <View style={styles.durationRow}>
              {DURATIONS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationChip, duration === d && styles.durationChipActive]}
                  onPress={() => setDuration(d)}
                >
                  <Text style={[styles.durationText, duration === d && styles.durationTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Message */}
          <View style={styles.section}>
            <View style={styles.messageTitleRow}>
              <Text style={styles.sectionTitle}>Ton message</Text>
              <Text style={[styles.charCount, charsLeft < 50 && { color: Colors.error }]}>
                {charsLeft} caracteres
              </Text>
            </View>
            <TextInput
              style={styles.messageInput}
              placeholder="Bonjour ! Je suis interesse par un echange avec toi..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={t => setMessage(t.slice(0, MAX_MESSAGE))}
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
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setShowReport(false)} />
          <View style={styles.reportModal}>
            <View style={styles.reportHandle} />
            <Text style={styles.reportTitle}>Signaler {provider.name}</Text>
            <Text style={styles.reportSubtitle}>Pourquoi signales-tu ce profil ?</Text>
            {REPORT_REASONS.map(r => (
              <TouchableOpacity key={r.id} style={styles.reportOption} onPress={() => handleReport(r.id)}>
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

      {/* Modal succes */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Proposition envoyee !</Text>
            <Text style={styles.successSubtitle}>
              {provider.name} recevra ta demande et pourra te repondre dans les messages.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => { setShowSuccess(false); navigation.navigate('Messages'); }}
            >
              <Ionicons name="chatbubbles" size={16} color={Colors.white} />
              <Text style={styles.successBtnText}>Voir mes messages</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.successBtnSecondary}
              onPress={() => { setShowSuccess(false); navigation.navigate('Home'); }}
            >
              <Text style={styles.successBtnSecondaryText}>Retour a l'accueil</Text>
            </TouchableOpacity>
          </Animated.View>
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
  reportBtn: {
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
  skillChip: {
    backgroundColor: Colors.primaryTransparent, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
    borderWidth: 1, borderColor: Colors.primary + '44',
  },
  skillChipGreen: {
    backgroundColor: Colors.accent + '22',
    borderColor: Colors.accent + '44',
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
  messageTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  charCount: { color: Colors.textMuted, fontSize: 12 },
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
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  reportModal: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 24, paddingBottom: 40,
  },
  reportHandle: {
    width: 40, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  reportTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  reportSubtitle: { color: Colors.textMuted, fontSize: 13, marginBottom: 16 },
  reportOption: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12,
  },
  reportEmoji: { fontSize: 20 },
  reportLabel: { flex: 1, color: Colors.text, fontSize: 15 },
  reportCancel: { marginTop: 16, alignItems: 'center', paddingVertical: 12 },
  reportCancelText: { color: Colors.textMuted, fontSize: 15 },
  successOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  successCard: {
    backgroundColor: Colors.surface, borderRadius: 24,
    padding: 32, alignItems: 'center', width: '100%',
  },
  successEmoji: { fontSize: 64, marginBottom: 16 },
  successTitle: { color: Colors.text, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  successSubtitle: {
    color: Colors.textSecondary, fontSize: 14,
    textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },
  successBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 32, marginBottom: 12,
    width: '100%', alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  successBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  successBtnSecondary: { paddingVertical: 10 },
  successBtnSecondaryText: { color: Colors.textMuted, fontSize: 14 },
});
