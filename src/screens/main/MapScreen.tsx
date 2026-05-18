import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { getNearbyUsers, seedDemoUsers } from '../../services/users';

export const MapScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [location, setLocation] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      }

      // Load real members from Firestore
      if (user?.uid) {
        await seedDemoUsers();
        const result = await getNearbyUsers(user.uid);
        // Only show members who have a location set
        const withLocation = result.filter(m => m.location?.latitude);
        setMembers(withLocation);
      }
      setLoading(false);
    })();
  }, [user?.uid]);

  const region = location
    ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.03, longitudeDelta: 0.03 }
    : { latitude: 45.508, longitude: -73.565, latitudeDelta: 0.03, longitudeDelta: 0.03 };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <MapView
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          region={region}
          showsUserLocation
          showsMyLocationButton={false}
          customMapStyle={darkMapStyle}
        >
          {members.map(member => (
            <Marker
              key={member.id}
              coordinate={{
                latitude: member.location.latitude,
                longitude: member.location.longitude,
              }}
              onPress={() => setSelected(member)}
            >
              <View style={[styles.markerContainer, selected?.id === member.id && styles.markerSelected]}>
                <Text style={styles.markerEmoji}>{member.avatar || '🧑'}</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      {/* Header overlay */}
      <SafeAreaView edges={['top']} style={styles.headerOverlay}>
        <View style={styles.headerCard}>
          <Ionicons name="map-outline" size={18} color={Colors.primary} />
          <Text style={styles.headerText}>Membres autour de toi</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{members.length}</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Selected member card */}
      {selected && (
        <View style={styles.selectedCard}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
            <Ionicons name="close" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.selectedEmoji}>{selected.avatar || '🧑'}</Text>

          <View style={styles.selectedInfo}>
            <View style={styles.selectedNameRow}>
              <Text style={styles.selectedName}>{selected.name}</Text>
              {selected.isVerified && (
                <Ionicons name="checkmark-circle" size={14} color={Colors.accent} />
              )}
            </View>
            <Text style={styles.selectedSkill}>
              🎓 {selected.skillsOffered?.[0] || 'Compétence à définir'}
            </Text>
            {selected.rating > 0 && (
              <Text style={styles.selectedRating}>
                ⭐ {selected.rating} ({selected.reviewCount} avis)
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => navigation.navigate('ExchangeDetail', { provider: selected })}
          >
            <Ionicons name="swap-horizontal" size={14} color={Colors.white} />
            <Text style={styles.contactBtnText}>Échanger</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty state */}
      {!loading && members.length === 0 && (
        <View style={styles.emptyOverlay}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📍</Text>
            <Text style={styles.emptyText}>Aucun membre localisé</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingOverlay: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  headerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface + 'EE',
    marginHorizontal: 20, marginTop: 8, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.border, gap: 8,
  },
  headerText: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '600' },
  countBadge: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  countText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  markerContainer: {
    backgroundColor: Colors.surface, borderRadius: 22,
    padding: 6, borderWidth: 2, borderColor: Colors.primary,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  markerSelected: { borderColor: Colors.accent, transform: [{ scale: 1.15 }] },
  markerEmoji: { fontSize: 22 },
  selectedCard: {
    position: 'absolute', bottom: 32, left: 20, right: 20,
    backgroundColor: Colors.surface, borderRadius: 20,
    padding: 16, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  closeBtn: { position: 'absolute', top: 12, right: 12, zIndex: 1 },
  selectedEmoji: { fontSize: 40 },
  selectedInfo: { flex: 1 },
  selectedNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  selectedName: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  selectedSkill: { color: Colors.textSecondary, fontSize: 13, marginBottom: 2 },
  selectedRating: { color: Colors.textMuted, fontSize: 12 },
  contactBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  contactBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  emptyOverlay: {
    position: 'absolute', bottom: 32, left: 20, right: 20,
  },
  emptyCard: {
    backgroundColor: Colors.surface + 'EE', borderRadius: 16,
    padding: 20, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  emptyEmoji: { fontSize: 32, marginBottom: 8 },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
});

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1E293B' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94A3B8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0F172A' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#3D5068' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0F172A' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];
