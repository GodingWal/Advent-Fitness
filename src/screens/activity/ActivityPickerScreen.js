import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import IconBadge from '../../components/IconBadge';
import { Caps, Tag } from '../../components/VoltPrimitives';
import { colors, spacing, radius, typography } from '../../theme';

// VOLT Track Activity sheet — drag handle, Caps "CHOOSE YOUR ARENA",
// 26px "What's the session?", 4-column grid of 8 activity tiles.
const TILES = [
  { type: 'surfing', label: 'Surf', icon: 'wave' },
  { type: 'hiking', label: 'Hike', icon: 'mountain' },
  { type: 'running', label: 'Run', icon: 'run' },
  { type: 'cycling', label: 'Cycle', icon: 'bike' },
  { type: 'yoga', label: 'Yoga', icon: 'yoga' },
  { type: 'meditation', label: 'Meditate', icon: 'meditate' },
  { type: 'weightLifting', label: 'Lift', icon: 'weight' },
  { type: 'swimming', label: 'Swim', icon: 'wave' },
];

export default function ActivityPickerScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const start = (item) => {
    if (item.type === 'weightLifting') {
      navigation.replace('IndoorWorkout');
    } else {
      navigation.replace('ActivityTracking', {
        activity: {
          title: item.label,
          type: item.type,
          image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&q=80',
        },
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.s }]}>
      <View style={styles.handleRow}>
        <View style={styles.handle} />
      </View>

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.body}>
        <Caps size={10} color={colors.textMute}>
          Choose your arena
        </Caps>
        <Text style={styles.title}>{`What's the session?`}</Text>

        <View style={styles.grid}>
          {TILES.map((it) => (
            <View key={it.type} style={styles.tileWrap}>
              <TouchableOpacity style={styles.tile} onPress={() => start(it)} activeOpacity={0.85}>
                <IconBadge
                  icon={it.icon}
                  size={26}
                  bg="transparent"
                  border="transparent"
                  color={colors.text}
                />
                <Caps size={10} color={colors.text} style={styles.tileLabel}>
                  {it.label}
                </Caps>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.importRow}
        >
          <Caps size={10} color={colors.textMute} style={{ marginRight: spacing.m }}>
            Or Import
          </Caps>
          <Tag label="GPX" style={{ marginRight: 6 }} />
          <Tag label="Garmin" style={{ marginRight: 6 }} />
          <Tag label="Watch" />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgAlt },
  handleRow: { alignItems: 'center', paddingVertical: spacing.s },
  handle: { width: 40, height: 3, backgroundColor: colors.line, borderRadius: 0 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.edge,
    paddingBottom: spacing.s,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.edge,
    paddingTop: spacing.m,
  },
  title: {
    ...typography.h4,
    fontSize: 26,
    color: colors.text,
    marginTop: spacing.s,
    marginBottom: spacing.l,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  tileWrap: {
    width: '25%',
    aspectRatio: 1,
    padding: 4,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    padding: spacing.s,
    justifyContent: 'space-between',
  },
  tileLabel: { marginTop: 'auto' },
  importRow: { marginTop: spacing.l, alignItems: 'center' },
});
