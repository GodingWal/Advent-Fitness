import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radius, typography } from '../theme';

// VOLT PrimaryButton — accent bg, dark text, sharp 4px radius, 56h.
export default function PrimaryButton({
  label,
  onPress,
  trailingIcon,
  leadingIcon,
  style,
  textStyle,
  disabled = false,
  variant = 'primary',
}) {
  const isPrimary = variant === 'primary';
  const bg = isPrimary ? colors.accent : colors.accent2;
  const fg = '#0A0C10';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.btn, { backgroundColor: bg }, disabled && styles.disabled, style]}
    >
      <View style={styles.row}>
        {leadingIcon ? (
          <Ionicons name={leadingIcon} size={18} color={fg} style={styles.lead} />
        ) : null}
        <Text style={[styles.label, { color: fg }, textStyle]}>{label}</Text>
        {trailingIcon ? (
          <Ionicons name={trailingIcon} size={18} color={fg} style={styles.trail} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.m,
    height: 56,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  lead: { marginRight: spacing.s },
  trail: { marginLeft: spacing.s },
  disabled: { opacity: 0.4 },
});
