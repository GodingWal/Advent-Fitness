import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, radius } from '../theme';

export default function Logo({ size = 96, showWordmark = true, wordmarkColor = colors.accent }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.tile, { width: size, height: size, borderRadius: radius.l }]}>
        <Svg width={size * 0.62} height={size * 0.62} viewBox="0 0 64 64">
          <Path
            d="M10 16 L32 56 L54 16 L44 16 L32 38 L20 16 Z"
            fill="#FFFFFF"
          />
          <Path d="M30 16 L34 16 L34 28 L30 28 Z" fill="#FFFFFF" />
        </Svg>
      </View>
      {showWordmark && (
        <Text style={[styles.wordmark, { color: wordmarkColor }]}>
          <Text style={{ fontWeight: '600' }}>A</Text>dvent
          <Text style={{ color: colors.textSecondary }}>Fitness</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  tile: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    marginTop: spacing.m,
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 1,
  },
});
