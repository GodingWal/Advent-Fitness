import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, spacing, typography } from '../theme';

export default function ElevationChart({ profile, width = 320, height = 120 }) {
  if (!profile?.length) return null;

  const min = Math.min(...profile);
  const max = Math.max(...profile);
  const range = Math.max(1, max - min);

  const points = profile.map((p, i) => {
    const x = (i / (profile.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 8) - 4;
    return [x, y];
  });

  const linePath = 'M' + points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L');
  const fillPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>ELEVATION</Text>
        <Text style={styles.range}>
          {Math.round(min)} – {Math.round(max)} ft
        </Text>
      </View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="elev" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.accent} stopOpacity={0.4} />
            <Stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Line
          x1={0}
          y1={height - 1}
          x2={width}
          y2={height - 1}
          stroke={colors.lineSoft}
          strokeWidth={1}
        />
        <Path d={fillPath} fill="url(#elev)" />
        <Path d={linePath} stroke={colors.accent} strokeWidth={2} fill="none" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  label: { ...typography.caps, fontSize: 10, color: colors.textMute },
  range: { ...typography.mono, fontSize: 11, color: colors.textDim },
});
