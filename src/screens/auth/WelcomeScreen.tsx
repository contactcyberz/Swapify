import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, StatusBar, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🔄',
    title: 'Échange tes talents',
    subtitle: 'Swapify connecte des personnes qui veulent partager leurs compétences. Pas d\'argent — juste du temps.',
    color: Colors.primary,
    bg: 'rgba(99,102,241,0.15)',
    accent: '#6366F1',
  },
  {
    emoji: '⏱️',
    title: '1 heure = 1 heure',
    subtitle: 'Donne 1h de cours de Python, reçois 1h de guitare. Le temps de chacun a la même valeur.',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.15)',
    accent: '#F59E0B',
  },
  {
    emoji: '📍',
    title: 'Autour de toi',
    subtitle: 'Trouve des membres près de chez toi à Montréal. Rencontre-les en vrai ou en ligne.',
    color: Colors.accent,
    bg: 'rgba(16,185,129,0.15)',
    accent: '#10B981',
  },
  {
    emoji: '🤝',
    title: 'Prêt à commencer ?',
    subtitle: 'Crée ton profil, ajoute tes compétences et propose ton premier échange dès aujourd\'hui !',
    color: Colors.primary,
    bg: 'rgba(99,102,241,0.15)',
    accent: '#6366F1',
  },
];

export const WelcomeScreen = ({ navigation }: any) => {
  const [current, setCurrent] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startBounce();
  }, [current]);

  const startBounce = () => {
    bounceAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -12, duration: 1200, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  };

  const animateTransition = (nextIndex: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setCurrent(nextIndex);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]).start();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -50 && current < SLIDES.length - 1) animateTransition(current + 1);
        if (g.dx > 50 && current > 0) animateTransition(current - 1);
      },
    })
  ).current;

  const goNext = () => {
    if (current < SLIDES.length - 1) animateTransition(current + 1);
  };

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Background blob */}
      <Animated.View style={[styles.bgBlob, { backgroundColor: slide.bg }]} />

      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      )}

      {/* Slide content */}
      <View style={styles.content} {...panResponder.panHandlers}>
        <Animated.View style={[styles.emojiWrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY: bounceAnim }] }]}>
          <View style={[styles.emojiCard, { shadowColor: slide.accent }]}>
            <View style={[styles.emojiInner, { backgroundColor: slide.bg }]}>
              <Text style={styles.emoji}>{slide.emoji}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.textBox, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.slideTitle, { color: slide.color }]}>{slide.title}</Text>
          <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
        </Animated.View>
      </View>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <TouchableOpacity key={i} onPress={() => animateTransition(i)}>
            <Animated.View style={[styles.dot, { backgroundColor: i === current ? slide.color : Colors.border, width: i === current ? 28 : 8 }]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        {isLast ? (
          <>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: slide.color }]} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.primaryBtnText}>Créer mon compte gratuit</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.secondaryBtnText}>J'ai déjà un compte</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: slide.color }]} onPress={goNext}>
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
  bgBlob: {
    position: 'absolute', top: -100, width: width * 1.5, height: width * 1.5,
    borderRadius: width * 0.75, opacity: 0.6,
  },
  skipBtn: { alignSelf: 'flex-end', paddingHorizontal: 24, paddingTop: 8 },
  skipText: { color: Colors.textMuted, fontSize: 15 },
  content: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 36 },
  emojiWrapper: { alignItems: 'center', justifyContent: 'center' },
  emojiCard: {
    width: 180, height: 180, borderRadius: 48,
    backgroundColor: Colors.surface,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25, shadowRadius: 24, elevation: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  emojiInner: { width: 160, height: 160, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 80 },
  textBox: { alignItems: 'center', gap: 14 },
  slideTitle: { fontSize: 34, fontWeight: '900', textAlign: 'center', letterSpacing: -0.5 },
  slideSubtitle: { color: Colors.textSecondary, fontSize: 17, textAlign: 'center', lineHeight: 27 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 28 },
  dot: { height: 8, borderRadius: 4 },
  buttons: { width: '100%', paddingHorizontal: 24, paddingBottom: 16, gap: 12 },
  primaryBtn: {
    borderRadius: 18, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  primaryBtnText: { color: Colors.white, fontSize: 17, fontWeight: '800' },
  secondaryBtn: { alignItems: 'center', paddingVertical: 10 },
  secondaryBtnText: { color: Colors.textMuted, fontSize: 15 },
});
