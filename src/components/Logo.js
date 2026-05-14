import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, fonts } from '../theme';

// VOLT brand lockup. Mark + wordmark "VOL[T▪]" where the trailing "T" and the
// square dot block are in accent. The mark itself is the angular V chevron —
// two diagonal slashes with a smaller offset inner triangle for stepped depth.

export function VoltMark({ size = 20, color = colors.accent }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Outer chevron */}
      <Path d="M4 8 L20 8 L32 38 L44 8 L60 8 L34 60 L30 60 Z" fill={color} />
      {/* Inner offset triangle for stepped depth */}
      <Path d="M22 18 L32 40 L42 18 Z" fill={color} opacity={0.55} />
    </Svg>
  );
}

export default function Logo({
  size = 22,
  showWordmark = true,
  wordmarkColor = colors.text,
  accentColor = colors.accent,
  align = 'center',
}) {
  const markSize = Math.round(size * 0.95);
  const wordSize = size;

  return (
    <View style={[styles.row, align === 'center' && styles.center]}>
      <VoltMark size={markSize} color={accentColor} />
      {showWordmark ? (
        <View style={styles.wordmarkRow}>
          <Text style={[styles.wordmark, { color: wordmarkColor, fontSize: wordSize }]}>VOL</Text>
          <Text style={[styles.wordmark, { color: accentColor, fontSize: wordSize }]}>T</Text>
          <View
            style={[
              styles.dot,
              {
                width: Math.round(wordSize * 0.36),
                height: Math.round(wordSize * 0.36),
                backgroundColor: accentColor,
                marginLeft: Math.round(wordSize * 0.18),
                marginBottom: Math.round(wordSize * 0.05),
              },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { justifyContent: 'center' },
  wordmarkRow: { flexDirection: 'row', alignItems: 'flex-end', marginLeft: spacing.s },
  wordmark: {
    fontFamily: fonts.sansMedium,
    fontWeight: '700',
    letterSpacing: -1,
    includeFontPadding: false,
  },
  dot: { borderRadius: 0 },
});
