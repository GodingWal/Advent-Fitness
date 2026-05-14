import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radius, typography } from '../theme';

// VOLT category chip — radius 2, Caps label, active = lime fill + dark text.
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
          size={13}
          color={active ? '#0A0C10' : colors.textMute}
          style={styles.icon}
        />
      ) : null}
      <Text style={[styles.label, active && styles.labelActive]}>{label?.toUpperCase()}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: 8,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    backgroundColor: colors.surface,
    marginRight: spacing.s,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  icon: { marginRight: 6 },
  label: {
    ...typography.caps,
    fontSize: 10,
    color: colors.textMute,
  },
  labelActive: { color: '#0A0C10' },
});
