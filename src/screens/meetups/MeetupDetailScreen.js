import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import POIMarker from '../../components/POIMarker';
import { Caps, Mono } from '../../components/VoltPrimitives';
import { useApp } from '../../state/AppContext';
import { colors, spacing, radius, typography } from '../../theme';

export default function MeetupDetailScreen({ navigation, route }) {
  const { meetupId } = route?.params || {};
  const { meetups, toggleRsvp } = useApp();
  const meetup = meetups.find((m) => m.id === meetupId);

  if (!meetup) {
    return (
      <View style={styles.container}>
        <HeaderBar onBack={() => navigation.goBack()} title="MEETUP" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="MEETUP" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image source={{ uri: meetup.image }} style={styles.hero} />
        <View style={styles.body}>
          <Caps size={10} color={colors.textMute}>
            Hosted by {meetup.host}
          </Caps>
          <Text style={styles.title}>{meetup.title}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.accent} />
            <Text style={styles.infoText}>{meetup.when}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={colors.accent} />
            <Text style={styles.infoText}>{meetup.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color={colors.accent} />
            <Mono size={13}>{`${meetup.attendees} going`}</Mono>
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
              size={18}
              color="#0A0C10"
            />
            <Text style={styles.ctaLabel}>{meetup.rsvped ? "YOU'RE GOING" : 'RSVP'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 80 },
  hero: { width: '100%', height: 220 },
  body: { padding: spacing.edge },
  title: {
    ...typography.h2,
    color: colors.text,
    marginTop: 4,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.m },
  infoText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.m,
  },
  about: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMute,
    marginTop: spacing.l,
    lineHeight: 22,
  },
  mapCard: {
    height: 160,
    borderRadius: radius.l,
    overflow: 'hidden',
    marginTop: spacing.l,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.base,
    borderRadius: radius.m,
    marginTop: spacing.l,
  },
  ctaActive: { backgroundColor: colors.accent3 },
  ctaLabel: {
    ...typography.caps,
    fontSize: 12,
    color: '#0A0C10',
    fontWeight: '700',
    marginLeft: spacing.s,
  },
});
