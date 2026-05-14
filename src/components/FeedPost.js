import React, { useCallback, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { strings } from '../i18n/strings';
import { colors, spacing, radius, typography } from '../theme';

// VOLT FeedCard — `surface` bg, 1px lineSoft border, stat strip with mono accent
// quantity + caps unit, optional photo grid, action footer with VIEW link.
function FeedPost({ post }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likes, setLikes] = useState(post.likes ?? 0);
  const toggleLike = useCallback(() => {
    setLiked((v) => {
      const next = !v;
      setLikes((n) => n + (next ? 1 : -1));
      return next;
    });
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image
          source={{ uri: post.user.avatar }}
          style={styles.avatar}
          accessibilityIgnoresInvertColors
        />
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {post.user.shortName || `${post.user.firstName} ${post.user.lastName}`}
          </Text>
          <Text style={styles.when}>{post.when}</Text>
        </View>
        <TouchableOpacity hitSlop={12} accessibilityRole="button" accessibilityLabel="More options">
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMute} />
        </TouchableOpacity>
      </View>

      <View style={styles.statStrip}>
        <Text style={styles.statValue}>{post.quantity}</Text>
        <Text style={styles.statLabel}>{post.action?.toUpperCase()}</Text>
      </View>

      {post.location ? <Text style={styles.location}>{post.location.toUpperCase()}</Text> : null}

      {post.photos?.length > 0 ? (
        <View style={styles.photoRow}>
          {post.photos.slice(0, 2).map((uri, i) => (
            <Image
              key={uri}
              source={{ uri }}
              style={[styles.photo, post.photos.length > 1 && i === 0 && { marginRight: 2 }]}
              accessibilityIgnoresInvertColors
            />
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.action}
          onPress={toggleLike}
          accessibilityRole="button"
          accessibilityState={{ selected: liked }}
          accessibilityLabel={liked ? strings.feed.liked : strings.feed.like}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={16}
            color={liked ? colors.accent2 : colors.textMute}
          />
          <Text style={[styles.actionText, liked && { color: colors.accent2 }]}>
            {likes > 0 ? likes : strings.feed.like}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel={strings.feed.comment}
        >
          <Ionicons name="chatbubble-outline" size={15} color={colors.textMute} />
          <Text style={styles.actionText}>{post.comments || strings.feed.comment}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel={strings.feed.share}
        >
          <Ionicons name="share-outline" size={16} color={colors.textMute} />
          <Text style={styles.actionText}>{strings.feed.share}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <Text style={styles.viewLink}>VIEW</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    marginHorizontal: spacing.edge,
    marginBottom: spacing.m,
    paddingTop: spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  avatar: { width: 38, height: 38, borderRadius: radius.s },
  headerText: { flex: 1, marginLeft: spacing.m },
  name: { ...typography.body, fontSize: 14, fontWeight: '600', color: colors.text },
  when: { ...typography.monoSmall, color: colors.textMute, marginTop: 2 },
  statStrip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.m,
  },
  statValue: {
    ...typography.monoXL,
    color: colors.accent,
    fontSize: 28,
  },
  statLabel: {
    ...typography.caps,
    fontSize: 10,
    color: colors.textMute,
    marginLeft: 8,
  },
  location: {
    ...typography.caps,
    fontSize: 10,
    color: colors.textMute,
    paddingHorizontal: spacing.base,
    paddingTop: 4,
  },
  photoRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.m,
  },
  photo: {
    flex: 1,
    height: 150,
    borderRadius: radius.s,
    backgroundColor: colors.surface2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.base,
    marginTop: spacing.base,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.l,
  },
  actionText: {
    ...typography.monoSmall,
    fontSize: 11,
    color: colors.textMute,
    marginLeft: 6,
  },
  viewLink: {
    ...typography.caps,
    fontSize: 10,
    color: colors.accent,
  },
});

export default React.memo(FeedPost);
