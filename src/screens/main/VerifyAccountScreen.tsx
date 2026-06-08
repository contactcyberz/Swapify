import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const STEPS = [
  {
    icon: 'person-circle-outline',
    color: Colors.primary,
    title: 'Profil complet',
    desc: 'Ajoute ton prenom, une bio et au moins une competence offerte.',
    action: 'Completer le profil',
    screen: 'EditProfile',
  },
  {
    icon: 'mail-outline',
    color: Colors.accent,
    title: 'Email confirme',
    desc: 'Ton adresse email est verifiee lors de la creation du compte.',
    action: null,
    screen: null,
  },
  {
    icon: 'call-outline',
    color: '#6C63FF',
    title: 'Numero de telephone',
    desc: 'Ajoute ton numero de telephone dans ton profil pour prouver ton identite.',
    action: 'Modifier le profil',
    screen: 'EditProfile',
  },
  {
    icon: 'swap-horizontal-outline',
    color: Colors.warning,
    title: 'Premier echange',
    desc: 'Effectue ton premier echange de competences pour debloquer le badge.',
    action: 'Trouver un membre',
    screen: 'Home',
  },
  {
    icon: 'star-outline',
    color: '#FF6B9D',
    title: 'Note 4+ etoiles',
    desc: 'Recois une evaluation positive apres un echange termine.',
    action: null,
    screen: null,
  },
];

export const VerifyAccountScreen = ({ navigation }: any) => {
  const { user, profile } = useAuth();
  const [requesting, setRequesting] = useState(false);

  const profileComplete = !!(
    profile?.name &&
    profile?.bio &&
    (profile?.skillsOffered?.length ?? 0) > 0
  );
  const hasPhone = !!(profile?.phone);
  const hasExchange = (profile?.exchangeCount ?? 0) > 0;
  const hasGoodRating = (profile?.rating ?? 0) >= 4;

  const completedCount = [profileComplete, true, hasPhone, hasExchange, hasGoodRating].filter(Boolean).length;
  const progress = completedCount / 5;

  const handleRequestBadge = async () => {
    if (completedCount < 5) {
      Alert.alert(
        'Pas encore !',
        `Tu dois completer ${5 - completedCount} etape${5 - completedCount > 1 ? 's' : ''} de plus avant de demander la verification.`,
      );
      return;
    }
    setRequesting(true);
    try {
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), { verificationRequested: true });
      }
      Alert.alert(
        'Demande envoyee !',
        'Notre equipe va examiner ton profil sous 48h. Tu seras notifie par email.',
      );
    } catch (e) {
      Alert.alert('Erreur', 'Reessaie dans un moment.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Verifier mon compte</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.badgeCard}>
          <View style={[styles.badgeIcon, { opacity: completedCount === 5 ? 1 : 0.35 }]}>
            <Ionicons name="shield-checkmark" size={56} color={Colors.accent} />
          </View>
          <Text style={styles.badgeTitle}>Compte verifie</Text>
          <Text style={styles.badgeDesc}>
            Le badge verifie montre a la communaute que tu es un membre de confiance.
          </Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
          <Text style={styles.progressLabel}>{completedCount}/5 etapes completees</Text>
        </View>

        <Text style={styles.sectionTitle}>Etapes de verification</Text>
        <View style={styles.stepsContainer}>
          {STEPS.map((step, i) => {
            const done = i === 0 ? profileComplete : i === 1 ? true : i === 2 ? hasPhone : i === 3 ? hasExchange : hasGoodRating;
            return (
              <View key={i} style={styles.stepCard}>
                <View style={[styles.stepIcon, { backgroundColor: step.color + '22' }]}>
                  <Ionicons
                    name={(done ? 'checkmark-circle' : step.icon) as any}
                    size={26}
                    color={done ? Colors.accent : step.color}
                  />
                </View>
                <View style={styles.stepInfo}>
                  <View style={styles.stepTitleRow}>
                    <Text style={[styles.stepTitle, done && styles.stepTitleDone]}>{step.title}</Text>
                    {done && (
                      <View style={styles.doneBadge}>
                        <Text style={styles.doneBadgeText}>Complete</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                  {!done && step.action && step.screen && (
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => navigation.navigate(step.screen)}
                    >
                      <Text style={styles.stepBtnText}>{step.action} →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.requestBtn, completedCount < 5 && styles.requestBtnDisabled]}
          onPress={handleRequestBadge}
          disabled={requesting}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.white} />
          <Text style={styles.requestBtnText}>
            {requesting ? 'Envoi en cours...' : 'Demander la verification'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          La verification est gratuite. Notre equipe examine chaque demande manuellement sous 48h.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  badgeCard: {
    backgroundColor: Colors.surface, marginHorizontal: 20, borderRadius: 20,
    padding: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
    marginBottom: 24,
  },
  badgeIcon: { marginBottom: 12 },
  badgeTitle: { color: Colors.text, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  badgeDesc: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  progressBg: {
    width: '100%', height: 8, backgroundColor: Colors.background,
    borderRadius: 4, overflow: 'hidden', marginBottom: 8,
  },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 4 },
  progressLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginHorizontal: 20, marginBottom: 12 },
  stepsContainer: { marginHorizontal: 20, gap: 12, marginBottom: 24 },
  stepCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', gap: 14,
  },
  stepIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepInfo: { flex: 1 },
  stepTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  stepTitle: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  stepTitleDone: { color: Colors.textSecondary },
  doneBadge: {
    backgroundColor: Colors.accent + '22', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  doneBadgeText: { color: Colors.accent, fontSize: 11, fontWeight: '700' },
  stepDesc: { color: Colors.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 8 },
  stepBtn: {},
  stepBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
  requestBtn: {
    backgroundColor: Colors.accent, marginHorizontal: 20, borderRadius: 16,
    paddingVertical: 16, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, marginBottom: 16,
  },
  requestBtnDisabled: { opacity: 0.45 },
  requestBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  footer: {
    color: Colors.textMuted, fontSize: 12, textAlign: 'center',
    marginHorizontal: 32, lineHeight: 18,
  },
});
