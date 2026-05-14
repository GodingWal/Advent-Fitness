import React from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandStrip, Caps, Mono, SectionHeader } from '../../components/VoltPrimitives';
import FeedPost from '../../components/FeedPost';
import ActiveFriendsRow from '../../components/ActiveFriendsRow';
import IconBadge from '../../components/IconBadge';
import { feedPosts } from '../../data/mockFeed';
import { friends } from '../../data/mockFriends';
import { mockUser } from '../../data/mockUser';
import { colors, spacing, radius, typography, shadows } from '../../theme';

const QUICK_START = [
  { type: 'surfing', label: 'Surf', icon: 'wave' },
  { type: 'running', label: 'Run', icon: 'run' },
  { type: 'hiking', label: 'Hike', icon: 'mountain' },
  { type: 'weightLifting', label: 'Lift', icon: 'weight' },
];

const formatDate = (d) =>
  d.toLocaleString('en-US', { month: 'short', day: 'numeric' }).toUpperCase().replace(',', '');

// VOLT home screen — BrandStrip, hero accent card with streak + REC, quick start
// row, live circle, then sectioned feed.
export default function HomeFeedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const sections = feedPosts.reduce((acc, p) => {
    acc[p.section] = acc[p.section] || [];
    acc[p.section].push(p);
    return acc;
  }, {});

  const liveCircle = friends
    .filter((f) => f.activeNow)
    .map((f) => ({ ...f, activity: 'Surf · 22m' }));

  const liveCount = liveCircle.length;
  const today = formatDate(new Date());

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <BrandStrip
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity hitSlop={10} style={styles.headerBtn}>
              <Ionicons name="search-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              hitSlop={10}
              style={styles.headerBtn}
              onPress={() => navigation.navigate('Inbox')}
            >
              <Ionicons name="file-tray-outline" size={20} color={colors.text} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              hitSlop={10}
              style={styles.headerBtn}
              onPress={() => navigation.openDrawer?.()}
            >
              <Ionicons name="menu" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 140 + insets.bottom }]}>
        <View style={styles.headerRow}>
          <View>
            <Caps size={10} color={colors.textMute}>
              Today · {today}
            </Caps>
            <Text style={styles.h2}>Hey, {mockUser.firstName}.</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <Caps size={10} color="rgba(10,12,16,0.7)">
            Current Streak · {mockUser.streakDays} Days
          </Caps>
          <Text style={styles.heroMsg}>{`One more session\nand you're ahead\nof your week.`}</Text>
          <View style={styles.heroFooter}>
            <View style={styles.heroStat}>
              <Caps size={9} color="rgba(10,12,16,0.55)">
                This Wk
              </Caps>
              <Mono size={18} color="#0A0C10" weight="600" style={{ marginTop: 4 }}>
                {mockUser.weeklyDoneH}h
              </Mono>
            </View>
            <View style={styles.heroStat}>
              <Caps size={9} color="rgba(10,12,16,0.55)">
                Target
              </Caps>
              <Mono size={18} color="#0A0C10" weight="600" style={{ marginTop: 4 }}>
                {mockUser.weeklyTargetH}h
              </Mono>
            </View>
            <TouchableOpacity
              style={styles.recPill}
              onPress={() => navigation.navigate('ActivityPicker')}
              activeOpacity={0.85}
            >
              <View style={styles.recDot} />
              <Text style={styles.recLabel}>REC</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.row, { marginTop: spacing.l, paddingHorizontal: spacing.edge }]}>
          <Caps size={10}>Quick Start</Caps>
          <View style={{ flex: 1 }} />
          <Caps size={10} color={colors.accent}>
            {liveCount} Live
          </Caps>
        </View>

        <View style={styles.quickRow}>
          {QUICK_START.map((it) => (
            <TouchableOpacity
              key={it.type}
              style={styles.quickTile}
              onPress={() =>
                navigation.navigate('ActivityTracking', {
                  activity: { title: it.label, type: it.type },
                })
              }
              activeOpacity={0.85}
            >
              <IconBadge icon={it.icon} size={28} bg="transparent" border="transparent" />
              <Caps size={10} color={colors.text} style={{ marginTop: 8 }}>
                {it.label}
              </Caps>
            </TouchableOpacity>
          ))}
        </View>

        <SectionHeader kicker="Live Now" title="Your Circle" action="SEE ALL →" />
        <ActiveFriendsRow
          friends={liveCircle}
          onPress={(f) => navigation.navigate('Chat', { friend: f })}
        />

        {Object.entries(sections).map(([title, items]) => (
          <View key={title}>
            <SectionHeader kicker={title} title={title === 'Yesterday' ? 'Yesterday' : 'Today'} />
            {items.map((p) => (
              <FeedPost key={p.id} post={p} />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 120 },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 4,
    minWidth: 14,
    height: 14,
    backgroundColor: colors.accent,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.capsSm,
    fontSize: 8,
    color: '#0A0C10',
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.edge,
    paddingTop: spacing.s,
    paddingBottom: spacing.base,
  },
  h2: {
    ...typography.h2,
    color: colors.text,
    marginTop: 4,
  },
  heroCard: {
    marginHorizontal: spacing.edge,
    marginTop: spacing.s,
    backgroundColor: colors.accent,
    borderRadius: radius.l,
    paddingHorizontal: spacing.edge,
    paddingVertical: spacing.l,
    ...shadows.hero,
  },
  heroMsg: {
    ...typography.h3,
    fontSize: 26,
    lineHeight: 30,
    color: '#0A0C10',
    marginTop: spacing.s,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.l,
  },
  heroStat: { marginRight: spacing.l },
  recPill: {
    marginLeft: 'auto',
    backgroundColor: '#0A0C10',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.m,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 8,
  },
  recLabel: {
    ...typography.caps,
    fontSize: 11,
    color: colors.accent,
    fontWeight: '700',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  quickRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.edge,
    marginTop: spacing.s,
  },
  quickTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    paddingVertical: spacing.m,
    alignItems: 'center',
    marginHorizontal: 3,
  },
});
