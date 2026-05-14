import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BrandStrip, Caps, SectionHeader } from '../../components/VoltPrimitives';
import SearchField from '../../components/SearchField';
import ActivityCard from '../../components/ActivityCard';
import POIFilterChip from '../../components/POIFilterChip';
import { popularActivities, recommendedActivities } from '../../data/mockActivities';
import { colors, spacing, typography } from '../../theme';

const CATEGORIES = ['ALL', 'OUTDOOR', 'STRENGTH', 'MOBILITY', 'WATER', 'TEAM'];

// VOLT discover — BrandStrip + compact header, search field, category chips,
// Today's pick hero card, popular spots horizontal, built-for-you grid.
export default function DiscoverScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('ALL');
  const featured = recommendedActivities[0];

  return (
    <View style={styles.container}>
      <BrandStrip
        right={
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              hitSlop={10}
              style={styles.headerBtn}
              onPress={() => navigation.navigate('Inbox')}
            >
              <Ionicons name="file-tray-outline" size={20} color={colors.text} />
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
            Discover
          </Caps>
          <Text style={styles.h2}>Explore.</Text>
        </View>

        <View style={styles.searchWrap}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Spots, drills, programs…"
            onSubmit={() => {}}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {CATEGORIES.map((c) => (
            <POIFilterChip key={c} label={c} active={cat === c} onPress={() => setCat(c)} />
          ))}
        </ScrollView>

        <SectionHeader kicker="Today's Pick" title="Featured" />
        {featured ? (
          <View style={{ paddingHorizontal: spacing.edge }}>
            <ActivityCard
              variant="wide"
              title={featured.title}
              sublabel="SERIES · 14 SESSIONS"
              image={featured.image}
              height={260}
              onPress={() => navigation.navigate('ActivityTracking', { activity: featured })}
            />
          </View>
        ) : null}

        <SectionHeader kicker="Popular" title="Spots" action="SEE ALL →" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardRow}
        >
          {popularActivities.map((a) => (
            <ActivityCard
              key={a.id}
              title={a.title}
              sublabel={a.sublabel}
              image={a.image}
              width={170}
              onPress={() => navigation.navigate('ActivityTracking', { activity: a })}
            />
          ))}
        </ScrollView>

        <SectionHeader kicker="Built For You" title="Programs" />
        <View style={styles.programGrid}>
          {recommendedActivities.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.programCard}
              onPress={() => navigation.navigate('ActivityTracking', { activity: a })}
              activeOpacity={0.85}
            >
              <ActivityCard title={a.title} sublabel={a.sublabel} image={a.image} width="100%" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 140 },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  headerRow: {
    paddingHorizontal: spacing.edge,
    paddingTop: spacing.s,
    paddingBottom: spacing.base,
  },
  h2: { ...typography.h2, color: colors.text, marginTop: 4 },
  searchWrap: { paddingHorizontal: spacing.edge, marginTop: spacing.s },
  chipRow: {
    paddingHorizontal: spacing.edge,
    paddingVertical: spacing.base,
  },
  cardRow: { paddingHorizontal: spacing.edge, paddingBottom: spacing.m },
  programGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.edge - 3,
  },
  programCard: {
    width: '50%',
    paddingHorizontal: 3,
    marginBottom: spacing.m,
  },
});
