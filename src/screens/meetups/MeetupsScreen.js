import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import { useApp } from '../../state/AppContext';
import { colors, spacing, radius, typography, shadows } from '../../theme';

export default function MeetupsScreen({ navigation }) {
  const { meetups } = useApp();

  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="Group Meetups" bordered />
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
                    <Ionicons name="checkmark" size={12} color={colors.white} />
                    <Text style={styles.rsvpedText}>RSVP'd</Text>
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
  container: { flex: 1, backgroundColor: colors.surfaceMuted },
  scroll: { padding: spacing.base, paddingBottom: 80 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    overflow: 'hidden',
    marginBottom: spacing.base,
    ...shadows.card,
  },
  image: { width: '100%', height: 140 },
  body: { padding: spacing.base },
  title: { ...typography.h3, color: colors.textPrimary, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.s },
  rowText: { ...typography.bodySmall, color: colors.textSecondary, marginLeft: 6 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.m },
  attendees: { ...typography.bodySmall, color: colors.accent, marginLeft: 6, fontWeight: '500' },
  rsvpedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  rsvpedText: { ...typography.caption, color: colors.white, marginLeft: 4, fontWeight: '600' },
});
