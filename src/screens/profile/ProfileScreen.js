import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BrandStrip, Caps, Mono, SectionHeader, Tag } from '../../components/VoltPrimitives';
import IconBadge from '../../components/IconBadge';
import FriendRequestModal from '../../components/FriendRequestModal';
import { mockUser } from '../../data/mockUser';
import { friends, pendingFriendRequests } from '../../data/mockFriends';
import { colors, spacing, radius, typography } from '../../theme';

const TOP_ACTIVITY_LABEL = {
  surfing: 'Surf',
  hiking: 'Hike',
  running: 'Run',
  cycling: 'Cycle',
  yoga: 'Yoga',
  meditation: 'Meditate',
  weightLifting: 'Lift',
  lifting: 'Lift',
};

// VOLT profile — BrandStrip + compact header, identity row with L4 badge,
// 3-col stat strip, activity heatmap, badges grid, friends row.
export default function ProfileScreen({ navigation }) {
  const [showRequest, setShowRequest] = useState(false);
  const pending = pendingFriendRequests[0];

  // 84-cell heatmap (12 wk × 7 days) with 4 opacity buckets.
  const cells = React.useMemo(
    () =>
      Array.from({ length: 84 }, (_, i) => {
        const seed = (i * 9301 + 49297) % 233280;
        const r = seed / 233280;
        if (r < 0.35) return 0;
        if (r < 0.6) return 0.35;
        if (r < 0.85) return 0.65;
        return 1.0;
      }),
    []
  );

  return (
    <View style={styles.container}>
      <BrandStrip
        right={
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              hitSlop={10}
              style={styles.headerBtn}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="create-outline" size={20} color={colors.text} />
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

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Caps size={10} color={colors.textMute}>
            Profile · L{mockUser.level}
          </Caps>
          <Text style={styles.h2}>Me.</Text>
        </View>

        <View style={styles.identityRow}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>L{mockUser.level}</Text>
            </View>
          </View>
          <View style={styles.identityBody}>
            <Text style={styles.name}>{mockUser.name}</Text>
            <Mono
              size={11}
              style={{ marginTop: 4 }}
            >{`@${mockUser.handle} · ${mockUser.location}`}</Mono>
            <View style={styles.tags}>
              {mockUser.topActivities.map((a, i) => (
                <Tag
                  key={a}
                  label={TOP_ACTIVITY_LABEL[a] || a}
                  accent={i === 0}
                  style={{ marginRight: 6 }}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.statCard}>
          <StatCol label="Streak" value={`${mockUser.streakDays}`} unit="d" />
          <View style={styles.statDivider} />
          <StatCol label="Sessions" value={`${mockUser.sessionsThisMonth}`} unit="/m" />
          <View style={styles.statDivider} />
          <StatCol label="Friends" value={`${friends.length}`} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Caps size={10}>Activity Heatmap</Caps>
            <Mono size={10}>Last 12 wk</Mono>
          </View>
          <View style={styles.heatmap}>
            {Array.from({ length: 12 }).map((_, col) => (
              <View key={col} style={styles.heatCol}>
                {Array.from({ length: 7 }).map((__, row) => {
                  const value = cells[col * 7 + row];
                  return (
                    <View
                      key={row}
                      style={[styles.heatCell, { backgroundColor: heatColor(value) }]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        <SectionHeader kicker="Badges" title="Earned" />
        <View style={styles.badgeGrid}>
          {[
            { name: 'Bolt 100', sub: '100 sessions' },
            { name: 'Tide', sub: 'Sunrise streak' },
            { name: 'Iron', sub: 'Squat PR' },
          ].map((b) => (
            <View key={b.name} style={styles.badgeTile}>
              <View style={styles.badgeMark}>
                <IconBadge
                  icon="bolt"
                  size={20}
                  color="#0A0C10"
                  bg="transparent"
                  border="transparent"
                />
              </View>
              <Text style={styles.badgeTitle}>{b.name}</Text>
              <Mono size={10}>{b.sub}</Mono>
            </View>
          ))}
        </View>

        <SectionHeader kicker="Friends" title="Circle" action="SEE ALL →" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.friendsRow}
        >
          {friends.map((f) => (
            <View key={f.id} style={styles.friend}>
              <Image source={{ uri: f.avatar }} style={styles.friendAvatar} />
              <Caps size={9} color={colors.textMute} style={{ marginTop: 6, textAlign: 'center' }}>
                {f.firstName}
              </Caps>
            </View>
          ))}
        </ScrollView>

        {pending ? (
          <TouchableOpacity
            style={styles.requestBanner}
            onPress={() => setShowRequest(true)}
            activeOpacity={0.85}
          >
            <View style={{ flex: 1 }}>
              <Caps size={10} color={colors.accent}>
                Friend Request
              </Caps>
              <Text style={styles.requestText}>
                {`${pending.from.firstName} ${pending.from.lastName}`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text} />
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <FriendRequestModal
        visible={showRequest}
        friend={pending?.from}
        onApprove={() => setShowRequest(false)}
        onRemove={() => setShowRequest(false)}
        onClose={() => setShowRequest(false)}
      />
    </View>
  );
}

function StatCol({ label, value, unit }) {
  return (
    <View style={styles.statCol}>
      <Caps size={9} color={colors.textMute}>
        {label}
      </Caps>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
        <Mono size={26} color={colors.text} weight="500">
          {value}
        </Mono>
        {unit ? (
          <Mono size={11} color={colors.textMute} style={{ marginLeft: 4 }}>
            {unit}
          </Mono>
        ) : null}
      </View>
    </View>
  );
}

function heatColor(intensity) {
  if (!intensity) return colors.surface2;
  return `rgba(212,255,61,${intensity})`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  scroll: { paddingBottom: 140 },
  headerRow: {
    paddingHorizontal: spacing.edge,
    paddingTop: spacing.s,
    paddingBottom: spacing.base,
  },
  h2: { ...typography.h2, color: colors.text, marginTop: 4 },
  identityRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.edge,
    marginTop: spacing.s,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: radius.m,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.s,
  },
  levelText: {
    ...typography.capsSm,
    color: '#0A0C10',
    fontSize: 10,
    fontWeight: '700',
  },
  identityBody: { flex: 1, marginLeft: spacing.base },
  name: { ...typography.title, fontSize: 22, color: colors.text },
  tags: { flexDirection: 'row', marginTop: spacing.s },
  statCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    paddingVertical: spacing.base,
    marginHorizontal: spacing.edge,
    marginTop: spacing.l,
  },
  statCol: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: colors.lineSoft },
  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    marginHorizontal: spacing.edge,
    marginTop: spacing.l,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  heatmap: { flexDirection: 'row', justifyContent: 'space-between' },
  heatCol: { gap: 3 },
  heatCell: {
    width: 14,
    height: 14,
    borderRadius: 2,
    marginBottom: 3,
  },
  badgeGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.edge,
    marginTop: spacing.s,
  },
  badgeTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    padding: spacing.base,
    marginHorizontal: 3,
  },
  badgeMark: {
    width: 28,
    height: 28,
    backgroundColor: colors.accent,
    borderRadius: radius.s,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  badgeTitle: { ...typography.body, fontSize: 14, color: colors.text, fontWeight: '600' },
  friendsRow: { paddingHorizontal: spacing.edge, paddingVertical: spacing.m },
  friend: { width: 56, marginRight: spacing.m, alignItems: 'center' },
  friendAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.s,
  },
  requestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    borderRadius: radius.l,
    marginHorizontal: spacing.edge,
    marginTop: spacing.l,
  },
  requestText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
    marginTop: 4,
    fontWeight: '500',
  },
});
