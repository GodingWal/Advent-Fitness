import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import ElevationChart from '../../components/ElevationChart';
import POIMarker from '../../components/POIMarker';
import { useApp } from '../../state/AppContext';
import { friends } from '../../data/mockFriends';
import { colors, spacing, radius, typography } from '../../theme';

const ELEVATION_PROFILES = {
  trails: [120, 140, 220, 280, 340, 410, 380, 290, 240, 320, 380, 300, 220, 180, 150],
  gyms: null,
  basketball: [10, 12, 10, 8, 11, 9, 10],
  tennis: [10, 9, 11, 10, 12, 9, 10],
  pickleball: [8, 9, 8, 10, 9, 8, 9],
  yoga: null,
  pools: [0, 0, 0],
  skate: [12, 14, 18, 16, 12, 10, 8],
};

const META_BY_CATEGORY = {
  trails: { lengthMi: 3.4, difficulty: 'Moderate', surface: 'Dirt + sand', elevationGainFt: 410 },
  gyms: {
    hours: 'Mon–Fri 5am–11pm · Sat–Sun 7am–9pm',
    amenities: 'Free weights · Cardio · Showers',
  },
  basketball: { courts: 4, surface: 'Asphalt', lights: 'Yes' },
  tennis: { courts: 6, surface: 'Hard', lights: 'Yes' },
  pickleball: { courts: 8, surface: 'Hard', lights: 'Yes' },
  yoga: { classes: 'Daily · 6am–9pm', styles: 'Hot · Vinyasa · Yin' },
  pools: { laps: '25 yards', heated: 'Yes' },
  skate: { features: 'Bowls · Rails · Ledges', lights: 'No' },
};

const RECENT_FRIENDS = [friends[0], friends[1], friends[4]];

export default function TrailDetailScreen({ navigation, route }) {
  const { poi } = route?.params || {};
  const { isSpotSaved, toggleSpot } = useApp();

  if (!poi) {
    return (
      <View style={styles.container}>
        <HeaderBar onBack={() => navigation.goBack()} title="DETAILS" />
      </View>
    );
  }

  const profile = ELEVATION_PROFILES[poi.category];
  const meta = META_BY_CATEGORY[poi.category] || {};
  const saved = isSpotSaved(poi.id);

  const openDirections = () => {
    const { latitude, longitude } = poi.coordinate;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        onBack={() => navigation.goBack()}
        title="DETAILS"
        rightIcon={saved ? 'heart' : 'heart-outline'}
        onRight={() => toggleSpot(poi)}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {poi.photo ? <Image source={{ uri: poi.photo }} style={styles.hero} /> : null}

        <View style={styles.body}>
          <Text style={styles.name}>{poi.name}</Text>
          <Text style={styles.address}>{poi.address}</Text>

          <View style={styles.metaRow}>
            {poi.rating ? (
              <View style={styles.metaPill}>
                <Ionicons name="star" size={13} color="#F4B400" />
                <Text style={styles.metaPillText}>{poi.rating.toFixed(1)}</Text>
              </View>
            ) : null}
            {poi.distanceMi != null ? (
              <View style={styles.metaPill}>
                <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.metaPillText}>{poi.distanceMi.toFixed(1)} mi away</Text>
              </View>
            ) : null}
            {poi.userSubmitted ? (
              <View style={[styles.metaPill, { borderColor: colors.accent }]}>
                <Ionicons name="person-add-outline" size={13} color={colors.accent} />
                <Text style={[styles.metaPillText, { color: colors.accent }]}>Community</Text>
              </View>
            ) : null}
          </View>

          {Object.keys(meta).length > 0 ? (
            <View style={styles.statsCard}>
              {Object.entries(meta).map(([k, v]) => (
                <View key={k} style={styles.statRow}>
                  <Text style={styles.statKey}>{prettyKey(k)}</Text>
                  <Text style={styles.statVal}>{String(v)}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {profile ? (
            <View style={styles.section}>
              <ElevationChart profile={profile} width={320} height={120} />
            </View>
          ) : null}

          <View style={styles.mapCard}>
            <MapView
              style={StyleSheet.absoluteFill}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                ...poi.coordinate,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={poi.coordinate}>
                <POIMarker category={poi.category} />
              </Marker>
            </MapView>
          </View>

          <Text style={styles.sectionTitle}>{`Friends who've been here`}</Text>
          <View style={styles.friendsRow}>
            {RECENT_FRIENDS.map((f) => (
              <View key={f.id} style={styles.friend}>
                <Image source={{ uri: f.avatar }} style={styles.friendAvatar} />
                <Text style={styles.friendName}>{f.shortName}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.primary]}
              onPress={() =>
                navigation.replace('ActivityTracking', {
                  activity: {
                    title: poi.name,
                    type: poi.category === 'trails' ? 'hiking' : 'running',
                    image: poi.photo,
                  },
                })
              }
            >
              <Ionicons name="play" size={16} color="#0A0C10" />
              <Text style={styles.primaryLabel}>Start Activity</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={openDirections}>
              <Ionicons name="navigate-outline" size={16} color={colors.text} />
              <Text style={styles.actionLabel}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function prettyKey(k) {
  return k
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .replace('Mi', '(mi)')
    .replace('Ft', '(ft)');
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 80 },
  hero: { width: '100%', height: 220 },
  body: { padding: spacing.edge },
  name: { ...typography.h2, color: colors.text },
  address: { ...typography.body, fontSize: 13, color: colors.textMute, marginTop: 2 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.m },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    paddingHorizontal: spacing.m,
    paddingVertical: 6,
    marginRight: spacing.s,
    marginTop: spacing.s,
  },
  metaPillText: {
    ...typography.mono,
    fontSize: 11,
    color: colors.text,
    marginLeft: 4,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    padding: spacing.base,
    marginTop: spacing.l,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  statKey: { ...typography.bodySmall, fontSize: 12, color: colors.textMute },
  statVal: {
    ...typography.mono,
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    padding: spacing.base,
    marginTop: spacing.l,
  },
  mapCard: {
    height: 160,
    borderRadius: radius.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.lineSoft,
    marginTop: spacing.l,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    color: colors.text,
    marginTop: spacing.l,
  },
  friendsRow: { flexDirection: 'row', marginTop: spacing.m },
  friend: { alignItems: 'center', marginRight: spacing.l },
  friendAvatar: { width: 48, height: 48, borderRadius: radius.s },
  friendName: { ...typography.mono, fontSize: 10, color: colors.textMute, marginTop: 4 },
  actions: { flexDirection: 'row', marginTop: spacing.l },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.line,
    marginHorizontal: 4,
  },
  primary: { backgroundColor: colors.accent, borderColor: colors.accent },
  primaryLabel: {
    ...typography.caps,
    fontSize: 12,
    color: '#0A0C10',
    fontWeight: '700',
    marginLeft: 6,
  },
  actionLabel: { ...typography.caps, fontSize: 12, color: colors.text, marginLeft: 6 },
});
