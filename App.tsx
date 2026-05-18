import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from 'react';
import {
  StatusBar, View, Text, StyleSheet, Animated, Easing, Dimensions,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { DesignPickerScreen } from './src/screens/DesignPickerScreen';

// ⚙️  MET À "true" POUR VOIR LE SÉLECTEUR DE DESIGN
const SHOW_DESIGN_PICKER = false;

const { width, height } = Dimensions.get('window');

// ── Custom animated splash screen ─────────────────────────────
const SplashScreenView = ({ onFinish }: { onFinish: () => void }) => {
  // Animations
  const fadeIn     = useRef(new Animated.Value(0)).current;
  const scaleIcon  = useRef(new Animated.Value(0.6)).current;
  const fadeTitle  = useRef(new Animated.Value(0)).current;
  const slideTitle = useRef(new Animated.Value(20)).current;
  const fadeSub    = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0)).current;
  const dotAnim    = useRef(new Animated.Value(0)).current;
  const fadeOut    = useRef(new Animated.Value(1)).current;

  // Pulsing dot animation (loop)
  const dotLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // 1. Fade in background
    Animated.timing(fadeIn, {
      toValue: 1, duration: 300, useNativeDriver: true,
    }).start();

    // 2. Icon scale + ring expansion
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(scaleIcon, {
          toValue: 1, tension: 40, friction: 7, useNativeDriver: true,
        }),
        Animated.timing(ring1Scale, {
          toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(250),
          Animated.timing(ring2Scale, {
            toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    // 3. Title slide up
    Animated.sequence([
      Animated.delay(700),
      Animated.parallel([
        Animated.timing(fadeTitle, {
          toValue: 1, duration: 600, useNativeDriver: true,
        }),
        Animated.timing(slideTitle, {
          toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 4. Subtitle
    Animated.sequence([
      Animated.delay(1100),
      Animated.timing(fadeSub, {
        toValue: 1, duration: 600, useNativeDriver: true,
      }),
    ]).start();

    // 5. Loading dots loop
    Animated.sequence([Animated.delay(1300)]).start(() => {
      dotLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
        ])
      );
      dotLoop.current.start();
    });

    // 6. After 4.5s — fade out and call onFinish
    const timer = setTimeout(() => {
      dotLoop.current?.stop();
      Animated.timing(fadeOut, {
        toValue: 0, duration: 600, useNativeDriver: true,
      }).start(() => onFinish());
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const dot1Opacity = dotAnim.interpolate({ inputRange: [0, 0.33, 1], outputRange: [0.9, 0.3, 0.9] });
  const dot2Opacity = dotAnim.interpolate({ inputRange: [0, 0.5, 1],  outputRange: [0.3, 0.9, 0.3] });
  const dot3Opacity = dotAnim.interpolate({ inputRange: [0, 0.66, 1], outputRange: [0.1, 0.3, 0.9] });

  return (
    <Animated.View style={[styles.splash, { opacity: fadeOut }]}>
      {/* Background glow blobs */}
      <View style={styles.glowBlob1} />
      <View style={styles.glowBlob2} />

      {/* Rings */}
      <Animated.View style={[styles.ring, styles.ring2, {
        transform: [{ scale: ring2Scale }], opacity: ring2Scale.interpolate({ inputRange: [0, 1], outputRange: [0, 0.25] }),
      }]} />
      <Animated.View style={[styles.ring, styles.ring1, {
        transform: [{ scale: ring1Scale }], opacity: ring1Scale.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }),
      }]} />

      {/* Icon circle */}
      <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleIcon }] }]}>
        {/* Swap arrows — top arrow → */}
        <View style={styles.arrowsContainer}>
          <View style={styles.arrowRow}>
            <View style={[styles.arrowLine, { backgroundColor: '#0EA5E9' }]} />
            <View style={[styles.arrowHead, styles.arrowHeadRight, { borderLeftColor: '#0EA5E9' }]} />
          </View>
          {/* Bottom arrow ← */}
          <View style={[styles.arrowRow, { flexDirection: 'row-reverse' }]}>
            <View style={[styles.arrowLine, { backgroundColor: '#38BDF8' }]} />
            <View style={[styles.arrowHead, styles.arrowHeadLeft, { borderRightColor: '#38BDF8' }]} />
          </View>
        </View>
      </Animated.View>

      {/* App name */}
      <Animated.View style={{
        opacity: fadeTitle,
        transform: [{ translateY: slideTitle }],
        flexDirection: 'row', marginTop: 40, alignItems: 'baseline',
      }}>
        <Text style={styles.titleWhite}>Swap</Text>
        <Text style={styles.titlePrimary}>ify</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: fadeSub }]}>
        Échange tes compétences
      </Animated.Text>

      {/* Loading dots */}
      <Animated.View style={[styles.dotsRow, { opacity: fadeSub }]}>
        <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
      </Animated.View>

      {/* Bottom badge */}
      <Animated.Text style={[styles.bottomBadge, { opacity: fadeSub }]}>
        Fait avec ❤️ au Québec
      </Animated.Text>
    </Animated.View>
  );
};

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  // Mode sélecteur de design temporaire
  if (SHOW_DESIGN_PICKER) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#080C18" />
        <DesignPickerScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#040F1E" />
      {!splashDone && (
        <SplashScreenView onFinish={() => setSplashDone(true)} />
      )}
      {/* Render AppNavigator in background so it's ready when splash fades */}
      <View style={{ flex: 1, opacity: splashDone ? 1 : 0 }}>
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}

// ── Styles ────────────────────────────────────────────────────
const ICON_SIZE = 140;
const RING1 = ICON_SIZE + 60;
const RING2 = ICON_SIZE + 120;

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#040F1E',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },

  // Glow background blobs
  glowBlob1: {
    position: 'absolute',
    width: 380, height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(14,165,233,0.12)',
    top: height * 0.25, left: -60,
  },
  glowBlob2: {
    position: 'absolute',
    width: 300, height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(56,189,248,0.08)',
    top: height * 0.35, right: -50,
  },

  // Rings
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#0EA5E9',
  },
  ring1: { width: RING1, height: RING1 },
  ring2: { width: RING2, height: RING2 },

  // Icon circle
  iconCircle: {
    width: ICON_SIZE, height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(99,102,241,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Swap arrows
  arrowsContainer: { gap: 14, alignItems: 'center' },
  arrowRow: {
    flexDirection: 'row', alignItems: 'center', width: 72,
  },
  arrowLine: { flex: 1, height: 4, borderRadius: 2 },
  arrowHead: {
    width: 0, height: 0,
    borderTopWidth: 7, borderBottomWidth: 7,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
  },
  arrowHeadRight: { borderLeftWidth: 12 },
  arrowHeadLeft:  { borderRightWidth: 12 },

  // Text
  titleWhite: {
    color: '#F8FAFC', fontSize: 48, fontWeight: '800',
    letterSpacing: -1,
  },
  titlePrimary: {
    color: '#0EA5E9', fontSize: 48, fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    color: '#64748B', fontSize: 16, marginTop: 10,
    letterSpacing: 0.5,
  },

  // Loading dots
  dotsRow: {
    flexDirection: 'row', gap: 10, marginTop: 48,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#0EA5E9',
  },

  // Bottom
  bottomBadge: {
    position: 'absolute', bottom: 48,
    color: '#334155', fontSize: 13,
  },
});
