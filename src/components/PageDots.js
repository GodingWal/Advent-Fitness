import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

// VOLT page dots — active is a 22×3 accent bar, inactive are 6×3 line stubs.
export default function PageDots({ count, active }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.dot, i === active ? styles.dotActive : styles.dotInactive]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  dot: {
    height: 3,
    marginHorizontal: spacing.xs,
    borderRadius: 0,
  },
  dotActive: { width: 22, backgroundColor: colors.accent },
  dotInactive: { width: 6, backgroundColor: colors.line },
});
