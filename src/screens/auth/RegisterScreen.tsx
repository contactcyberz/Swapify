import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/colors';
import { registerUser } from '../../services/auth';

export const RegisterScreen = ({ navigation }: any) => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  // Consentements
  const [acceptedTerms, setAcceptedTerms]     = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedAge, setAcceptedAge]         = useState(false);

  const allAccepted = acceptedTerms && acceptedPrivacy && acceptedAge;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())              e.name     = 'Ton prénom est requis';
    if (!email.includes('@'))      e.email    = 'Email invalide';
    if (password.length < 6)       e.password = 'Minimum 6 caractères';
    if (!allAccepted)              e.consent  = 'Tu dois accepter toutes les conditions pour continuer';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await registerUser(
        email.trim().toLowerCase(),
        password,
        name.trim(),
        {
          termsAcceptedAt:   new Date().toISOString(),
          privacyAcceptedAt: new Date().toISOString(),
          legalVersion:      '1.0.0',
          consentIp:         'mobile-app', // On note que c'est depuis l'app mobile
        }
      );
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'Cet email est déjà utilisé'
          : 'Une erreur est survenue. Réessaie.';
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  const CheckboxRow = ({
    value,
    onToggle,
    children,
  }: {
    value: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.checkboxRow} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value && <Ionicons name="checkmark" size={14} color={Colors.white} />}
      </View>
      <View style={styles.checkboxLabel}>{children}</View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Crée ton compte</Text>
          <Text style={styles.subtitle}>C'est gratuit, pour toujours.</Text>

          <View style={styles.form}>
            <Input
              label="Prénom"
              placeholder="Ton prénom"
              value={name}
              onChangeText={setName}
              icon="person-outline"
              error={errors.name}
            />
            <Input
              label="Email"
              placeholder="ton@email.com"
              value={email}
              onChangeText={setEmail}
              icon="mail-outline"
              keyboardType="email-address"
              error={errors.email}
            />
            <Input
              label="Mot de passe"
              placeholder="Minimum 6 caractères"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              isPassword
              error={errors.password}
            />
          </View>

          {/* ── Section consentement légal ── */}
          <View style={styles.consentSection}>
            <View style={styles.consentHeader}>
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
              <Text style={styles.consentTitle}>Consentements requis</Text>
            </View>

            <CheckboxRow value={acceptedTerms} onToggle={() => setAcceptedTerms(v => !v)}>
              <Text style={styles.consentText}>
                J'ai lu et j'accepte les{' '}
                <Text
                  style={styles.consentLink}
                  onPress={() => navigation.navigate('Legal')}
                >
                  Conditions Générales d'Utilisation
                </Text>
                {' '}de Swapify.
              </Text>
            </CheckboxRow>

            <CheckboxRow value={acceptedPrivacy} onToggle={() => setAcceptedPrivacy(v => !v)}>
              <Text style={styles.consentText}>
                J'ai lu et j'accepte la{' '}
                <Text
                  style={styles.consentLink}
                  onPress={() => navigation.navigate('Legal')}
                >
                  Politique de Confidentialité
                </Text>
                {' '}et le traitement de mes données personnelles conformément à la Loi 25 du Québec.
              </Text>
            </CheckboxRow>

            <CheckboxRow value={acceptedAge} onToggle={() => setAcceptedAge(v => !v)}>
              <Text style={styles.consentText}>
                Je confirme avoir au moins <Text style={styles.consentBold}>16 ans</Text> ou avoir obtenu l'autorisation de mon parent ou tuteur légal.
              </Text>
            </CheckboxRow>

            {errors.consent && (
              <View style={styles.consentError}>
                <Ionicons name="alert-circle-outline" size={14} color={Colors.error} />
                <Text style={styles.consentErrorText}>{errors.consent}</Text>
              </View>
            )}
          </View>

          <Button
            title="Créer mon compte"
            onPress={handleRegister}
            loading={loading}
          />

          <View style={styles.legalNote}>
            <Ionicons name="lock-closed-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.legalNoteText}>
              Tes données sont protégées et ne seront jamais vendues à des tiers.
            </Text>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Connexion</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background },
  content:    { padding: 24, flexGrow: 1 },
  back:       { marginBottom: 32 },
  backText:   { color: Colors.textSecondary, fontSize: 15 },
  title:      { fontSize: 32, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  subtitle:   { fontSize: 16, color: Colors.textSecondary, marginBottom: 40 },
  form:       { marginBottom: 24 },

  // Consent section
  consentSection: {
    backgroundColor: Colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, marginBottom: 24, gap: 12,
  },
  consentHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4,
  },
  consentTitle: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1, flexShrink: 0,
    backgroundColor: Colors.background,
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkboxLabel: { flex: 1 },
  consentText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  consentLink: { color: Colors.primary, fontWeight: '600', textDecorationLine: 'underline' },
  consentBold: { fontWeight: '700', color: Colors.text },
  consentError: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.error + '15', borderRadius: 8,
    padding: 10, marginTop: 4,
  },
  consentErrorText: { color: Colors.error, fontSize: 12, flex: 1 },

  legalNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    justifyContent: 'center', marginTop: 12, marginBottom: 4,
  },
  legalNoteText: { color: Colors.textMuted, fontSize: 11 },

  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { color: Colors.textSecondary, fontSize: 14 },
  loginLink: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});
