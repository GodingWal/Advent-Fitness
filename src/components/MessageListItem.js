import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';

// VOLT inbox row — unread rows get a 4×24 accent bar on the left edge, full-
// color avatar, name in 600 weight, mono accent timestamp.
export default function MessageListItem({ conversation, onPress }) {
  const { participant, lastMessage, timestamp, unread } = conversation;
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.row}>
      {unread ? <View style={styles.unreadBar} /> : null}
      <Image
        source={{ uri: participant.avatar }}
        style={[styles.avatar, !unread && styles.avatarMuted]}
      />
      <View style={styles.body}>
        <Text style={[styles.name, unread && styles.nameUnread]} numberOfLines={1}>
          {`${participant.firstName} ${participant.lastName}`}
        </Text>
        <Text style={styles.snippet} numberOfLines={2}>
          {lastMessage}
        </Text>
      </View>
      <Text style={[styles.time, unread && styles.timeUnread]}>{timestamp}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.edge,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -12,
    width: 4,
    height: 24,
    backgroundColor: colors.accent,
  },
  avatar: { width: 48, height: 48, borderRadius: radius.s },
  avatarMuted: { opacity: 0.6 },
  body: { flex: 1, marginHorizontal: spacing.base },
  name: { ...typography.body, fontSize: 14, color: colors.text, fontWeight: '500' },
  nameUnread: { fontWeight: '600' },
  snippet: { ...typography.bodySmall, color: colors.textMute, marginTop: 4 },
  time: { ...typography.monoSmall, color: colors.textDim },
  timeUnread: { color: colors.accent },
});
