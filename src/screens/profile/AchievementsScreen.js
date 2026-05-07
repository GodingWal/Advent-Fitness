import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import { useApp } from '../../state/AppContext';
import { colors, spacing, radius, typography, shadows } from '../../theme';

const STREAK_DAYS = 7;

export default function AchievementsScreen({ navigation }) {
  const { achievements } = useApp();

  const earned = achievements.filter((a) => a.earned);
  const locked = achievements.filter((a) => !a.earned);

  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="Achievements" bordered />
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
        <Ionicons
          name={item.icon}
          size={28}
          color={locked ? colors.textMuted : colors.accent}
        />
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
  container: { flex: 1, backgroundColor: colors.surfaceMuted },
  scroll: { padding: spacing.base, paddingBottom: 80 },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.base,
    ...shadows.card,
  },
  streakIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  streakNumber: { ...typography.h2, color: colors.textPrimary, fontWeight: '500' },
  streakSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  section: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    marginTop: spacing.xl,
    marginBottom: spacing.s,
    fontSize: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badge: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.base,
    marginBottom: spacing.m,
    alignItems: 'center',
    ...shadows.cardLight,
  },
  badgeLocked: { opacity: 0.85 },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  badgeIconLocked: { backgroundColor: colors.surfaceMuted },
  badgeTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '500' },
  badgeTitleLocked: { color: colors.textSecondary },
  badgeDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    minHeight: 32,
  },
  badgeDate: { ...typography.caption, color: colors.accent, marginTop: 4 },
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    marginTop: spacing.s,
    overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: colors.accent },
});
