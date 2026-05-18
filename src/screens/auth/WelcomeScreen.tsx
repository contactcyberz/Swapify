import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🔄',
    title: 'Échange tes talents',
    subtitle: 'Swapify connecte des personnes qui veulent partager leurs compétences. Pas d\'argent — juste du temps.',
    color: Colors.primary,
    bg: 'rgba(99,102,241,0.12)',
  },
  {
    emoji: '⏱️',
    title: '1 heure = 1 heure',
    subtitle: 'Donne 1h de cours de Python, reçois 1h de guitare. Le temps de chacun a la même valeur.',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
  },
  {
    emoji: '📍',
    title: 'Autour de toi',
    subtitle: 'Trouve des membres près de chez toi à Montréal. Rencontre-les en vrai ou en ligne.',
    color: Colors.accent,
    bg: 'rgba(16,185,129,0.12)',
  },
  {
    emoji: '🤝',
    title: 'Prêt à commencer ?',
    subtitle: 'Crée ton profil, ajoute tes compétences et propose ton premier échange dès aujourd\'hui !',
    color: Colors.primary,
    bg: 'rgba(99,102,241,0.12)',
  },
];

export const WelcomeScreen = ({ navigation }: any) => {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    animateIn();
  }, [current]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    scaleAnim.setValue(0.8);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();
  };

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      const next = current + 1;
      setCurrent(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }
  };

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <Animated.View
              style={[
                styles.emojiContainer,
                { backgroundColor: s.bg },
                i === current && {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Text style={styles.emoji}>{s.emoji}</Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.textContainer,
                i === current && {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={[styles.slideTitle, { color: s.color }]}>{s.title}</Text>
              <Text style={styles.slideSubtitle}>{s.subtitle}</Text>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === current ? slide.color : Colors.border,
                width: i === current ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        {isLast ? (
          <>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: slide.color }]}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.primaryBtnText}>Créer mon compte gratuit</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.secondaryBtnText}>J'ai déjà un compte</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: slide.color }]}
            onPress={goNext}
          >
            <Text style={styles.primaryBtnText}>Suivant</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center' },
  skipBtn: { alignSelf: 'flex-end', paddingHorizontal: 24, paddingTop: 8 },
  skipText: { color: Colors.textMuted, fontSize: 15 },
  scroll: { flex: 1, width: '100%' },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 28 },
  emojiContainer: {
    width: 160, height: 160, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  emoji: { fontSize: 72 },
  textContainer: { alignItems: 'center', gap: 14 },
  slideTitle: { fontSize: 32, fontWeight: '900', textAlign: 'center' },
  slideSubtitle: { color: Colors.textSecondary, fontSize: 17, textAlign: 'center', lineHeight: 26 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 28 },
  dot: { height: 8, borderRadius: 4 },
  buttons: { width: '100%', paddingHorizontal: 24, paddingBottom: 16, gap: 12 },
  primaryBtn: {
    borderRadius: 16, paddingVertical: 17,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  primaryBtnText: { color: Colors.white, fontSize: 17, fontWeight: '800' },
  secondaryBtn: { alignItems: 'center', paddingVertical: 10 },
  secondaryBtnText: { color: Colors.textMuted, fontSize: 15 },
});
