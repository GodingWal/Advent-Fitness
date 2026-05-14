import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

// VOLT segmented tabs — mono Caps labels, 2px accent underline on active.
export default function SegmentedTabs({ tabs, value, onChange }) {
  return (
    <View style={styles.row}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <TouchableOpacity
            key={t.value}
            style={styles.tab}
            onPress={() => onChange(t.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
              {t.label}
            </Text>
            <View style={[styles.underline, active && styles.underlineActive]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
    paddingHorizontal: spacing.edge,
  },
  tab: {
    flex: 1,
    paddingTop: spacing.m,
    alignItems: 'center',
  },
  label: {
    ...typography.caps,
    fontSize: 11,
    paddingBottom: spacing.s,
  },
  labelActive: { color: colors.text },
  labelInactive: { color: colors.textMute },
  underline: { height: 2, alignSelf: 'stretch', backgroundColor: 'transparent' },
  underlineActive: { backgroundColor: colors.accent },
});
