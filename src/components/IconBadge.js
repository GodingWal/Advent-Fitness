import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';

const ICONS = {
  wave: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path
        d="M12 38 C20 28 28 28 32 38 C36 48 44 48 52 38"
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M14 26 L32 14 L50 26 L50 30 L32 18 L14 30 Z"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  mountain: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path
        d="M8 50 L24 22 L34 38 L42 30 L56 50 Z"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  diamondPlus: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path
        d="M32 6 L58 32 L32 58 L6 32 Z"
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeLinejoin="round"
      />
      <Path d="M22 32 H42 M32 22 V42" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  ),
};

export default function IconBadge({ icon = 'wave', size = 56, color = colors.accent, bg = colors.surface, style }) {
  const renderer = ICONS[icon] || ICONS.wave;
  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }, style]}>
      {renderer(size * 0.55, color)}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
