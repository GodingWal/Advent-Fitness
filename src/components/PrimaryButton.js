import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../theme';

export default function PrimaryButton({
  label,
  onPress,
  trailingIcon,
  style,
  textStyle,
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
      style={[styles.btn, disabled && styles.disabled, style]}
    >
      <View style={styles.row}>
        <Text style={[styles.label, textStyle]}>{label}</Text>
        {trailingIcon ? (
          <Ionicons
            name={trailingIcon}
            size={18}
            color={colors.textPrimary}
            style={styles.trail}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.cardLight,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: {
    ...typography.labelCaps,
    color: colors.textPrimary,
  },
  trail: { marginLeft: spacing.s },
  disabled: { opacity: 0.5 },
});
