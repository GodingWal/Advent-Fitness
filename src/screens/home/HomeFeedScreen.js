import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native';
import HeaderBar from '../../components/HeaderBar';
import SegmentedTabs from '../../components/SegmentedTabs';
import FeedPost from '../../components/FeedPost';
import ActiveFriendsRow from '../../components/ActiveFriendsRow';
import { feedPosts, myPosts } from '../../data/mockFeed';
import { friends } from '../../data/mockFriends';
import { useApp } from '../../state/AppContext';
import { colors, spacing, typography } from '../../theme';

const TABS = [
  { value: 'you', label: 'You' },
  { value: 'friends', label: 'Friends' },
];

export default function HomeFeedScreen({ navigation }) {
  const [tab, setTab] = useState('friends');
  const { feedExtras } = useApp();

  const posts = tab === 'friends' ? feedPosts : [...feedExtras, ...myPosts];
  const sections = posts.reduce((acc, p) => {
    acc[p.section] = acc[p.section] || [];
    acc[p.section].push(p);
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <HeaderBar
        onMenu={() => navigation.openDrawer?.()}
        rightIcon="file-tray-outline"
        rightBadge={'2'}
        onRight={() => navigation.navigate('Inbox')}
      />
      <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {tab === 'friends' ? (
          <>
            {Object.entries(sections).slice(0, 1).map(([title, items]) => (
              <View key={title}>
                <Text style={styles.section}>{title}</Text>
                {items.map((p) => <FeedPost key={p.id} post={p} />)}
              </View>
            ))}

            <Text style={styles.section}>Active Right Now</Text>
            <ActiveFriendsRow
              friends={friends.filter((f) => f.activeNow)}
              onPress={(f) => navigation.navigate('Chat', { friend: f })}
            />

            {Object.entries(sections).slice(1).map(([title, items]) => (
              <View key={title}>
                <Text style={styles.section}>{title}</Text>
                {items.map((p) => <FeedPost key={p.id} post={p} />)}
              </View>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.section}>Your Activity</Text>
            {posts.map((p) => <FeedPost key={p.id} post={p} />)}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceMuted },
  scroll: { paddingBottom: 120 },
  section: {
    ...typography.h3,
    color: colors.textPrimary,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.l,
    paddingBottom: spacing.s,
    fontWeight: '400',
  },
});
