import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import { useApp } from '../../state/AppContext';
import { colors, spacing, radius, typography } from '../../theme';

export default function MeetupsScreen({ navigation }) {
  const { meetups } = useApp();

  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="MEETUPS" />
      <FlatList
        data={meetups}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.scroll}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('MeetupDetail', { meetupId: item.id })}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.body}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.row}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.rowText}>{item.location}</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.rowText}>{item.when}</Text>
              </View>
              <View style={styles.foot}>
                <View style={styles.row}>
                  <Ionicons name="people-outline" size={14} color={colors.accent} />
                  <Text style={styles.attendees}>{item.attendees} going</Text>
                </View>
                {item.rsvped ? (
                  <View style={styles.rsvpedBadge}>
                    <Ionicons name="checkmark" size={12} color="#0A0C10" />
                    <Text style={styles.rsvpedText}>{`RSVP'd`}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.edge, paddingBottom: 80 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: 'hidden',
    marginBottom: spacing.m,
  },
  image: { width: '100%', height: 140 },
  body: { padding: spacing.base },
  title: { ...typography.h4, fontSize: 22, color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.s },
  rowText: { ...typography.bodySmall, fontSize: 12, color: colors.textMute, marginLeft: 6 },
  foot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.m,
  },
  attendees: {
    ...typography.mono,
    fontSize: 12,
    color: colors.accent,
    marginLeft: 6,
  },
  rsvpedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: radius.s,
  },
  rsvpedText: {
    ...typography.capsSm,
    color: '#0A0C10',
    marginLeft: 4,
    fontWeight: '700',
  },
});
