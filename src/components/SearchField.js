import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radius, spacing, typography } from '../theme';

// VOLT search field — surface bg, lineSoft border, radius 4, padding 14×16.
export default function SearchField({
  value,
  onChangeText,
  placeholder = 'Search',
  onSubmit,
  variant = 'attached',
  hint,
  style,
}) {
  if (variant === 'plain') {
    return (
      <View style={[styles.plainWrap, style]}>
        <Ionicons name="search-outline" size={18} color={colors.textMute} />
        <TextInput
          style={styles.plainInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMute}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          accessibilityLabel={placeholder}
        />
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
    );
  }
  return (
    <View style={[styles.wrap, style]}>
      <Ionicons
        name="search-outline"
        size={18}
        color={colors.textMute}
        style={{ marginRight: spacing.s }}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMute}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
      <TouchableOpacity
        style={styles.btn}
        onPress={onSubmit}
        accessibilityRole="button"
        accessibilityLabel="Search"
      >
        <Text style={styles.btnLabel}>⌘K</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    paddingHorizontal: spacing.base,
    height: 48,
  },
  input: {
    flex: 1,
    ...typography.body,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  btn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  btnLabel: {
    ...typography.capsSm,
    color: colors.textMute,
    letterSpacing: 1.2,
  },
  plainWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgAlt,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    paddingHorizontal: spacing.base,
    height: 48,
  },
  plainInput: {
    flex: 1,
    paddingHorizontal: spacing.s,
    paddingVertical: 0,
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  hint: { ...typography.capsSm, color: colors.textDim },
});
