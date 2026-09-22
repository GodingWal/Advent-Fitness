import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radius, typography } from '../theme';

// VOLT GhostButton — transparent fill, 1px line border, 52h.
export default function OutlineButton({
  label,
  onPress,
  style,
  textStyle,
  color = colors.line,
  textColor = colors.text,
  trailingIcon,
  disabled = false,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.btn, { borderColor: color }, disabled && styles.disabled, style]}
    >
      <View style={styles.row}>
        <Text style={[styles.label, { color: textColor }, textStyle]}>{label}</Text>
        {trailingIcon ? (
          <Ionicons name={trailingIcon} size={16} color={textColor} style={styles.trail} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.m,
    borderWidth: 1,
    height: 52,
    paddingHorizontal: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: {
    fontFamily: typography.mono.fontFamily,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  trail: { marginLeft: spacing.s },
  disabled: { opacity: 0.4 },
});
