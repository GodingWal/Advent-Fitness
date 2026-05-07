import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../theme';

export default function FeedPost({ post }) {
  const [liked, setLiked] = useState(post.likedByMe);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.title}>
            <Text style={styles.name}>{post.user.shortName || `${post.user.firstName} ${post.user.lastName}`} </Text>
            <Text style={styles.action}> {post.action} </Text>
          </Text>
          <Text style={styles.line2}>
            <Text style={styles.qty}>{post.quantity}</Text>
            {post.location ? <Text style={styles.action}>{` at ${post.location}`}</Text> : null}
          </Text>
          <Text style={styles.when}>{post.when}</Text>
        </View>
        <TouchableOpacity hitSlop={12}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {post.photos?.length > 0 ? (
        <View style={styles.photoRow}>
          {post.photos.slice(0, 2).map((uri, i) => (
            <Image
              key={i}
              source={{ uri }}
              style={[
                styles.photo,
                post.photos.length > 1 && i === 0 && { marginRight: 4 },
              ]}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.action} onPress={() => setLiked((v) => !v)}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? colors.accent : colors.textMuted}
          />
          <Text style={[styles.actionText, liked && { color: colors.accent }]}>
            {liked ? 'LIKED' : 'LIKE'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
          <Text style={styles.actionText}>COMMENT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action}>
          <Ionicons name="arrow-redo-outline" size={20} color={colors.textMuted} />
          <Text style={styles.actionText}>SHARE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  headerText: { flex: 1, marginLeft: spacing.m },
  title: { ...typography.body, color: colors.textSecondary },
  name: { color: colors.textPrimary, fontWeight: '500' },
  action: { color: colors.textSecondary },
  line2: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  qty: { color: colors.textPrimary, fontWeight: '500' },
  when: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  photoRow: { flexDirection: 'row', paddingHorizontal: spacing.base, paddingBottom: spacing.base },
  photo: { flex: 1, height: 160, borderRadius: radius.s, backgroundColor: colors.surfaceMuted },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingVertical: spacing.m,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    ...typography.labelCapsSmall,
    color: colors.textMuted,
    marginLeft: spacing.s,
  },
});
