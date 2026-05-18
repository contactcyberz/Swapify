import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_W = width - 40;

// ══════════════════════════════════════════════════════════════
//  THÈMES DISPONIBLES
// ══════════════════════════════════════════════════════════════
const THEMES = [
  {
    id: 'cosmic',
    name: '🌌 Cosmic Purple',
    tag: 'Actuel',
    desc: 'Sombre & mystérieux — violet profond sur bleu nuit',
    bg:       '#0F172A',
    surface:  '#1E293B',
    primary:  '#6366F1',
    accent:   '#10B981',
    text:     '#F8FAFC',
    muted:    '#64748B',
    border:   '#334155',
    gradient: ['#6366F1', '#8B5CF6'],
  },
  {
    id: 'aurora',
    name: '🌠 Aurora Neon',
    tag: 'Tendance 2026',
    desc: 'Ultra moderne — violet + cyan sur noir profond',
    bg:       '#080B14',
    surface:  '#10142A',
    primary:  '#A855F7',
    accent:   '#06B6D4',
    text:     '#F0F4FF',
    muted:    '#5B6584',
    border:   '#1E2547',
    gradient: ['#A855F7', '#06B6D4'],
  },
  {
    id: 'sunset',
    name: '🌅 Sunset Fire',
    tag: 'Chaud & Énergique',
    desc: 'Chaleureux & dynamique — orange vif sur noir charbon',
    bg:       '#0D0A08',
    surface:  '#1C1510',
    primary:  '#F97316',
    accent:   '#FBBF24',
    text:     '#FFF7ED',
    muted:    '#78716C',
    border:   '#292219',
    gradient: ['#F97316', '#EF4444'],
  },
  {
    id: 'ocean',
    name: '🌊 Deep Ocean',
    tag: 'Pro & Épuré',
    desc: 'Confiance & clarté — bleu ciel sur bleu nuit profond',
    bg:       '#040F1E',
    surface:  '#091A30',
    primary:  '#0EA5E9',
    accent:   '#38BDF8',
    text:     '#E0F2FE',
    muted:    '#4B6A8A',
    border:   '#0F2744',
    gradient: ['#0EA5E9', '#6366F1'],
  },
  {
    id: 'rose',
    name: '🌸 Rose Luxe',
    tag: 'Élégant & Premium',
    desc: 'Raffiné & premium — rose vif sur bordeaux sombre',
    bg:       '#120810',
    surface:  '#1F0D1A',
    primary:  '#F43F5E',
    accent:   '#FB923C',
    text:     '#FFF0F3',
    muted:    '#7A4A5A',
    border:   '#2D1022',
    gradient: ['#F43F5E', '#A855F7'],
  },
  {
    id: 'forest',
    name: '🌿 Forest Neo',
    tag: 'Naturel & Fresh',
    desc: 'Frais & organique — vert émeraude sur ardoise sombre',
    bg:       '#070F0A',
    surface:  '#0D1F14',
    primary:  '#22C55E',
    accent:   '#84CC16',
    text:     '#F0FFF4',
    muted:    '#4A7A5A',
    border:   '#122A1A',
    gradient: ['#22C55E', '#0EA5E9'],
  },
  {
    id: 'midnight',
    name: '🖤 Midnight Gold',
    tag: 'Luxe absolu',
    desc: 'Sobre & luxueux — or sur noir absolu, style haute couture',
    bg:       '#050505',
    surface:  '#111111',
    primary:  '#D4AF37',
    accent:   '#F59E0B',
    text:     '#FFFDF5',
    muted:    '#666655',
    border:   '#222211',
    gradient: ['#D4AF37', '#F59E0B'],
  },
];

// ══════════════════════════════════════════════════════════════
//  MINI PREVIEW CARD — reproduit l'app en miniature
// ══════════════════════════════════════════════════════════════
const MiniPreview = ({ theme }: { theme: typeof THEMES[0] }) => {
  const t = theme;
  return (
    <View style={[styles.preview, { backgroundColor: t.bg }]}>

      {/* Mini header */}
      <View style={[styles.pHeader, { backgroundColor: t.surface, borderBottomColor: t.border }]}>
        <View style={[styles.pDot, { backgroundColor: t.muted }]} />
        <View style={[styles.pBar, { backgroundColor: t.muted, width: 60 }]} />
        <View style={[styles.pAvatar, { backgroundColor: t.primary + '33', borderColor: t.primary + '55' }]}>
          <Text style={{ fontSize: 10 }}>🔔</Text>
        </View>
      </View>

      {/* Mini stat bar */}
      <View style={[styles.pStatBar, { backgroundColor: t.surface, borderColor: t.border }]}>
        {['0h', '24', '→'].map((v, i) => (
          <View key={i} style={styles.pStat}>
            <Text style={[styles.pStatVal, { color: i === 2 ? t.primary : t.text }]}>{v}</Text>
            <View style={[styles.pBar, { backgroundColor: t.muted, width: 28, marginTop: 2 }]} />
          </View>
        ))}
      </View>

      {/* Mini category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pChipsRow}>
        {['Tout', 'Tech', 'Musique', 'Sport'].map((c, i) => (
          <View key={i} style={[
            styles.pChip,
            { backgroundColor: i === 0 ? t.primary + '22' : t.surface,
              borderColor: i === 0 ? t.primary : t.border }
          ]}>
            <Text style={[styles.pChipText, { color: i === 0 ? t.primary : t.muted }]}>{c}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Mini user card 1 */}
      <View style={[styles.pCard, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Text style={{ fontSize: 18, marginRight: 6 }}>👩</Text>
        <View style={{ flex: 1 }}>
          <View style={styles.pCardRow}>
            <Text style={[styles.pCardName, { color: t.text }]}>Sara M.</Text>
            <View style={[styles.pBadge, { backgroundColor: t.accent + '22' }]}>
              <Text style={[styles.pBadgeText, { color: t.accent }]}>⭐ 4.9</Text>
            </View>
          </View>
          <View style={[styles.pExRow, { backgroundColor: t.bg }]}>
            <Text style={[styles.pSkill, { color: t.text }]}>Guitare</Text>
            <View style={[styles.pSwapBtn, { backgroundColor: t.primary + '22' }]}>
              <Text style={{ color: t.primary, fontSize: 9 }}>⇄</Text>
            </View>
            <Text style={[styles.pSkill, { color: t.text }]}>Python</Text>
          </View>
        </View>
      </View>

      {/* Mini user card 2 */}
      <View style={[styles.pCard, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Text style={{ fontSize: 18, marginRight: 6 }}>🧔</Text>
        <View style={{ flex: 1 }}>
          <View style={styles.pCardRow}>
            <Text style={[styles.pCardName, { color: t.text }]}>Marc D.</Text>
            <View style={[styles.pBadge, { backgroundColor: t.primary + '22' }]}>
              <Text style={[styles.pBadgeText, { color: t.primary }]}>● En ligne</Text>
            </View>
          </View>
          <View style={[styles.pExRow, { backgroundColor: t.bg }]}>
            <Text style={[styles.pSkill, { color: t.text }]}>Piano</Text>
            <View style={[styles.pSwapBtn, { backgroundColor: t.primary + '22' }]}>
              <Text style={{ color: t.primary, fontSize: 9 }}>⇄</Text>
            </View>
            <Text style={[styles.pSkill, { color: t.text }]}>Yoga</Text>
          </View>
        </View>
      </View>

      {/* Mini tab bar */}
      <View style={[styles.pTabBar, { backgroundColor: t.surface, borderTopColor: t.border }]}>
        {['🏠', '🔍', '🗺️', '💬', '👤'].map((icon, i) => (
          <View key={i} style={styles.pTab}>
            <Text style={{ fontSize: 12 }}>{icon}</Text>
            {i === 0 && <View style={[styles.pTabDot, { backgroundColor: t.primary }]} />}
          </View>
        ))}
      </View>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════
//  ÉCRAN PRINCIPAL
// ══════════════════════════════════════════════════════════════
export const DesignPickerScreen = ({ navigation, onSelect }: any) => {
  const [selected, setSelected] = useState('cosmic');

  const handleChoose = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId)!;
    Alert.alert(
      `✅ ${theme.name}`,
      `Tu as choisi le thème "${theme.name}".\n\nDis-le moi et je vais appliquer ce design dans toute l'app immédiatement !`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        {navigation && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1, marginLeft: navigation ? 12 : 0 }}>
          <Text style={styles.headerTitle}>Choisis ton design</Text>
          <Text style={styles.headerSub}>7 thèmes modernes — tous testés sur mobile</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {THEMES.map((theme) => {
          const isSelected = selected === theme.id;
          return (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeCard,
                isSelected && { borderColor: theme.primary, borderWidth: 2 },
              ]}
              onPress={() => setSelected(theme.id)}
              activeOpacity={0.85}
            >
              {/* Top info */}
              <View style={styles.themeHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.themeNameRow}>
                    <Text style={styles.themeName}>{theme.name}</Text>
                    <View style={[styles.tagBadge, { backgroundColor: theme.primary + '25',
                      borderColor: theme.primary + '50' }]}>
                      <Text style={[styles.tagText, { color: theme.primary }]}>{theme.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.themeDesc}>{theme.desc}</Text>
                  {/* Color palette dots */}
                  <View style={styles.palette}>
                    {[theme.bg, theme.surface, theme.primary, theme.accent, theme.text].map((c, i) => (
                      <View key={i} style={[styles.paletteDot, { backgroundColor: c,
                        borderWidth: i === 0 || i === 4 ? 1 : 0, borderColor: '#444' }]} />
                    ))}
                    <Text style={styles.paletteLabel}>palette</Text>
                  </View>
                </View>

                {/* Selection indicator */}
                <View style={[
                  styles.selectCircle,
                  isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
              </View>

              {/* Gradient accent bar */}
              <View style={[styles.accentBar, { backgroundColor: theme.gradient[0] }]}>
                <View style={[styles.accentBar2, { backgroundColor: theme.gradient[1], opacity: 0.6 }]} />
              </View>

              {/* App preview */}
              <MiniPreview theme={theme} />

              {/* Choose button */}
              <TouchableOpacity
                style={[styles.chooseBtn, { backgroundColor: theme.primary }]}
                onPress={() => handleChoose(theme.id)}
              >
                <Ionicons name="color-palette-outline" size={16} color="#fff" />
                <Text style={styles.chooseBtnText}>Appliquer ce thème</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ══════════════════════════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080C18' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: '#F8FAFC', fontSize: 22, fontWeight: '800' },
  headerSub:   { color: '#64748B', fontSize: 13, marginTop: 2 },

  list: { paddingHorizontal: 20, gap: 24 },

  // Theme card
  themeCard: {
    backgroundColor: '#111827', borderRadius: 24,
    borderWidth: 1, borderColor: '#1F2937',
    overflow: 'hidden',
  },
  themeHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 16, gap: 12,
  },
  themeNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' },
  themeName:    { color: '#F8FAFC', fontSize: 17, fontWeight: '800' },
  tagBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1,
  },
  tagText: { fontSize: 10, fontWeight: '700' },
  themeDesc: { color: '#94A3B8', fontSize: 12, lineHeight: 18, marginBottom: 10 },

  palette: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paletteDot: { width: 18, height: 18, borderRadius: 9 },
  paletteLabel: { color: '#475569', fontSize: 10, marginLeft: 2 },

  selectCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: '#334155',
    alignItems: 'center', justifyContent: 'center',
  },

  accentBar: { height: 3, marginHorizontal: 16, borderRadius: 2, overflow: 'hidden' },
  accentBar2: { ...StyleSheet.absoluteFillObject },

  // Choose button
  chooseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: 16, borderRadius: 14, paddingVertical: 14,
  },
  chooseBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // ── Mini preview styles ──────────────────────────────────────
  preview: {
    marginHorizontal: 16, marginVertical: 12,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  pHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 8, gap: 8,
    borderBottomWidth: 1,
  },
  pDot:    { width: 24, height: 24, borderRadius: 12, backgroundColor: '#333' },
  pBar:    { height: 6, borderRadius: 3, backgroundColor: '#333' },
  pAvatar: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
             borderWidth: 1, marginLeft: 'auto' },

  pStatBar: {
    flexDirection: 'row', marginHorizontal: 10, marginTop: 8,
    borderRadius: 12, padding: 10, borderWidth: 1,
  },
  pStat:    { flex: 1, alignItems: 'center' },
  pStatVal: { fontSize: 13, fontWeight: '700' },

  pChipsRow: { paddingHorizontal: 10, paddingVertical: 8 },
  pChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16,
    marginRight: 6, borderWidth: 1,
  },
  pChipText: { fontSize: 9, fontWeight: '600' },

  pCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 10, marginBottom: 6,
    borderRadius: 14, padding: 10, borderWidth: 1,
  },
  pCardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  pCardName: { fontSize: 11, fontWeight: '700' },
  pBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  pBadgeText: { fontSize: 8, fontWeight: '600' },
  pExRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5,
  },
  pSkill: { fontSize: 10, fontWeight: '600' },
  pSwapBtn: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  pTabBar: {
    flexDirection: 'row', borderTopWidth: 1,
    paddingVertical: 8,
  },
  pTab: { flex: 1, alignItems: 'center', gap: 2 },
  pTabDot: { width: 4, height: 4, borderRadius: 2 },
});
