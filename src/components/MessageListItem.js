import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export default function MessageListItem({ conversation, onPress }) {
  const { participant, lastMessage, timestamp, unread } = conversation;
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.row}>
      <Image source={{ uri: participant.avatar }} style={styles.avatar} />
      <View style={styles.body}>
        <Text style={[styles.name, unread && styles.nameUnread]}>
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
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  body: { flex: 1, marginHorizontal: spacing.base },
  name: { ...typography.body, color: colors.textPrimary, fontWeight: '500' },
  nameUnread: { fontWeight: '600' },
  snippet: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  time: { ...typography.caption, color: colors.textMuted },
  timeUnread: { color: colors.textPrimary, fontWeight: '600' },
});
