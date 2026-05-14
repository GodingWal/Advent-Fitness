import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';

// VOLT live circle row — avatar 48 radius 2, "LIVE" pill top-right, mono
// activity label below.
export default function ActiveFriendsRow({ friends, onPress }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {friends.map((f) => (
        <TouchableOpacity key={f.id} style={styles.item} onPress={() => onPress?.(f)}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: f.avatar }} style={styles.avatar} />
            <View style={styles.livePill}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {f.shortName || `${f.firstName} ${f.lastName[0]}.`}
          </Text>
          <Text style={styles.activity} numberOfLines={1}>
            {f.activity || 'Surf · 22m'}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.edge, paddingVertical: spacing.m },
  item: { width: 110, marginRight: spacing.m },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.s,
    backgroundColor: colors.surface2,
  },
  livePill: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.accent,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
  },
  liveText: {
    ...typography.capsSm,
    fontSize: 8,
    color: '#0A0C10',
    fontWeight: '700',
  },
  name: {
    ...typography.body,
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.s,
  },
  activity: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textMute,
    marginTop: 2,
  },
});
