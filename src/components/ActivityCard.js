import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';
import { Caps } from './VoltPrimitives';

// VOLT spot/program card — sharp 6px radius, surface bg with image header.
// `wide` variant is a full-bleed hero with bottom gradient + h3 title.
export default function ActivityCard({
  title,
  sublabel,
  image,
  width = 170,
  height = 200,
  variant = 'tile',
  onPress,
}) {
  if (variant === 'wide') {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.wideWrap, { height }]}>
        <Image source={{ uri: image }} style={styles.wideImg} />
        <View style={styles.wideOverlay} />
        <View style={styles.wideText}>
          {sublabel ? (
            <Caps size={10} color={colors.text} style={styles.wideKicker}>
              {sublabel}
            </Caps>
          ) : null}
          <Text style={styles.wideTitle}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.wrap, { width }]}>
      <ImageBackground
        source={{ uri: image }}
        style={[styles.image, { height: 110 }]}
        imageStyle={styles.imgRadius}
      />
      <View style={styles.foot}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {sublabel ? (
          <Caps size={9} color={colors.textMute} style={styles.sub}>
            {sublabel}
          </Caps>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.l,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    marginRight: spacing.m,
    overflow: 'hidden',
  },
  image: {
    backgroundColor: colors.surface2,
  },
  imgRadius: {
    borderTopLeftRadius: radius.l,
    borderTopRightRadius: radius.l,
  },
  foot: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
  },
  title: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  sub: { marginTop: 4 },
  wideWrap: {
    width: '100%',
    borderRadius: radius.l,
    overflow: 'hidden',
    marginBottom: spacing.base,
    backgroundColor: colors.surface,
  },
  wideImg: { width: '100%', height: '100%' },
  wideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,12,16,0.45)',
  },
  wideText: {
    position: 'absolute',
    left: spacing.base,
    bottom: spacing.base,
    right: spacing.base,
  },
  wideKicker: { marginBottom: 6 },
  wideTitle: {
    ...typography.h3,
    fontSize: 24,
    color: colors.text,
  },
});
