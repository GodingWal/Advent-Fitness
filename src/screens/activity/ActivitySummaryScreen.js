import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Switch } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import PrimaryButton from '../../components/PrimaryButton';
import { useApp } from '../../state/AppContext';
import { applyPrivacyZone } from '../../services/location';
import { colors, spacing, radius, typography, shadows } from '../../theme';

function formatDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

export default function ActivitySummaryScreen({ navigation, route }) {
  const { activity, durationSec = 0, distanceMi = 0, coordinates = [] } = route?.params || {};
  const { addRecordedRoute, addFeedPost, settings, user } = useApp();
  const [shareToFriends, setShareToFriends] = useState(true);
  const [caption, setCaption] = useState('');

  const cleanCoords = useMemo(
    () => applyPrivacyZone(coordinates, settings.privacyZone),
    [coordinates, settings.privacyZone]
  );

  const region = useMemo(() => {
    if (!cleanCoords.length) return null;
    const lats = cleanCoords.map((c) => c.latitude);
    const lons = cleanCoords.map((c) => c.longitude);
    const latMin = Math.min(...lats);
    const latMax = Math.max(...lats);
    const lonMin = Math.min(...lons);
    const lonMax = Math.max(...lons);
    return {
      latitude: (latMin + latMax) / 2,
      longitude: (lonMin + lonMax) / 2,
      latitudeDelta: Math.max(0.01, (latMax - latMin) * 1.4),
      longitudeDelta: Math.max(0.01, (lonMax - lonMin) * 1.4),
    };
  }, [cleanCoords]);

  const save = () => {
    addRecordedRoute({
      id: `route_${Date.now()}`,
      type: activity?.type || 'surfing',
      title: activity?.title || 'Activity',
      distanceMi,
      durationSec,
      coordinates: cleanCoords,
      when: 'Just now',
    });
    if (shareToFriends) {
      addFeedPost({
        id: `mp_${Date.now()}`,
        user: { id: 'me', shortName: 'You', avatar: user.avatar },
        action: `${activity?.type || 'activity'} for`,
        quantity: distanceMi > 0 ? `${distanceMi.toFixed(1)} mi` : formatDuration(durationSec),
        location: caption.trim(),
        when: 'Just now',
        section: 'Earlier Today',
        photos: activity?.image ? [activity.image] : [],
        likes: 0,
        likedByMe: false,
        comments: 0,
      });
    }
    navigation.navigate('Main');
  };

  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="Activity Summary" bordered />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.h1}>Nice work!</Text>
        <Text style={styles.sub}>{activity?.title || 'Activity'} complete.</Text>

        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatDuration(durationSec)}</Text>
            <Text style={styles.statLabel}>DURATION</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{distanceMi.toFixed(2)}</Text>
            <Text style={styles.statLabel}>MILES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {distanceMi > 0 ? Math.round((distanceMi * 110) + (durationSec / 60) * 6) : Math.round((durationSec / 60) * 5)}
            </Text>
            <Text style={styles.statLabel}>CAL EST</Text>
          </View>
        </View>

        {region ? (
          <View style={styles.mapCard}>
            <MapView
              style={StyleSheet.absoluteFill}
              provider={PROVIDER_GOOGLE}
              initialRegion={region}
              scrollEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              zoomEnabled={false}
            >
              <Polyline coordinates={cleanCoords} strokeColor={colors.accent} strokeWidth={4} />
            </MapView>
            {settings.privacyZone?.enabled ? (
              <View style={styles.privacyBadge}>
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.white} />
                <Text style={styles.privacyText}>Privacy zone applied</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <Ionicons name="location-outline" size={28} color={colors.textMuted} />
            <Text style={styles.placeholder}>No GPS path recorded</Text>
          </View>
        )}

        <Text style={styles.label}>WHERE WERE YOU?</Text>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="e.g. Sunset Cliffs"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <View style={styles.shareRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.shareTitle}>Share with friends</Text>
            <Text style={styles.shareSub}>Post this activity to the friends feed.</Text>
          </View>
          <Switch
            value={shareToFriends}
            onValueChange={setShareToFriends}
            trackColor={{ true: colors.accent }}
          />
        </View>

        <View style={{ marginTop: spacing.l }}>
          <PrimaryButton
            label={shareToFriends ? 'Save & Share' : 'Save'}
            onPress={save}
            style={{ backgroundColor: colors.accent }}
            textStyle={{ color: colors.white }}
          />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Main')} style={styles.discard}>
          <Text style={styles.discardLabel}>Discard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceMuted },
  scroll: { padding: spacing.base, paddingBottom: 80 },
  h1: { ...typography.h1, color: colors.textPrimary, fontWeight: '300' },
  sub: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.l,
    marginTop: spacing.l,
    ...shadows.cardLight,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, color: colors.textPrimary, fontWeight: '500' },
  statLabel: { ...typography.labelCapsSmall, color: colors.textMuted, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: colors.divider },
  mapCard: {
    height: 200,
    borderRadius: radius.l,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginTop: spacing.base,
    ...shadows.cardLight,
  },
  placeholderCard: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.l,
    backgroundColor: colors.surface,
    marginTop: spacing.base,
    ...shadows.cardLight,
  },
  placeholder: { ...typography.bodySmall, color: colors.textMuted, marginTop: spacing.s },
  privacyBadge: {
    position: 'absolute',
    bottom: spacing.s,
    left: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  privacyText: { ...typography.caption, color: colors.white, marginLeft: 4 },
  label: { ...typography.labelCapsSmall, color: colors.textSecondary, marginTop: spacing.l },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingVertical: spacing.m,
    color: colors.textPrimary,
    ...typography.body,
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: radius.l,
    marginTop: spacing.l,
    ...shadows.cardLight,
  },
  shareTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '500' },
  shareSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  discard: { alignItems: 'center', paddingVertical: spacing.l },
  discardLabel: { ...typography.labelCaps, color: colors.textMuted, fontSize: 12 },
});
