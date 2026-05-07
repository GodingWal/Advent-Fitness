import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import IconBadge from '../../components/IconBadge';
import { colors, spacing, radius, typography, shadows } from '../../theme';

const OUTDOOR = [
  { type: 'hiking', label: 'Hiking', icon: 'mountain', subtitle: 'GPS route + elevation' },
  { type: 'running', label: 'Running', icon: 'wave', subtitle: 'GPS · pace · distance' },
  { type: 'cycling', label: 'Cycling', icon: 'wave', subtitle: 'GPS · speed · distance' },
  { type: 'surfing', label: 'Surfing', icon: 'wave', subtitle: 'GPS · session timer' },
];

const INDOOR = [
  { type: 'weightLifting', label: 'Strength', icon: 'mountain', subtitle: 'Sets · reps · weight' },
  { type: 'yoga', label: 'Yoga', icon: 'mountain', subtitle: 'Timed session' },
  { type: 'meditation', label: 'Meditation', icon: 'mountain', subtitle: 'Timed session' },
];

export default function ActivityPickerScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const startOutdoor = (item) => {
    navigation.replace('ActivityTracking', {
      activity: { title: item.label, type: item.type, image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&q=80' },
    });
  };

  const startIndoor = (item) => {
    if (item.type === 'weightLifting') {
      navigation.replace('IndoorWorkout');
    } else {
      navigation.replace('ActivityTracking', {
        activity: { title: item.label, type: item.type, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80' },
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Start an Activity</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.section}>OUTDOOR</Text>
        {OUTDOOR.map((it) => (
          <TouchableOpacity
            key={it.type}
            style={styles.row}
            activeOpacity={0.85}
            onPress={() => startOutdoor(it)}
          >
            <IconBadge icon={it.icon} size={48} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{it.label}</Text>
              <Text style={styles.rowSub}>{it.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}

        <Text style={styles.section}>INDOOR</Text>
        {INDOOR.map((it) => (
          <TouchableOpacity
            key={it.type}
            style={styles.row}
            activeOpacity={0.85}
            onPress={() => startIndoor(it)}
          >
            <IconBadge icon={it.icon} size={48} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{it.label}</Text>
              <Text style={styles.rowSub}>{it.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDark },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.m,
  },
  title: { ...typography.h3, color: colors.white, fontWeight: '500' },
  scroll: { padding: spacing.base, paddingBottom: 80 },
  section: {
    ...typography.labelCapsSmall,
    color: 'rgba(255,255,255,0.6)',
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.base,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  rowBody: { flex: 1, marginLeft: spacing.base },
  rowTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '500' },
  rowSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
});
