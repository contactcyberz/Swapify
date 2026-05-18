import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const FAQ = [
  {
    q: "Comment fonctionne Swapify ?",
    a: "Swapify est une plateforme d'échange de compétences basée sur le temps. 1 heure de service = 1 heure de crédit. Tu offres ce que tu sais faire, et tu reçois en retour ce que tu veux apprendre — sans argent !"
  },
  {
    q: "Comment proposer un échange ?",
    a: "Sur l'accueil, parcours les membres et clique sur \"Proposer un échange\" sur le profil qui t'intéresse. Choisis la compétence offerte, celle désirée, et la durée. L'autre membre recevra une notification."
  },
  {
    q: "Comment accepter ou refuser une demande ?",
    a: "Quand quelqu'un te propose un échange, tu reçois une notification. Va dans l'onglet Messages, ouvre la conversation et clique sur \"Accepter\" ou \"Décliner\" en haut de l'écran."
  },
  {
    q: "Comment fonctionne le solde temps ?",
    a: "Chaque échange terminé et noté ajoute +1h à ton solde pour toi et ton partenaire. Ces heures représentent ta contribution à la communauté et peuvent être utilisées pour des échanges futurs."
  },
  {
    q: "Comment laisser un avis ?",
    a: "Une fois un échange accepté, le bouton \"Terminer l'échange & noter\" apparaît dans le chat. Clique dessus pour attribuer une note de 1 à 5 étoiles et laisser un commentaire optionnel."
  },
  {
    q: "Mes informations sont-elles sécurisées ?",
    a: "Oui ! Toutes tes données sont chiffrées et stockées de façon sécurisée dans Firebase (Google Cloud). Seul toi et les membres avec qui tu échanges peuvent voir vos conversations."
  },
  {
    q: "Comment signaler un membre ?",
    a: "Sur la page de détail d'un échange (avant de proposer), clique sur le bouton \"Signaler\" en bas de l'écran. Choisis la raison et notre équipe examinera le signalement."
  },
  {
    q: "L'application est-elle gratuite ?",
    a: "Swapify est 100% gratuite, pour toujours. Nous croyons que les échanges de savoir ne devraient pas coûter d'argent. Aucun abonnement, aucune commission cachée."
  },
  {
    q: "Comment supprimer mon compte ?",
    a: "Pour supprimer ton compte, écris-nous à support@swapify.app avec ton adresse email. Nous traiterons ta demande dans les 48h et supprimerons toutes tes données."
  },
];

const getContactItems = (navigation: any) => [
  {
    icon: 'mail-outline',
    label: 'Nous contacter par email',
    sub: 'support@swapify.app',
    color: Colors.primary,
    onPress: () => Linking.openURL('mailto:support@swapify.app'),
  },
  {
    icon: 'document-text-outline',
    label: 'Conditions d\'utilisation',
    sub: 'Lire nos CGU et politique de confidentialité',
    color: Colors.warning,
    onPress: () => navigation.navigate('Legal'),
  },
  {
    icon: 'logo-instagram',
    label: 'Suivre sur Instagram',
    sub: '@swapify.app',
    color: '#E1306C',
    onPress: () => Linking.openURL('https://instagram.com/swapify.app'),
  },
  {
    icon: 'globe-outline',
    label: 'Site web',
    sub: 'swapify.app',
    color: Colors.accent,
    onPress: () => Linking.openURL('https://swapify.app'),
  },
];

export const HelpScreen = ({ navigation }: any) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const CONTACT_ITEMS = getContactItems(navigation);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Aide & Support</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🤝</Text>
          <Text style={styles.heroTitle}>Comment pouvons-nous t'aider ?</Text>
          <Text style={styles.heroSub}>Retrouve toutes les réponses à tes questions ci-dessous.</Text>
        </View>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>Questions fréquentes</Text>
        <View style={styles.faqContainer}>
          {FAQ.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.faqItem, i === FAQ.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => setOpenIndex(openIndex === i ? null : i)}
              activeOpacity={0.7}
            >
              <View style={styles.faqQuestion}>
                <Text style={styles.faqQ}>{item.q}</Text>
                <Ionicons
                  name={openIndex === i ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={Colors.textMuted}
                />
              </View>
              {openIndex === i && (
                <Text style={styles.faqA}>{item.a}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact */}
        <Text style={styles.sectionTitle}>Nous contacter</Text>
        <View style={styles.contactContainer}>
          {CONTACT_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.contactItem, i === CONTACT_ITEMS.length - 1 && { borderBottomWidth: 0 }]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIcon, { backgroundColor: item.color + '22' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>{item.label}</Text>
                <Text style={styles.contactSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Version */}
        <Text style={styles.version}>Swapify v1.0.0 — Fait avec ❤️ au Québec</Text>
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
  hero: {
    alignItems: 'center', paddingHorizontal: 32, paddingVertical: 24, gap: 8,
  },
  heroEmoji: { fontSize: 52, marginBottom: 4 },
  heroTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  heroSub: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  sectionTitle: {
    color: Colors.text, fontSize: 16, fontWeight: '700',
    marginHorizontal: 20, marginBottom: 12, marginTop: 8,
  },
  faqContainer: {
    backgroundColor: Colors.surface, marginHorizontal: 20, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 24, overflow: 'hidden',
  },
  faqItem: {
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  faqQuestion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  faqQ: { color: Colors.text, fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 },
  faqA: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 12 },
  contactContainer: {
    backgroundColor: Colors.surface, marginHorizontal: 20, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 24, overflow: 'hidden',
  },
  contactItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12,
  },
  contactIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  contactInfo: { flex: 1 },
  contactLabel: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  contactSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  version: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8 },
});
