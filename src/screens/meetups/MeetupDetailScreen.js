import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import POIMarker from '../../components/POIMarker';
import { useApp } from '../../state/AppContext';
import { colors, spacing, radius, typography, shadows } from '../../theme';

export default function MeetupDetailScreen({ navigation, route }) {
  const { meetupId } = route?.params || {};
  const { meetups, toggleRsvp } = useApp();
  const meetup = meetups.find((m) => m.id === meetupId);

  if (!meetup) {
    return (
      <View style={styles.container}>
        <HeaderBar onBack={() => navigation.goBack()} title="Meetup" bordered />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="Meetup" bordered />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image source={{ uri: meetup.image }} style={styles.hero} />
        <View style={styles.body}>
          <Text style={styles.title}>{meetup.title}</Text>
          <Text style={styles.host}>Hosted by {meetup.host}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={colors.accent} />
            <Text style={styles.infoText}>{meetup.when}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={colors.accent} />
            <Text style={styles.infoText}>{meetup.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color={colors.accent} />
            <Text style={styles.infoText}>{meetup.attendees} going</Text>
          </View>

          <Text style={styles.about}>{meetup.description}</Text>

          <View style={styles.mapCard}>
            <MapView
              style={StyleSheet.absoluteFill}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                ...meetup.coordinate,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              scrollEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={meetup.coordinate}>
                <POIMarker category={meetup.type} />
              </Marker>
            </MapView>
          </View>

          <TouchableOpacity
            style={[styles.cta, meetup.rsvped && styles.ctaActive]}
            onPress={() => toggleRsvp(meetup.id)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={meetup.rsvped ? 'checkmark-circle' : 'add-circle-outline'}
              size={20}
              color={meetup.rsvped ? colors.white : colors.white}
            />
            <Text style={styles.ctaLabel}>
              {meetup.rsvped ? "You're going" : 'RSVP'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceMuted },
  scroll: { paddingBottom: 80 },
  hero: { width: '100%', height: 220 },
  body: { padding: spacing.base },
  title: { ...typography.h2, color: colors.textPrimary, fontWeight: '400' },
  host: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.m },
  infoText: { ...typography.body, color: colors.textPrimary, marginLeft: spacing.m },
  about: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.l,
    lineHeight: 22,
  },
  mapCard: {
    height: 160,
    borderRadius: radius.l,
    overflow: 'hidden',
    marginTop: spacing.l,
    ...shadows.cardLight,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.base,
    borderRadius: radius.pill,
    marginTop: spacing.l,
  },
  ctaActive: { backgroundColor: '#2ECC71' },
  ctaLabel: { ...typography.labelCaps, color: colors.white, marginLeft: spacing.s },
});
