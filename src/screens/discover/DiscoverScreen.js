import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import SearchField from '../../components/SearchField';
import ActivityCard from '../../components/ActivityCard';
import { popularActivities, recommendedActivities } from '../../data/mockActivities';
import { colors, spacing, typography } from '../../theme';

const featured = [...popularActivities, ...popularActivities.map((a) => ({ ...a, id: a.id + 'b' }))];

export default function DiscoverScreen({ navigation }) {
  const [query, setQuery] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <HeaderBar
        onMenu={() => navigation.openDrawer?.()}
        rightIcon="file-tray-outline"
        rightBadge={'2'}
        onRight={() => navigation.navigate('Inbox')}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroBand}>
          <Text style={styles.title}>{'Discover\nActivities'}</Text>
          <View style={styles.divider} />
          <Text style={styles.sub}>Discover fun new activities below:</Text>
        </View>

        <View style={styles.searchWrap}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Search Activities"
            onSubmit={() => {}}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Near You</Text>
          <TouchableOpacity
            style={styles.seeAll}
            onPress={() => navigation.navigate('Recommended')}
          >
            <Text style={styles.seeAllText}>See All Activities</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
          {popularActivities.map((a) => (
            <ActivityCard
              key={a.id}
              title={a.title}
              sublabel={a.sublabel.toUpperCase()}
              image={a.image}
              icon={a.type === 'hiking' ? 'mountain' : 'wave'}
              width={200}
              height={260}
              onPress={() => navigation.navigate('ActivityTracking', { activity: a })}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Activities</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
          {featured.map((a) => (
            <ActivityCard
              key={a.id}
              title={a.title}
              sublabel={a.sublabel.toUpperCase()}
              image={a.image}
              icon={a.type === 'hiking' ? 'mountain' : 'wave'}
              width={200}
              height={260}
              onPress={() => navigation.navigate('ActivityTracking', { activity: a })}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended</Text>
        </View>
        <View style={{ paddingHorizontal: spacing.base }}>
          {recommendedActivities.map((a) => (
            <ActivityCard
              key={a.id}
              variant="wide"
              title={a.title}
              sublabel={a.sublabel}
              image={a.image}
              height={180}
              onPress={() => navigation.navigate('ActivityTracking', { activity: a })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceMuted },
  scroll: { paddingBottom: 120 },
  heroBand: {
    backgroundColor: colors.accentTeal,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.l,
    paddingBottom: spacing.xxxl,
  },
  title: { ...typography.h1, color: colors.textOnDark },
  divider: { width: 28, height: 1, backgroundColor: colors.textOnDark, marginVertical: spacing.s, opacity: 0.85 },
  sub: { ...typography.body, color: colors.textOnDark, opacity: 0.95 },
  searchWrap: { paddingHorizontal: spacing.base, marginTop: -spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    marginTop: spacing.xl,
    marginBottom: spacing.s,
  },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, fontWeight: '400' },
  seeAll: { flexDirection: 'row', alignItems: 'center' },
  seeAllText: { ...typography.bodySmall, color: colors.textSecondary, marginRight: 4 },
  cardRow: { paddingHorizontal: spacing.base, paddingBottom: spacing.l },
});
