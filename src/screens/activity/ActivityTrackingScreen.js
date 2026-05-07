import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import IconBadge from '../../components/IconBadge';
import TimerRing from '../../components/TimerRing';
import { watchLocation, pathDistanceMiles } from '../../services/location';
import { colors, spacing, radius, typography, shadows } from '../../theme';

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const INDOOR_TYPES = ['weightLifting', 'meditation', 'yoga'];

export default function ActivityTrackingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const activity = route?.params?.activity || {
    title: 'Surfing',
    type: 'surfing',
    image: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=1200&q=80',
  };
  const isIndoor = INDOOR_TYPES.includes(activity.type);

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [path, setPath] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const intervalRef = useRef();
  const watchRef = useRef();

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (isIndoor) return;
    let cancelled = false;
    (async () => {
      const sub = await watchLocation((point) => {
        if (cancelled) return;
        setPath((p) => [...p, point]);
      });
      watchRef.current = sub;
    })();
    return () => {
      cancelled = true;
      watchRef.current?.remove?.();
    };
  }, [isIndoor]);

  const distanceMi = pathDistanceMiles(path);
  const paceMinPerMi = distanceMi > 0 ? seconds / 60 / distanceMi : 0;
  const progress = (seconds % 600) / 600;

  const finish = () => {
    watchRef.current?.remove?.();
    navigation.replace('ActivitySummary', {
      activity,
      durationSec: seconds,
      distanceMi,
      coordinates: path.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
    });
  };

  return (
    <ImageBackground source={{ uri: activity.image }} style={styles.bg}>
      <StatusBar barStyle="light-content" />
      <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.white} />
        </TouchableOpacity>
        {!isIndoor ? (
          <TouchableOpacity onPress={() => setShowMap((v) => !v)} hitSlop={12}>
            <Ionicons
              name={showMap ? 'speedometer-outline' : 'map-outline'}
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
        ) : <View style={{ width: 24 }} />}
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
          <Text style={styles.kicker}>CURRENT ACTIVITY</Text>
          <IconBadge
            icon={activity.type === 'hiking' ? 'mountain' : 'wave'}
            size={88}
            color={colors.accent}
            bg={colors.surface}
            style={{ marginTop: spacing.base }}
          />
          <Text style={styles.activityName}>{activity.title}</Text>

          <View style={{ marginTop: spacing.xxl }}>
            <TimerRing
              size={300}
              stroke={4}
              progress={progress}
              time={formatTime(seconds)}
              label="MINUTES"
            />
          </View>

          {!isIndoor ? (
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{distanceMi.toFixed(2)}</Text>
                <Text style={styles.metricLabel}>MILES</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metric}>
                <Text style={styles.metricValue}>
                  {paceMinPerMi > 0 && Number.isFinite(paceMinPerMi)
                    ? `${Math.floor(paceMinPerMi)}:${String(Math.round((paceMinPerMi % 1) * 60)).padStart(2, '0')}`
                    : '--:--'}
                </Text>
                <Text style={styles.metricLabel}>MIN/MI</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.statusText}>{running ? 'Activity Tracking\nIn Progress...' : 'Paused'}</Text>
          )}
        </View>
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.controlRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.pauseBtn}
            onPress={() => setRunning((r) => !r)}
          >
            <Ionicons name={running ? 'pause' : 'play'} size={28} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={styles.endBtn} onPress={finish}>
            <Ionicons name="stop" size={22} color={colors.white} />
            <Text style={styles.endLabel}>END</Text>
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
  body: { flex: 1, alignItems: 'center', paddingTop: spacing.l },
  kicker: { ...typography.labelCaps, color: colors.white, opacity: 0.85 },
  activityName: { color: colors.white, fontSize: 22, fontWeight: '300', marginTop: spacing.m },
  statusText: { color: colors.white, ...typography.h3, fontWeight: '300', textAlign: 'center', marginTop: spacing.xl },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { color: colors.white, fontSize: 32, fontWeight: '300' },
  metricLabel: { ...typography.labelCapsSmall, color: colors.white, opacity: 0.85, marginTop: 4 },
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
