import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

// VOLT timer — 76–96px mono accent number. No ring; "instrument cluster" feel.
// (Kept the TimerRing name for back-compat with existing callers.)
function TimerRing({ time = '0:00', label = 'ELAPSED', size = 96 }) {
  return (
    <View
      style={styles.wrap}
      accessibilityRole="timer"
      accessibilityLabel={`${time} ${label.toLowerCase()}`}
    >
      <Text style={[styles.time, { fontSize: size, lineHeight: size }]}>{time}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.l },
  time: {
    ...typography.monoDisplay,
    color: colors.accent,
    letterSpacing: -4,
  },
  label: {
    ...typography.caps,
    fontSize: 11,
    color: colors.textMute,
    marginTop: spacing.s,
  },
});

export default React.memo(TimerRing);
