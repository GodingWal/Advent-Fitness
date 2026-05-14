import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import { useApp } from '../../state/AppContext';
import { colors, spacing, radius, typography } from '../../theme';

const STREAK_DAYS = 7;

export default function AchievementsScreen({ navigation }) {
  const { achievements } = useApp();

  const earned = achievements.filter((a) => a.earned);
  const locked = achievements.filter((a) => !a.earned);

  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="ACHIEVEMENTS" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.streakCard}>
          <View style={styles.streakIcon}>
            <Ionicons name="flame" size={36} color="#F4A340" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.streakNumber}>{STREAK_DAYS}-Day Streak</Text>
            <Text style={styles.streakSub}>Keep moving today to extend it.</Text>
          </View>
        </View>

        <Text style={styles.section}>Earned · {earned.length}</Text>
        <View style={styles.grid}>
          {earned.map((a) => (
            <Badge key={a.id} item={a} />
          ))}
        </View>

        <Text style={styles.section}>In Progress</Text>
        <View style={styles.grid}>
          {locked.map((a) => (
            <Badge key={a.id} item={a} locked />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Badge({ item, locked }) {
  return (
    <View style={[styles.badge, locked && styles.badgeLocked]}>
      <View style={[styles.badgeIcon, locked && styles.badgeIconLocked]}>
        <Ionicons name={item.icon} size={20} color={locked ? colors.textDim : '#0A0C10'} />
      </View>
      <Text style={[styles.badgeTitle, locked && styles.badgeTitleLocked]} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.badgeDesc} numberOfLines={2}>
        {item.description}
      </Text>
      {locked && item.progress != null ? (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${item.progress * 100}%` }]} />
        </View>
      ) : null}
      {item.earnedDate ? <Text style={styles.badgeDate}>{item.earnedDate}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.edge, paddingBottom: 80 },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    padding: spacing.base,
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.s,
    backgroundColor: colors.accent2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  streakNumber: { ...typography.h4, fontSize: 22, color: colors.text },
  streakSub: { ...typography.bodySmall, fontSize: 12, color: colors.textMute, marginTop: 2 },
  section: {
    ...typography.caps,
    fontSize: 10,
    color: colors.textMute,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badge: {
    width: '48%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    padding: spacing.base,
    marginBottom: spacing.m,
    alignItems: 'flex-start',
  },
  badgeLocked: { opacity: 0.55 },
  badgeIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.s,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  badgeIconLocked: { backgroundColor: colors.surface2 },
  badgeTitle: { ...typography.body, fontSize: 14, color: colors.text, fontWeight: '600' },
  badgeTitleLocked: { color: colors.textMute },
  badgeDesc: {
    ...typography.mono,
    fontSize: 10,
    color: colors.textMute,
    marginTop: 4,
    minHeight: 28,
  },
  badgeDate: { ...typography.mono, fontSize: 10, color: colors.accent, marginTop: 4 },
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface2,
    marginTop: spacing.s,
    overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: colors.accent },
});
