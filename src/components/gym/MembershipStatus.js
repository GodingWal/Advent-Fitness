import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../theme';

const STATUS_COLORS = {
  ACTIVE: { fg: '#0A0C10', bg: colors.accent, border: colors.accent },
  PAUSED: { fg: colors.accent3, bg: 'transparent', border: colors.line },
  SUSPENDED: { fg: colors.accent2, bg: 'transparent', border: colors.line },
  EXPIRED: { fg: colors.textMute, bg: 'transparent', border: colors.line },
  CANCELLED: { fg: colors.textMute, bg: 'transparent', border: colors.line },
  PENDING: { fg: colors.textMute, bg: 'transparent', border: colors.line },
};

export default function MembershipStatus({ status }) {
  const key = String(status || 'UNKNOWN').toUpperCase();
  const scheme = STATUS_COLORS[key] || STATUS_COLORS.PENDING;
  return (
    <View
      style={[styles.pill, { backgroundColor: scheme.bg, borderColor: scheme.border }]}
      accessibilityRole="text"
      accessibilityLabel={`Membership status ${key}`}
    >
      <Text style={[styles.label, { color: scheme.fg }]}>{key}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderRadius: radius.s,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.capsSm,
    fontSize: 9,
  },
});
