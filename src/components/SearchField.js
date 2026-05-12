import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radius, spacing, typography, shadows } from '../theme';

export default function SearchField({
  value,
  onChangeText,
  placeholder = 'Search',
  onSubmit,
  variant = 'attached',
  style,
}) {
  if (variant === 'plain') {
    return (
      <View style={[styles.plainWrap, style]}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.plainInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          accessibilityLabel={placeholder}
        />
      </View>
    );
  }
  return (
    <View style={[styles.wrap, style]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
      <TouchableOpacity
        style={styles.btn}
        onPress={onSubmit}
        accessibilityRole="button"
        accessibilityLabel="Search"
      >
        <Ionicons name="search" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.s,
    overflow: 'hidden',
    ...shadows.card,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    ...typography.body,
    color: colors.textPrimary,
  },
  btn: {
    width: 64,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plainWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.s,
    paddingHorizontal: spacing.base,
  },
  plainInput: {
    flex: 1,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.s,
    ...typography.body,
    color: colors.textPrimary,
  },
});
