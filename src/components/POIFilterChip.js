import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../theme';

export default function POIFilterChip({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={16}
          color={active ? colors.white : colors.accent}
          style={styles.icon}
        />
      ) : null}
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    marginRight: spacing.s,
    ...shadows.cardLight,
  },
  chipActive: { backgroundColor: colors.accent },
  icon: { marginRight: 6 },
  label: { ...typography.bodySmall, fontWeight: '500', color: colors.textPrimary },
  labelActive: { color: colors.white },
});
