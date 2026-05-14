import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '../theme';

// VOLT BackBar — 36×36 bordered back square left, centered UPPERCASE title,
// right slot for action icons. Background defaults to bg.
export default function HeaderBar({
  title,
  onMenu,
  onBack,
  rightIcon,
  rightBadge,
  onRight,
  background = colors.bg,
  iconColor = colors.text,
  titleColor = colors.text,
  bordered = false,
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.wrap,
        bordered && styles.bordered,
        { backgroundColor: background, paddingTop: insets.top + 12 },
      ]}
    >
      <View style={styles.left}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.iconBox, { borderColor: colors.line }]}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={20} color={iconColor} />
          </TouchableOpacity>
        ) : onMenu ? (
          <TouchableOpacity
            onPress={onMenu}
            style={[styles.iconBox, { borderColor: colors.line }]}
            accessibilityRole="button"
            accessibilityLabel="Open navigation menu"
          >
            <Ionicons name="menu" size={18} color={iconColor} />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.center}>
        {title ? (
          <Text
            style={[styles.title, { color: titleColor }]}
            accessibilityRole="header"
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>
        {rightIcon ? (
          <TouchableOpacity
            onPress={onRight}
            style={styles.rightBtn}
            accessibilityRole="button"
            accessibilityLabel={`${rightIcon} action`}
            hitSlop={12}
          >
            <Ionicons name={rightIcon} size={22} color={iconColor} />
            {rightBadge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{rightBadge}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.edge,
    paddingBottom: spacing.m,
  },
  bordered: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  left: { width: 60, alignItems: 'flex-start' },
  center: { flex: 1, alignItems: 'center' },
  right: { width: 60, alignItems: 'flex-end' },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.s,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.caps,
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.text,
  },
  rightBtn: { padding: 4 },
  badge: {
    position: 'absolute',
    top: 0,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 2,
    backgroundColor: colors.accent,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#0A0C10',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: typography.mono.fontFamily,
    letterSpacing: 0.4,
  },
});
