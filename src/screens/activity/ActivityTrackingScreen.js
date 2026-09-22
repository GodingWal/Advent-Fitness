import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import HeaderBar from '../../components/HeaderBar';
import IconBadge from '../../components/IconBadge';
import PrimaryButton from '../../components/PrimaryButton';
import OutlineButton from '../../components/OutlineButton';
import { Caps, Mono } from '../../components/VoltPrimitives';
import { watchLocation, pathDistanceMiles } from '../../services/location';
import { colors, spacing, radius, typography } from '../../theme';

export function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function computeElapsedSec(accumulatedSec, startedAtMs, nowMs) {
  if (!startedAtMs) return accumulatedSec;
  return accumulatedSec + Math.max(0, Math.floor((nowMs - startedAtMs) / 1000));
}

const INDOOR_TYPES = ['weightLifting', 'meditation', 'yoga'];
const ACTIVITY_ICONS = {
  surfing: 'wave',
  hiking: 'mountain',
  running: 'run',
  cycling: 'bike',
  weightLifting: 'weight',
  yoga: 'yoga',
  meditation: 'meditate',
};

const initialState = { seconds: 0, running: true, path: [], showMap: false };

function reducer(state, action) {
  switch (action.type) {
    case 'tick':
      return { ...state, seconds: action.seconds };
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

// VOLT live tracking — BackBar "RECORDING" + live pill. Activity icon row,
// big 96px mono accent timer, 3-col stat grid, pause/stop controls.
const DEFAULT_ACTIVITY = { title: 'Surfing', type: 'surfing' };

export default function ActivityTrackingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const activity = useMemo(
    () => route?.params?.activity || DEFAULT_ACTIVITY,
    [route?.params?.activity]
  );
  const isIndoor = INDOOR_TYPES.includes(activity.type);

  const [state, dispatch] = useReducer(reducer, initialState);
  const { seconds, running, path, showMap } = state;
  const watchRef = useRef();
  const runningRef = useRef(running);
  runningRef.current = running;
  const accumulatedRef = useRef(0);
  const startedAtRef = useRef(Date.now());

  // Timestamp-based timer — no setInterval drift. Pause freezes accumulation.
  useEffect(() => {
    if (running) startedAtRef.current = Date.now();
    else
      accumulatedRef.current = computeElapsedSec(
        accumulatedRef.current,
        startedAtRef.current,
        Date.now()
      );
  }, [running]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!runningRef.current) return;
      dispatch({
        type: 'tick',
        seconds: computeElapsedSec(accumulatedRef.current, startedAtRef.current, Date.now()),
      });
    }, 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (isIndoor) return undefined;
    let cancelled = false;
    (async () => {
      const sub = await watchLocation((point) => {
        if (cancelled || !runningRef.current) return;
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
  const kcal = Math.round(seconds * 0.18);

  const finish = useCallback(() => {
    watchRef.current?.remove?.();
    const finalSec = runningRef.current
      ? computeElapsedSec(accumulatedRef.current, startedAtRef.current, Date.now())
      : seconds;
    navigation.replace('ActivitySummary', {
      activity,
      durationSec: finalSec,
      distanceMi,
      coordinates: path.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
    });
  }, [navigation, activity, seconds, distanceMi, path]);

  const togglePause = useCallback(() => dispatch({ type: 'togglePause' }), []);
  const toggleMap = useCallback(() => dispatch({ type: 'toggleMap' }), []);

  const confirmExit = useCallback(() => {
    if (seconds === 0 && path.length === 0) {
      navigation.goBack();
      return;
    }
    Alert.alert('Discard activity?', 'Your current progress will be lost.', [
      { text: 'Keep recording', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          watchRef.current?.remove?.();
          navigation.goBack();
        },
      },
    ]);
  }, [navigation, seconds, path.length]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HeaderBar
        onBack={confirmExit}
        title="RECORDING"
        rightIcon={isIndoor ? undefined : showMap ? 'speedometer-outline' : 'map-outline'}
        onRight={isIndoor ? undefined : toggleMap}
      />

      <View style={styles.livePillRow}>
        <View style={[styles.livePill, !running && styles.livePillPaused]}>
          <View
            style={[styles.liveDot, { backgroundColor: running ? colors.accent : colors.textMute }]}
          />
          <Mono size={10} weight="500" color={running ? colors.accent : colors.textMute}>
            {running ? 'LIVE' : 'PAUSED'}
          </Mono>
        </View>
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
          <View style={styles.activityRow}>
            <IconBadge
              icon={ACTIVITY_ICONS[activity.type] || 'wave'}
              size={42}
              bg="transparent"
              border="transparent"
              color={colors.accent}
            />
            <View style={{ marginLeft: spacing.m }}>
              <Caps size={10} color={colors.textMute}>
                Session
              </Caps>
              <Text style={styles.activityName}>{activity.title}</Text>
            </View>
          </View>

          <View style={styles.timerWrap}>
            <Caps size={11} color={colors.textMute}>
              Elapsed
            </Caps>
            <Text
              style={styles.timer}
              accessibilityRole="timer"
              accessibilityLabel={`Elapsed time ${formatTime(seconds)}`}
            >
              {formatTime(seconds)}
            </Text>
          </View>

          <View style={styles.statGrid}>
            <View style={styles.statCell}>
              <Caps size={9} color={colors.textMute}>
                Dist
              </Caps>
              <View style={styles.statValRow}>
                <Mono size={24} color={colors.text} weight="500">
                  {distanceMi.toFixed(2)}
                </Mono>
                <Mono size={10} color={colors.textMute} style={{ marginLeft: 4 }}>
                  mi
                </Mono>
              </View>
            </View>
            <View style={styles.statCellDivider} />
            <View style={styles.statCell}>
              <Caps size={9} color={colors.textMute}>
                Cal
              </Caps>
              <View style={styles.statValRow}>
                <Mono size={24} color={colors.text} weight="500">
                  {kcal}
                </Mono>
                <Mono size={10} color={colors.textMute} style={{ marginLeft: 4 }}>
                  kcal
                </Mono>
              </View>
            </View>
            <View style={styles.statCellDivider} />
            <View style={styles.statCell}>
              <Caps size={9} color={colors.textMute}>
                Pace
              </Caps>
              <View style={styles.statValRow}>
                <Mono size={24} color={colors.text} weight="500">
                  {paceMinPerMi > 0 && Number.isFinite(paceMinPerMi)
                    ? `${Math.floor(paceMinPerMi)}:${String(
                        Math.round((paceMinPerMi % 1) * 60)
                      ).padStart(2, '0')}`
                    : '--:--'}
                </Mono>
                <Mono size={10} color={colors.textMute} style={{ marginLeft: 4 }}>
                  /mi
                </Mono>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.l }]}>
        <View style={{ flex: 1 }}>
          <OutlineButton label={running ? 'Pause' : 'Resume'} onPress={togglePause} />
        </View>
        <View style={{ width: spacing.m }} />
        <View style={{ flex: 1 }}>
          <PrimaryButton label="Stop" variant="secondary" trailingIcon="stop" onPress={finish} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  livePillRow: {
    alignItems: 'center',
    paddingVertical: spacing.s,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors.line,
  },
  livePillPaused: { opacity: 0.7 },
  liveDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  body: {
    flex: 1,
    paddingHorizontal: spacing.edge,
    paddingTop: spacing.base,
  },
  activityRow: { flexDirection: 'row', alignItems: 'center' },
  activityName: { ...typography.title, fontSize: 22, color: colors.text },
  timerWrap: {
    alignItems: 'flex-start',
    paddingVertical: spacing.xl,
  },
  timer: {
    ...typography.monoDisplay,
    fontSize: 96,
    lineHeight: 100,
    color: colors.accent,
    letterSpacing: -5,
    marginTop: 6,
  },
  statGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineSoft,
    paddingVertical: spacing.base,
    marginTop: spacing.base,
  },
  statCell: { flex: 1, alignItems: 'flex-start' },
  statValRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  statCellDivider: { width: 1, backgroundColor: colors.lineSoft },
  miniMapWrap: {
    flex: 1,
    marginHorizontal: spacing.edge,
    marginVertical: spacing.base,
    borderRadius: radius.l,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.edge,
    paddingTop: spacing.base,
  },
});
