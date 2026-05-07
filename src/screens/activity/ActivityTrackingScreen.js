import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import IconBadge from '../../components/IconBadge';
import TimerRing from '../../components/TimerRing';
import { colors, spacing, typography } from '../../theme';

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ActivityTrackingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const activity = route?.params?.activity || {
    title: 'Surfing',
    type: 'surfing',
    image: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=1200&q=80',
  };

  const [seconds, setSeconds] = useState(362);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef();

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const progress = (seconds % 600) / 600;

  return (
    <ImageBackground source={{ uri: activity.image }} style={styles.bg}>
      <StatusBar barStyle="light-content" />
      <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

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

        <Text style={styles.statusText}>{running ? 'Activity Tracking\nIn Progress...' : 'Paused'}</Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.pauseBtn}
          onPress={() => setRunning((r) => !r)}
        >
          <Ionicons name={running ? 'pause' : 'play'} size={28} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.endLabel}>END ACTIVITY</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bgDark },
  headerRow: { paddingHorizontal: spacing.base, paddingBottom: spacing.s },
  body: { flex: 1, alignItems: 'center', paddingTop: spacing.l },
  kicker: { ...typography.labelCaps, color: colors.white, opacity: 0.85 },
  activityName: { color: colors.white, fontSize: 22, fontWeight: '300', marginTop: spacing.m },
  statusText: {
    color: colors.white,
    ...typography.h3,
    fontWeight: '300',
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  footer: { alignItems: 'center', paddingTop: spacing.l },
  pauseBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    marginBottom: spacing.base,
  },
  endLabel: { ...typography.labelCaps, color: colors.white, opacity: 0.8 },
});
