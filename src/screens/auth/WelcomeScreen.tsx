import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, StatusBar, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🔄',
    title: 'Echange tes talents',
    subtitle: 'Swapify connecte des personnes qui veulent partager leurs competences. Pas d\'argent — juste du temps.',
    color: Colors.primary,
    bg: 'rgba(99,102,241,0.15)',
    accent: '#6366F1',
  },
  {
    emoji: '⏱️',
    title: '1 heure = 1 heure',
    subtitle: 'Donne 1h de cours de Python, recois 1h de guitare. Le temps de chacun a la meme valeur.',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.15)',
    accent: '#F59E0B',
  },
  {
    emoji: '📍',
    title: 'Autour de toi',
    subtitle: 'Trouve des membres pres de chez toi a Montreal',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.15)',
    accent: '#10B981',
  },
  {
    emoji: '🤝',
    title: 'Rejoins la communaute',
    subtitle: 'Des centaines de Montréalais echangent deja leurs talents. A toi de jouer !',
    color: '#EC4899',
    bg: 'rgba(236,72,153,0.15)',
    accent: '#EC4899',
  },
];

export const WelcomeScreen = ({ navigation }: any) => {
  const [current, setCurrent] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const goTo = (index: number) => {
    if (index < 0 || index >= SLIDES.length) return;
    const dir = index > current ? -1 : 1;
    Animated.sequence([
      Animated.timing(translateX, { toValue: dir * 40, duration: 80, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    setCurrent(index);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -40) goTo(current + 1);
        else if (g.dx > 40) goTo(current - 1);
      },
    })
  ).current;

  const slide = SLIDES[current];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: slide.bg }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.inner} {...panResponder.panHandlers}>
        <Animated.Text style={[styles.emoji, { transform: [{ scale: bounceAnim }] }]}>
          {slide.emoji}
        </Animated.Text>
        <Animated.View style={{ transform: [{ translateX }] }}>
          <Text style={[styles.title, { color: slide.accent }]}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
        </Animated.View>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <View style={[styles.dot, i === current && { backgroundColor: slide.accent, width: 20 }]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: slide.accent }]} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.btnPrimaryText}>Creer un compte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.btnSecondaryText, { color: slide.accent }]}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 80, marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 16, color: '#555', textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', marginTop: 40, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ccc' },
  buttons: { padding: 24, gap: 12 },
  btnPrimary: { padding: 16, borderRadius: 14, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnSecondary: { padding: 16, alignItems: 'center' },
  btnSecondaryText: { fontWeight: '600', fontSize: 16 },
});
