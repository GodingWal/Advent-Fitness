import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography } from '../theme';

function TimerRing({ size = 260, stroke = 4, progress = 0.7, time = '0:00', label = 'MINUTES' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      accessibilityRole="timer"
      accessibilityLabel={`${time} ${label.toLowerCase()}`}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={stroke}
          fill="rgba(255,255,255,0.12)"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.accent}
          strokeWidth={stroke}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.time}>{time}</Text>
        <View style={styles.divider} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  time: { color: colors.white, fontSize: 64, fontWeight: '300' },
  divider: { width: 24, height: 1, backgroundColor: colors.white, marginVertical: 6, opacity: 0.7 },
  label: { ...typography.labelCapsSmall, color: colors.white, opacity: 0.85 },
});

export default React.memo(TimerRing);
