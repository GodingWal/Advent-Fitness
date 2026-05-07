import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import HeaderBar from '../../components/HeaderBar';
import IconBadge from '../../components/IconBadge';
import OutlineButton from '../../components/OutlineButton';
import FriendRequestModal from '../../components/FriendRequestModal';
import { mockUser } from '../../data/mockUser';
import { friends, pendingFriendRequests } from '../../data/mockFriends';
import { colors, spacing, typography } from '../../theme';

export default function ProfileScreen({ navigation }) {
  const [showRequest, setShowRequest] = useState(false);
  const pending = pendingFriendRequests[0];

  return (
    <View style={styles.container}>
      <HeaderBar
        onMenu={() => navigation.openDrawer?.()}
        rightIcon="file-tray-outline"
        rightBadge={'2'}
        onRight={() => navigation.navigate('Inbox')}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <ImageBackground source={{ uri: mockUser.cover }} style={styles.cover}>
          <View style={styles.coverOverlay} />
          <View style={styles.coverInner}>
            <View style={styles.left}>
              <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
              <Text style={styles.name}>{mockUser.name}</Text>
              <Text style={styles.location}>{mockUser.location}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.kicker}>TOP ACTIVITIES</Text>
              <View style={styles.topList}>
                <View style={styles.topRow}>
                  <IconBadge icon="wave" size={66} />
                  <Text style={styles.topLabel}>Surfing</Text>
                </View>
                <View style={[styles.topRow, { marginTop: spacing.l }]}>
                  <IconBadge icon="mountain" size={66} />
                  <Text style={styles.topLabel}>Hiking</Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.body}>
          <View style={{ alignSelf: 'flex-start' }}>
            <OutlineButton
              label="Edit Profile"
              color={colors.divider}
              textStyle={{ color: colors.textSecondary }}
              onPress={() => navigation.navigate('EditProfile')}
            />
          </View>

          <View style={styles.friendsHeader}>
            <Text style={styles.friendsTitle}>Cody's Friends</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.seeAll}>See All Cody's Friends ›</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friendsRow}>
            {friends.map((f) => (
              <View key={f.id} style={styles.friend}>
                <View style={styles.ring}>
                  <Image source={{ uri: f.avatar }} style={styles.friendAvatar} />
                </View>
                <Text style={styles.friendName}>{f.shortName?.toUpperCase()}</Text>
              </View>
            ))}
          </ScrollView>

          {pending ? (
            <TouchableOpacity
              style={styles.requestBanner}
              onPress={() => setShowRequest(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.requestText}>
                {`${pending.from.firstName} ${pending.from.lastName} sent you a friend request`}
              </Text>
              <Text style={styles.requestCta}>VIEW</Text>
            </TouchableOpacity>
          ) : null}
        </View>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceMuted },
  scroll: { paddingBottom: 120 },
  cover: { width: '100%', minHeight: 280 },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,30,40,0.4)' },
  coverInner: { flexDirection: 'row', padding: spacing.l, paddingTop: spacing.xxxl },
  left: { flex: 1, alignItems: 'flex-start' },
  avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: spacing.base },
  name: { ...typography.h2, color: colors.white, fontWeight: '400' },
  location: { ...typography.body, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  right: { width: 130, alignItems: 'center' },
  kicker: { ...typography.labelCapsSmall, color: 'rgba(255,255,255,0.85)', marginBottom: spacing.m },
  topList: {},
  topRow: { alignItems: 'center' },
  topLabel: { ...typography.body, color: colors.white, marginTop: 4 },
  body: { padding: spacing.base },
  friendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.l,
  },
  friendsTitle: { ...typography.h3, color: colors.textPrimary, fontWeight: '400' },
  seeAll: { ...typography.bodySmall, color: colors.textSecondary },
  friendsRow: { paddingVertical: spacing.m },
  friend: { alignItems: 'center', marginRight: spacing.base, width: 88 },
  ring: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: colors.accent,
    padding: 3,
    backgroundColor: colors.surface,
  },
  friendAvatar: { width: '100%', height: '100%', borderRadius: 33 },
  friendName: { ...typography.labelCapsSmall, color: colors.textSecondary, marginTop: 6, textAlign: 'center' },
  requestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: 12,
    marginTop: spacing.l,
  },
  requestText: { ...typography.bodySmall, color: colors.textPrimary, flex: 1 },
  requestCta: { ...typography.labelCapsSmall, color: colors.accent, marginLeft: spacing.s },
});
