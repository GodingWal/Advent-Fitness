import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import IconBadge from '../../components/IconBadge';
import TimerRing from '../../components/TimerRing';
import { watchLocation, pathDistanceMiles } from '../../services/location';
import { strings } from '../../i18n/strings';
import { colors, spacing, radius, typography, shadows } from '../../theme';

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const INDOOR_TYPES = ['weightLifting', 'meditation', 'yoga'];

const initialState = { seconds: 0, running: true, path: [], showMap: false };

function reducer(state, action) {
  switch (action.type) {
    case 'tick':
      return { ...state, seconds: state.seconds + 1 };
    case 'togglePause':
      return { ...state, running: !state.running };
    case 'addPoint':
      return { ...state, path: [...state.path, action.point] };
    case 'toggleMap':
      return { ...state, showMap: !state.showMap };
    default:
      return state;
  }
}

export default function ActivityTrackingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const activity = route?.params?.activity || {
    title: 'Surfing',
    type: 'surfing',
    image: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=1200&q=80',
  };
  const isIndoor = INDOOR_TYPES.includes(activity.type);

  const [state, dispatch] = useReducer(reducer, initialState);
  const { seconds, running, path, showMap } = state;
  const watchRef = useRef();

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (isIndoor) return undefined;
    let cancelled = false;
    (async () => {
      const sub = await watchLocation((point) => {
        if (cancelled) return;
        dispatch({ type: 'addPoint', point });
      });
      watchRef.current = sub;
    })();
    return () => {
      cancelled = true;
      watchRef.current?.remove?.();
    };
  }, [isIndoor]);

  const distanceMi = useMemo(() => pathDistanceMiles(path), [path]);
  const paceMinPerMi = distanceMi > 0 ? seconds / 60 / distanceMi : 0;
  const progress = (seconds % 600) / 600;

  const finish = useCallback(() => {
    watchRef.current?.remove?.();
    navigation.replace('ActivitySummary', {
      activity,
      durationSec: seconds,
      distanceMi,
      coordinates: path.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
    });
  }, [navigation, activity, seconds, distanceMi, path]);

  const togglePause = useCallback(() => dispatch({ type: 'togglePause' }), []);
  const toggleMap = useCallback(() => dispatch({ type: 'toggleMap' }), []);

  const headerStyle = useMemo(
    () => [styles.headerRow, { paddingTop: insets.top + 8 }],
    [insets.top]
  );
  const footerStyle = useMemo(
    () => [styles.footer, { paddingBottom: insets.bottom + spacing.xl }],
    [insets.bottom]
  );

  return (
    <ImageBackground source={{ uri: activity.image }} style={styles.bg}>
      <StatusBar barStyle="light-content" />
      <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={headerStyle}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={28} color={colors.white} />
        </TouchableOpacity>
        {!isIndoor ? (
          <TouchableOpacity
            onPress={toggleMap}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={showMap ? 'Show stats' : 'Show map'}
          >
            <Ionicons
              name={showMap ? 'speedometer-outline' : 'map-outline'}
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {showMap && path.length > 0 ? (
        <View style={styles.miniMapWrap}>
          <MapView
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: path[0].latitude,
              longitude: path[0].longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
            scrollEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            zoomEnabled={false}
          >
            <Polyline coordinates={path} strokeColor={colors.accent} strokeWidth={4} />
          </MapView>
        </View>
      ) : (
        <View style={styles.body}>
          <Text style={styles.kicker}>{strings.activity.currentActivity}</Text>
          <IconBadge
            icon={activity.type === 'hiking' ? 'mountain' : 'wave'}
            size={88}
            color={colors.accent}
            bg={colors.surface}
            style={styles.activityBadge}
          />
          <Text style={styles.activityName}>{activity.title}</Text>

          <View style={styles.timerWrap}>
            <TimerRing
              size={300}
              stroke={4}
              progress={progress}
              time={formatTime(seconds)}
              label={strings.activity.minutes}
            />
          </View>

          {!isIndoor ? (
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{distanceMi.toFixed(2)}</Text>
                <Text style={styles.metricLabel}>{strings.activity.miles}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metric}>
                <Text style={styles.metricValue}>
                  {paceMinPerMi > 0 && Number.isFinite(paceMinPerMi)
                    ? `${Math.floor(paceMinPerMi)}:${String(
                        Math.round((paceMinPerMi % 1) * 60)
                      ).padStart(2, '0')}`
                    : '--:--'}
                </Text>
                <Text style={styles.metricLabel}>{strings.activity.minPerMi}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.statusText}>
              {running ? strings.activity.inProgress : strings.activity.paused}
            </Text>
          )}
        </View>
      )}

      <View style={footerStyle}>
        <View style={styles.controlRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.pauseBtn}
            onPress={togglePause}
            accessibilityRole="button"
            accessibilityLabel={running ? 'Pause activity' : 'Resume activity'}
          >
            <Ionicons name={running ? 'pause' : 'play'} size={28} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.endBtn}
            onPress={finish}
            accessibilityRole="button"
            accessibilityLabel="End activity"
          >
            <Ionicons name="stop" size={22} color={colors.white} />
            <Text style={styles.endLabel}>{strings.activity.end}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bgDark },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.s,
  },
  headerSpacer: { width: 24 },
  body: { flex: 1, alignItems: 'center', paddingTop: spacing.l },
  kicker: { ...typography.labelCaps, color: colors.white, opacity: 0.85 },
  activityBadge: { marginTop: spacing.base },
  activityName: { color: colors.white, fontSize: 22, fontWeight: '300', marginTop: spacing.m },
  timerWrap: { marginTop: spacing.xxl },
  statusText: {
    color: colors.white,
    ...typography.h3,
    fontWeight: '300',
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { color: colors.white, fontSize: 32, fontWeight: '300' },
  metricLabel: {
    ...typography.labelCapsSmall,
    color: colors.white,
    opacity: 0.85,
    marginTop: 4,
  },
  metricDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.3)' },
  miniMapWrap: {
    flex: 1,
    margin: spacing.base,
    borderRadius: radius.l,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  footer: { alignItems: 'center', paddingTop: spacing.l },
  controlRow: { flexDirection: 'row', alignItems: 'center' },
  pauseBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  endBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    backgroundColor: colors.like,
    borderRadius: radius.pill,
    marginLeft: spacing.l,
  },
  endLabel: { ...typography.labelCaps, color: colors.white, marginLeft: spacing.s },
});
