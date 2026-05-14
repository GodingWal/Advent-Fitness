import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import PrimaryButton from '../../components/PrimaryButton';
import { Caps, Mono } from '../../components/VoltPrimitives';
import { useApp } from '../../state/AppContext';
import { applyPrivacyZone } from '../../services/location';
import { colors, spacing, radius, typography } from '../../theme';

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

  const kcal =
    distanceMi > 0
      ? Math.round(distanceMi * 110 + (durationSec / 60) * 6)
      : Math.round((durationSec / 60) * 5);

  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="SUMMARY" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Caps size={10} color={colors.textMute}>
          {activity?.title || 'Activity'} complete
        </Caps>
        <Text style={styles.h1}>
          Nice <Text style={{ color: colors.accent }}>work.</Text>
        </Text>

        <View style={styles.statsCard}>
          <SummaryStat label="Duration" value={formatDuration(durationSec)} />
          <View style={styles.statDivider} />
          <SummaryStat label="Miles" value={distanceMi.toFixed(2)} />
          <View style={styles.statDivider} />
          <SummaryStat label="Cal Est" value={`${kcal}`} />
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
                <Ionicons name="shield-checkmark-outline" size={12} color={colors.text} />
                <Caps size={9} color={colors.text} style={{ marginLeft: 4 }}>
                  Privacy zone applied
                </Caps>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <Ionicons name="location-outline" size={22} color={colors.textMute} />
            <Caps size={10} color={colors.textMute} style={{ marginTop: 8 }}>
              No GPS path recorded
            </Caps>
          </View>
        )}

        <Caps size={9} color={colors.textMute} style={styles.label}>
          Where were you?
        </Caps>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="e.g. Sunset Cliffs"
          placeholderTextColor={colors.textDim}
          style={styles.input}
        />

        <View style={styles.shareRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.shareTitle}>Share with friends</Text>
            <Mono size={11}>Post to the friends feed</Mono>
          </View>
          <Switch
            value={shareToFriends}
            onValueChange={setShareToFriends}
            trackColor={{ true: colors.accent, false: colors.line }}
            thumbColor="#0A0C10"
          />
        </View>

        <View style={{ marginTop: spacing.l }}>
          <PrimaryButton
            label={shareToFriends ? 'Save & Share' : 'Save'}
            trailingIcon="checkmark"
            onPress={save}
          />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Main')} style={styles.discard}>
          <Caps size={10} color={colors.textDim}>
            Discard
          </Caps>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function SummaryStat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Caps size={9} color={colors.textMute}>
        {label}
      </Caps>
      <Mono size={22} color={colors.text} weight="500" style={{ marginTop: 6 }}>
        {value}
      </Mono>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.edge, paddingBottom: 80 },
  h1: { ...typography.h1, fontSize: 38, color: colors.text, marginTop: 4 },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    padding: spacing.base,
    marginTop: spacing.l,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: colors.lineSoft },
  mapCard: {
    height: 200,
    borderRadius: radius.l,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    marginTop: spacing.base,
  },
  placeholderCard: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.l,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    marginTop: spacing.base,
  },
  privacyBadge: {
    position: 'absolute',
    bottom: spacing.s,
    left: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,12,16,0.7)',
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: radius.s,
  },
  label: { marginTop: spacing.l },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: spacing.m,
    color: colors.text,
    ...typography.body,
    fontSize: 15,
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: spacing.base,
    borderRadius: radius.l,
    marginTop: spacing.l,
  },
  shareTitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  discard: { alignItems: 'center', paddingVertical: spacing.l },
});
