import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';

const ICON_BY_CATEGORY = {
  trails: 'trail-sign',
  gyms: 'barbell',
  basketball: 'basketball',
  tennis: 'tennisball',
  pickleball: 'tennisball',
  yoga: 'leaf',
  pools: 'water',
  skate: 'rocket',
  default: 'pin',
};

export default function POIMarker({ category }) {
  const icon = ICON_BY_CATEGORY[category] || ICON_BY_CATEGORY.default;
  return (
    <View style={styles.wrap}>
      <View style={styles.bubble}>
        <Ionicons name={icon} size={18} color={colors.white} />
      </View>
      <View style={styles.tail} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  bubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  tail: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.accent,
  },
});
