import React, { useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Caps, Mono } from './VoltPrimitives';
import { logger } from '../services/logger';
import { strings } from '../i18n/strings';
import { colors, spacing, radius, typography } from '../theme';

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

function POIDetailSheet({ poi, saved, onClose, onStartActivity, onToggleSave, onViewDetails }) {
  const openDirections = useCallback(() => {
    if (!poi?.coordinate) return;
    const { latitude, longitude } = poi.coordinate;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url).catch((e) =>
      logger.warn('Failed to open directions', { message: e?.message })
    );
  }, [poi]);

  if (!poi) return null;

  const weather = WEATHER_BY_CATEGORY[poi.category];

  return (
    <View
      style={styles.sheet}
      accessibilityViewIsModal
      accessibilityRole="summary"
      accessibilityLabel={`Details for ${poi.name}`}
    >
      <View style={styles.handle} />
      <TouchableOpacity
        style={styles.close}
        onPress={onClose}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Close details"
      >
        <Ionicons name="close" size={20} color={colors.text} />
      </TouchableOpacity>
      {poi.photo ? (
        <Image source={{ uri: poi.photo }} style={styles.photo} accessibilityIgnoresInvertColors />
      ) : null}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{poi.name}</Text>
            <Mono size={11} style={{ marginTop: 4 }}>
              {poi.address}
            </Mono>
          </View>
          <TouchableOpacity
            onPress={onToggleSave}
            hitSlop={12}
            style={styles.saveBtn}
            accessibilityRole="button"
            accessibilityState={{ selected: !!saved }}
            accessibilityLabel={saved ? 'Remove from saved' : 'Save spot'}
          >
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={22}
              color={saved ? colors.accent2 : colors.textMute}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.meta}>
          {poi.rating ? (
            <View style={styles.metaItem}>
              <Ionicons name="star" size={12} color={colors.accent3} />
              <Mono size={11} style={styles.metaText}>
                {poi.rating.toFixed(1)}
              </Mono>
            </View>
          ) : null}
          {poi.distanceMi != null ? (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={12} color={colors.textMute} />
              <Mono size={11} style={styles.metaText}>
                {poi.distanceMi.toFixed(1)} mi
              </Mono>
            </View>
          ) : null}
          {poi.open != null ? (
            <View style={styles.metaItem}>
              <Ionicons
                name="time-outline"
                size={12}
                color={poi.open ? colors.accent : colors.accent2}
              />
              <Caps
                size={9}
                color={poi.open ? colors.accent : colors.accent2}
                style={styles.metaText}
              >
                {poi.open ? strings.poi.openNow : strings.poi.closed}
              </Caps>
            </View>
          ) : null}
          {poi.userSubmitted ? (
            <View style={styles.metaItem}>
              <Ionicons name="person-add-outline" size={12} color={colors.accent} />
              <Caps size={9} color={colors.accent} style={styles.metaText}>
                {strings.poi.community}
              </Caps>
            </View>
          ) : null}
        </View>

        {weather ? (
          <View style={styles.weather}>
            <Ionicons name={weather.icon} size={16} color={colors.accent} />
            <Mono size={11} style={styles.weatherText}>
              {weather.text}
            </Mono>
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn]}
            onPress={openDirections}
            accessibilityRole="button"
            accessibilityLabel={strings.poi.directions}
          >
            <Ionicons name="navigate-outline" size={16} color="#0A0C10" />
            <Caps size={11} color="#0A0C10" style={styles.primaryLabel}>
              {strings.poi.directions}
            </Caps>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onViewDetails}
            accessibilityRole="button"
            accessibilityLabel={strings.poi.details}
          >
            <Ionicons name="information-circle-outline" size={16} color={colors.text} />
            <Caps size={11} color={colors.text} style={styles.label}>
              {strings.poi.details}
            </Caps>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onStartActivity}
            accessibilityRole="button"
            accessibilityLabel={`${strings.poi.start} activity at ${poi.name}`}
          >
            <Ionicons name="play-circle-outline" size={16} color={colors.text} />
            <Caps size={11} color={colors.text} style={styles.label}>
              {strings.poi.start}
            </Caps>
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
    backgroundColor: colors.bgAlt,
    borderTopLeftRadius: radius.l,
    borderTopRightRadius: radius.l,
    paddingBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.line,
  },
  handle: {
    width: 40,
    height: 3,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginTop: spacing.s,
  },
  close: { position: 'absolute', right: spacing.edge, top: spacing.base, zIndex: 2 },
  photo: { width: '100%', height: 160, marginTop: spacing.m },
  body: { padding: spacing.edge },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  saveBtn: { padding: 4 },
  title: { ...typography.h4, fontSize: 22, color: colors.text },
  meta: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.m },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.base, marginTop: 4 },
  metaText: { marginLeft: 4 },
  weather: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginTop: spacing.m,
  },
  weatherText: { marginLeft: spacing.s },
  actions: { flexDirection: 'row', marginTop: spacing.base },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.line,
    marginHorizontal: 4,
  },
  primaryBtn: { backgroundColor: colors.accent, borderColor: colors.accent },
  label: { marginLeft: 6 },
  primaryLabel: { marginLeft: 6 },
});

export default React.memo(POIDetailSheet);
