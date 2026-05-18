import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { submitRating } from '../../services/ratings';

const STARS = [1, 2, 3, 4, 5];

const QUICK_COMMENTS = [
  'Super échange, très pédagogue !',
  'Ponctuel et professionnel',
  'Je recommande vivement',
  'Très bonne ambiance',
  'Compétences impressionnantes',
];

export const RatingScreen = ({ route, navigation }: any) => {
  const { exchange } = route.params;
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const isRequester = exchange.requesterId === user?.uid;
  const reviewedId = isRequester ? exchange.providerId : exchange.requesterId;
  const reviewedName = isRequester ? exchange.providerName : exchange.requesterName;
  const reviewedAvatar = isRequester ? exchange.providerAvatar : exchange.requesterAvatar;

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Note requise', 'Donne au moins 1 étoile !');
      return;
    }
    setLoading(true);
    try {
      await submitRating(
        user!.uid,
        user!.displayName || 'Utilisateur',
        reviewedId,
        exchange.id,
        rating,
        comment.trim(),
      );
      Alert.alert('⭐ Merci !', 'Ton avis a été enregistré et le solde temps mis à jour.', [
        { text: 'Super !', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer la note. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hoveredStar || rating;
  const ratingLabel = ['', 'Décevant', 'Moyen', 'Bien', 'Très bien', 'Excellent !'][displayRating];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Évaluer l'échange</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Person */}
          <View style={styles.personCard}>
            <Text style={styles.personAvatar}>{reviewedAvatar}</Text>
            <Text style={styles.personName}>{reviewedName}</Text>
            <Text style={styles.personSkill}>{exchange.skillOffered}</Text>
          </View>

          {/* Stars */}
          <View style={styles.starsSection}>
            <Text style={styles.starsLabel}>Comment était l'échange ?</Text>
            <View style={styles.stars}>
              {STARS.map(s => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setRating(s)}
                  onPressIn={() => setHoveredStar(s)}
                  onPressOut={() => setHoveredStar(0)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={s <= displayRating ? 'star' : 'star-outline'}
                    size={48}
                    color={s <= displayRating ? Colors.warning : Colors.border}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {displayRating > 0 && (
              <Text style={[styles.ratingLabel, { color: displayRating >= 4 ? Colors.accent : displayRating >= 3 ? Colors.warning : Colors.error }]}>
                {ratingLabel}
              </Text>
            )}
          </View>

          {/* Quick comments */}
          <View style={styles.quickSection}>
            <Text style={styles.quickLabel}>Commentaires rapides :</Text>
            <View style={styles.quickChips}>
              {QUICK_COMMENTS.map((q, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.quickChip, comment === q && styles.quickChipActive]}
                  onPress={() => setComment(comment === q ? '' : q)}
                >
                  <Text style={[styles.quickChipText, comment === q && styles.quickChipTextActive]}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Comment input */}
          <View style={styles.commentSection}>
            <Text style={styles.commentLabel}>Ou écris ton propre avis :</Text>
            <TextInput
              style={styles.input}
              placeholder="Partage ton expérience..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{comment.length}/200</Text>
          </View>

          {/* Time balance info */}
          <View style={styles.infoBox}>
            <Ionicons name="time-outline" size={18} color={Colors.accent} />
            <Text style={styles.infoText}>
              En confirmant cet échange, vous recevez chacun <Text style={{ color: Colors.accent, fontWeight: '700' }}>+1h</Text> sur votre solde temps !
            </Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, (rating === 0 || loading) && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={rating === 0 || loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                  <Text style={styles.submitText}>Confirmer l'échange</Text>
                </>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  personCard: { alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 20, padding: 24, marginBottom: 28, borderWidth: 1, borderColor: Colors.border },
  personAvatar: { fontSize: 56, marginBottom: 10 },
  personName: { color: Colors.text, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  personSkill: { color: Colors.primary, fontSize: 14, fontWeight: '500' },
  starsSection: { alignItems: 'center', marginBottom: 28 },
  starsLabel: { color: Colors.textSecondary, fontSize: 16, marginBottom: 16 },
  stars: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  ratingLabel: { fontSize: 18, fontWeight: '700' },
  quickSection: { marginBottom: 20 },
  quickLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 10 },
  quickChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  quickChipActive: { backgroundColor: Colors.primaryTransparent, borderColor: Colors.primary },
  quickChipText: { color: Colors.textSecondary, fontSize: 13 },
  quickChipTextActive: { color: Colors.primary, fontWeight: '600' },
  commentSection: { marginBottom: 20 },
  commentLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 10 },
  input: { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, color: Colors.text, fontSize: 15, minHeight: 90 },
  charCount: { color: Colors.textMuted, fontSize: 11, textAlign: 'right', marginTop: 4 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.accent + '15', borderRadius: 12, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: Colors.accent + '33' },
  infoText: { flex: 1, color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
