import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/colors';
import { loginUser } from '../../services/auth';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      await loginUser(email.trim().toLowerCase(), password);
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>

          {/* Logo & titre */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🔄</Text>
            </View>
            <Text style={styles.title}>Bon retour 👋</Text>
            <Text style={styles.subtitle}>Connecte-toi a ton compte Swapify</Text>
          </Animated.View>

          {/* Formulaire */}
          <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Input
              label="Email"
              placeholder="ton@email.com"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              icon="mail-outline"
              keyboardType="email-address"
            />
            <Input
              label="Mot de passe"
              placeholder="Ton mot de passe"
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              icon="lock-closed-outline"
              isPassword
            />

            {/* Mot de passe oublie */}
            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Mot de passe oublie ?</Text>
            </TouchableOpacity>

            {/* Erreur inline */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </Animated.View>

          {/* Bouton */}
          <Button title="Se connecter" onPress={handleLogin} loading={loading} />

          {/* Lien inscription */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Inscription gratuite</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, flexGrow: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 32 },
  backText: { color: Colors.textSecondary, fontSize: 15 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    background
