import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../theme';

export default function POIDetailSheet({ poi, onClose, onStartActivity, onSave }) {
  if (!poi) return null;

  const openDirections = () => {
    const { latitude, longitude } = poi.coordinate;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />
      <TouchableOpacity style={styles.close} onPress={onClose} hitSlop={12}>
        <Ionicons name="close" size={22} color={colors.textPrimary} />
      </TouchableOpacity>
      {poi.photo ? <Image source={{ uri: poi.photo }} style={styles.photo} /> : null}
      <View style={styles.body}>
        <Text style={styles.title}>{poi.name}</Text>
        <Text style={styles.address}>{poi.address}</Text>
        <View style={styles.meta}>
          {poi.rating ? (
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color="#F4B400" />
              <Text style={styles.metaText}>{poi.rating.toFixed(1)}</Text>
            </View>
          ) : null}
          {poi.distanceMi != null ? (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{poi.distanceMi.toFixed(1)} mi</Text>
            </View>
          ) : null}
          {poi.open != null ? (
            <View style={styles.metaItem}>
              <Ionicons
                name="time-outline"
                size={14}
                color={poi.open ? '#2ECC71' : colors.like}
              />
              <Text style={styles.metaText}>{poi.open ? 'Open now' : 'Closed'}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={openDirections}>
            <Ionicons name="navigate-outline" size={18} color={colors.white} />
            <Text style={styles.primaryLabel}>Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onSave}>
            <Ionicons name="bookmark-outline" size={18} color={colors.accent} />
            <Text style={styles.label}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onStartActivity}>
            <Ionicons name="play-circle-outline" size={20} color={colors.accent} />
            <Text style={styles.label}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xxl,
    ...shadows.card,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    alignSelf: 'center',
    marginTop: spacing.s,
  },
  close: { position: 'absolute', right: spacing.base, top: spacing.base, zIndex: 2 },
  photo: { width: '100%', height: 160, marginTop: spacing.m },
  body: { padding: spacing.base },
  title: { ...typography.h3, color: colors.textPrimary, fontWeight: '500' },
  address: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  meta: { flexDirection: 'row', marginTop: spacing.m },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.base },
  metaText: { ...typography.bodySmall, color: colors.textSecondary, marginLeft: 4 },
  actions: { flexDirection: 'row', marginTop: spacing.base },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.divider,
    marginHorizontal: 4,
  },
  primaryBtn: { backgroundColor: colors.accent, borderColor: colors.accent },
  label: { ...typography.labelCapsSmall, color: colors.accent, marginLeft: 6 },
  primaryLabel: { ...typography.labelCapsSmall, color: colors.white, marginLeft: 6 },
});
