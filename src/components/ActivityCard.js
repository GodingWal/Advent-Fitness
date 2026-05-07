import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme';
import IconBadge from './IconBadge';

export default function ActivityCard({
  title,
  sublabel,
  image,
  icon = 'wave',
  width = 220,
  height = 280,
  variant = 'tile',
  onPress,
}) {
  if (variant === 'wide') {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.wideWrap, { height }]}>
        <Image source={{ uri: image }} style={styles.wideImg} />
        <View style={styles.wideOverlay} />
        <View style={styles.wideText}>
          <Text style={styles.wideTitle}>{title}</Text>
          {sublabel ? <Text style={styles.wideSub}>{sublabel}</Text> : null}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.wrap, { width }]}>
      <ImageBackground source={{ uri: image }} style={[styles.image, { height: height * 0.65 }]} imageStyle={styles.imgRadius} />
      <View style={[styles.foot, { height: height * 0.35 }]}>
        <Text style={styles.title}>{title}</Text>
        {sublabel ? <Text style={styles.sub}>{sublabel}</Text> : null}
      </View>
      <View style={styles.badgeWrap}>
        <IconBadge icon={icon} size={56} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.l,
    backgroundColor: colors.surface,
    marginRight: spacing.m,
    overflow: 'visible',
    ...shadows.card,
  },
  image: {
    overflow: 'hidden',
  },
  imgRadius: { borderTopLeftRadius: radius.l, borderTopRightRadius: radius.l },
  foot: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.l,
    borderBottomRightRadius: radius.l,
  },
  title: { ...typography.h3, color: colors.textPrimary, fontWeight: '400' },
  sub: { ...typography.labelCapsSmall, color: colors.textSecondary, marginTop: 4 },
  badgeWrap: {
    position: 'absolute',
    alignSelf: 'center',
    top: '55%',
    marginTop: -28,
  },
  wideWrap: {
    width: '100%',
    borderRadius: radius.l,
    overflow: 'hidden',
    marginBottom: spacing.base,
    ...shadows.card,
  },
  wideImg: { width: '100%', height: '100%' },
  wideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  wideText: {
    position: 'absolute',
    left: spacing.l,
    bottom: spacing.l,
  },
  wideTitle: { ...typography.h2, color: colors.textOnDark, fontWeight: '300' },
  wideSub: { ...typography.body, color: colors.textOnDark, marginTop: 4 },
});
