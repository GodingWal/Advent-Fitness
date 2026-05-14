import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { colors, radius } from '../theme';

// Stroke-based, geometric, line icons at strokeWidth ~2px. Matches VOLT
// activity glyphs from the design handoff (icons.jsx).

const ICONS = {
  wave: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path
        d="M6 40 C16 32 22 32 32 40 C42 48 48 48 58 40"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M6 28 C16 20 22 20 32 28 C42 36 48 36 58 28"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  ),
  mountain: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path
        d="M6 50 L22 24 L34 40 L42 30 L58 50 Z"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinejoin="round"
      />
      <Circle cx="46" cy="14" r="3" stroke={color} strokeWidth={1.6} fill="none" />
    </Svg>
  ),
  run: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx="40" cy="12" r="4" stroke={color} strokeWidth={2} fill="none" />
      <Path
        d="M22 50 L30 38 L26 28 L36 22 L44 30 L52 32 M30 38 L36 50"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  bike: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx="16" cy="44" r="10" stroke={color} strokeWidth={2} fill="none" />
      <Circle cx="48" cy="44" r="10" stroke={color} strokeWidth={2} fill="none" />
      <Path
        d="M20 44 L30 24 L42 24 L48 44 M30 24 L36 44"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  yoga: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx="32" cy="14" r="4" stroke={color} strokeWidth={2} fill="none" />
      <Path
        d="M32 18 L32 36 M16 18 L32 26 L48 18 M22 50 L32 36 L42 50"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  ),
  meditate: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx="32" cy="16" r="4" stroke={color} strokeWidth={2} fill="none" />
      <Path
        d="M32 20 L32 36 M18 36 L46 36 M14 48 L50 48 M24 36 L32 28 L40 36"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  ),
  weight: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Line x1="20" y1="32" x2="44" y2="32" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Rect x="8" y="20" width="8" height="24" stroke={color} strokeWidth={2} fill="none" />
      <Rect x="48" y="20" width="8" height="24" stroke={color} strokeWidth={2} fill="none" />
    </Svg>
  ),
  diamondPlus: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path
        d="M32 6 L58 32 L32 58 L6 32 Z"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinejoin="round"
      />
      <Path d="M22 32 H42 M32 22 V42" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  ),
  bolt: (size, color) => (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M34 6 L14 38 L28 38 L24 58 L50 24 L34 24 Z" fill={color} />
    </Svg>
  ),
};

export default function IconBadge({
  icon = 'wave',
  size = 56,
  color = colors.accent,
  bg = colors.surface,
  border = colors.lineSoft,
  square = true,
  style,
}) {
  const renderer = ICONS[icon] || ICONS.wave;
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: square ? radius.s : size / 2,
          backgroundColor: bg,
          borderColor: border,
        },
        style,
      ]}
    >
      {renderer(size * 0.55, color)}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
