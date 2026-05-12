import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';

export default function OutlineButton({ label, onPress, style, textStyle, color = colors.accentTeal }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.btn, { borderColor: color }, style]}
    >
      <Text style={[styles.label, { color: colors.textOnDark }, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingVertical: 15,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  label: { ...typography.labelCaps },
});
