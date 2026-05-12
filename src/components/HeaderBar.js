import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';

export default function HeaderBar({
  title,
  onMenu,
  onBack,
  rightIcon,
  rightBadge,
  onRight,
  background = colors.surface,
  iconColor = colors.textPrimary,
  titleColor = colors.textPrimary,
  bordered = false,
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.wrap,
        bordered && styles.bordered,
        { backgroundColor: background, paddingTop: insets.top + 6 },
      ]}
    >
      <View style={styles.left}>
        {onBack ? (
          <TouchableOpacity
            hitSlop={12}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={28} color={iconColor} />
          </TouchableOpacity>
        ) : onMenu ? (
          <TouchableOpacity
            hitSlop={12}
            onPress={onMenu}
            accessibilityRole="button"
            accessibilityLabel="Open navigation menu"
          >
            <Ionicons name="menu" size={26} color={iconColor} />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.center}>
        {title ? (
          <Text
            style={[styles.title, { color: titleColor }]}
            accessibilityRole="header"
          >
            {title}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>
        {rightIcon ? (
          <TouchableOpacity
            hitSlop={12}
            onPress={onRight}
            style={styles.rightBtn}
            accessibilityRole="button"
            accessibilityLabel={`${rightIcon} action`}
          >
            <Ionicons name={rightIcon} size={26} color={iconColor} />
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
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.m,
  },
  bordered: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  left: { width: 60, alignItems: 'flex-start' },
  center: { flex: 1, alignItems: 'center' },
  right: { width: 60, alignItems: 'flex-end' },
  title: { ...typography.h3, fontWeight: '400' },
  rightBtn: { padding: 4 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accentTeal,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '600' },
});
