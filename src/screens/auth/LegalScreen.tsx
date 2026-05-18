import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { TERMS_OF_SERVICE, PRIVACY_POLICY, LEGAL_DATE } from '../../constants/legal';

type Tab = 'terms' | 'privacy';

interface Props {
  navigation: any;
  route?: { params?: { onAccept?: () => void } };
}

export const LegalScreen = ({ navigation, route }: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>('terms');
  const scrollRef = useRef<ScrollView>(null);

  const content = activeTab === 'terms' ? TERMS_OF_SERVICE : PRIVACY_POLICY;
  const title = activeTab === 'terms' ? 'Conditions d\'utilisation' : 'Politique de confidentialité';

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'terms' && styles.tabActive]}
          onPress={() => switchTab('terms')}
        >
          <Ionicons
            name="document-text-outline"
            size={15}
            color={activeTab === 'terms' ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>
            Conditions d'utilisation
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.tabActive]}
          onPress={() => switchTab('privacy')}
        >
          <Ionicons
            name="shield-outline"
            size={15}
            color={activeTab === 'privacy' ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>
            Confidentialité
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info badge */}
      <View style={styles.infoBadge}>
        <Ionicons name="checkmark-circle" size={14} color={Colors.accent} />
        <Text style={styles.infoText}>
          Conforme à la Loi 25 (Québec) · Mise à jour : {LEGAL_DATE}
        </Text>
      </View>

      {/* Scrollable content */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        scrollIndicatorInsets={{ right: 1 }}
      >
        <Text style={styles.legalText}>{content.trim()}</Text>
        <View style={styles.scrollPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  tabs: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 12,
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, padding: 4,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 9, borderRadius: 10, gap: 6,
  },
  tabActive: { backgroundColor: Colors.primaryTransparent },
  tabText: { color: Colors.textMuted, fontSize: 12, fontWeight: '500' },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  infoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: Colors.accent + '15', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.accent + '30',
  },
  infoText: { color: Colors.accent, fontSize: 11, fontWeight: '600', flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  legalText: {
    color: Colors.textSecondary, fontSize: 13, lineHeight: 22,
    fontFamily: 'System',
  },
  scrollPadding: { height: 40 },
});
