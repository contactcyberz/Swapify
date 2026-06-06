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
    subtitle: 'Trouve des membres près de chez toi à Montreal',
