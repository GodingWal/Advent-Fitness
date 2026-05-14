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
        <Ionicons name={icon} size={16} color="#0A0C10" />
      </View>
      <View style={styles.tail} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  bubble: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0A0C10',
  },
  tail: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.accent,
  },
});
