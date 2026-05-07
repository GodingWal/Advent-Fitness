import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../theme';

const WEATHER_BY_CATEGORY = {
  trails: { icon: 'partly-sunny-outline', text: '68° · Partly cloudy · UV 5' },
  gyms: { icon: 'thermometer-outline', text: 'Indoor · Climate controlled' },
  basketball: { icon: 'sunny-outline', text: '72° · Light wind 4 mph' },
  tennis: { icon: 'sunny-outline', text: '72° · Light wind 4 mph' },
  pickleball: { icon: 'sunny-outline', text: '72° · Light wind 4 mph' },
  yoga: { icon: 'thermometer-outline', text: 'Indoor · Climate controlled' },
  pools: { icon: 'water-outline', text: '78° water · 80° air' },
  skate: { icon: 'sunny-outline', text: '70° · Wind 6 mph' },
  surfing: { icon: 'water-outline', text: 'Surf 3-4 ft · Tide rising' },
};

export default function POIDetailSheet({
  poi,
  saved,
  onClose,
  onStartActivity,
  onToggleSave,
  onViewDetails,
}) {
  if (!poi) return null;

  const openDirections = () => {
    const { latitude, longitude } = poi.coordinate;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const weather = WEATHER_BY_CATEGORY[poi.category];

  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />
      <TouchableOpacity style={styles.close} onPress={onClose} hitSlop={12}>
        <Ionicons name="close" size={22} color={colors.textPrimary} />
      </TouchableOpacity>
      {poi.photo ? <Image source={{ uri: poi.photo }} style={styles.photo} /> : null}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{poi.name}</Text>
            <Text style={styles.address}>{poi.address}</Text>
          </View>
          <TouchableOpacity onPress={onToggleSave} hitSlop={12} style={styles.saveBtn}>
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={26}
              color={saved ? colors.like : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

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
          {poi.userSubmitted ? (
            <View style={styles.metaItem}>
              <Ionicons name="person-add-outline" size={14} color={colors.accent} />
              <Text style={[styles.metaText, { color: colors.accent }]}>Community</Text>
            </View>
          ) : null}
        </View>

        {weather ? (
          <View style={styles.weather}>
            <Ionicons name={weather.icon} size={18} color={colors.accent} />
            <Text style={styles.weatherText}>{weather.text}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={openDirections}>
            <Ionicons name="navigate-outline" size={18} color={colors.white} />
            <Text style={styles.primaryLabel}>Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onViewDetails}>
            <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
            <Text style={styles.label}>Details</Text>
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
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  saveBtn: { padding: 4 },
  title: { ...typography.h3, color: colors.textPrimary, fontWeight: '500' },
  address: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.m },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.base, marginTop: 4 },
  metaText: { ...typography.bodySmall, color: colors.textSecondary, marginLeft: 4 },
  weather: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginTop: spacing.m,
  },
  weatherText: { ...typography.bodySmall, color: colors.textPrimary, marginLeft: spacing.s },
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
