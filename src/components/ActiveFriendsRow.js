import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export default function ActiveFriendsRow({ friends, onPress }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {friends.map((f) => (
        <TouchableOpacity key={f.id} style={styles.item} onPress={() => onPress?.(f)}>
          <View style={styles.ring}>
            <Image source={{ uri: f.avatar }} style={styles.avatar} />
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {f.shortName?.toUpperCase() || `${f.firstName.toUpperCase()} ${f.lastName[0]}.`}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.base, paddingVertical: spacing.m },
  item: { alignItems: 'center', marginRight: spacing.base, width: 80 },
  ring: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: colors.accent,
    padding: 3,
    backgroundColor: colors.surface,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 30 },
  name: {
    ...typography.labelCapsSmall,
    color: colors.textSecondary,
    marginTop: spacing.s,
    textAlign: 'center',
  },
});
