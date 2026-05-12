import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import HeaderBar from '../../components/HeaderBar';
import IconBadge from '../../components/IconBadge';
import { activityHistory } from '../../data/mockActivities';
import { useApp } from '../../state/AppContext';
import { colors, spacing, radius, typography, shadows } from '../../theme';

function formatDuration(sec) {
  const m = Math.round(sec / 60);
  return `${m} min`;
}

const ActivityRow = React.memo(function ActivityRow({ item, onPress }) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.label}, ${item.location}, ${item.durationLabel}, ${item.when}`}
    >
      <IconBadge icon={item.type === 'hiking' ? 'mountain' : 'wave'} size={48} />
      <View style={styles.rowBody}>
        <Text style={styles.title}>{item.label}</Text>
        <Text style={styles.sub}>{item.location}</Text>
      </View>
      <View style={styles.rightCol}>
        <Text style={styles.dur}>{item.durationLabel}</Text>
        <Text style={styles.when}>{item.when}</Text>
      </View>
    </TouchableOpacity>
  );
});

const keyExtractor = (item) => item.id;

export default function ActivityListScreen({ navigation }) {
  const { recordedRoutes } = useApp();

  const items = useMemo(
    () => [
      ...recordedRoutes.map((r) => ({
        id: r.id,
        type: r.type,
        label: r.title,
        location:
          r.distanceMi > 0
            ? `${r.distanceMi.toFixed(2)} mi`
            : r.exercises
            ? `${r.exercises.length} exercises`
            : 'Indoor',
        durationLabel: formatDuration(r.durationSec || 0),
        when: r.when,
        route: r,
      })),
      ...activityHistory.map((h) => ({
        id: h.id,
        type: h.type,
        label: h.label,
        location: h.location,
        durationLabel: `${h.durationMin} min`,
        when: h.when,
      })),
    ],
    [recordedRoutes]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <ActivityRow
        item={item}
        onPress={() =>
          navigation.navigate('ActivityTracking', {
            activity: { ...item, title: item.label, type: item.type },
          })
        }
      />
    ),
    [navigation]
  );

  return (
    <View style={styles.container}>
      <HeaderBar onMenu={() => navigation.openDrawer?.()} title="Activity" bordered />
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.scroll}
        renderItem={renderItem}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceMuted },
  scroll: { padding: spacing.base, paddingBottom: 120 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.base,
    marginBottom: spacing.m,
    ...shadows.cardLight,
  },
  rowBody: { flex: 1, marginLeft: spacing.base },
  title: { ...typography.body, color: colors.textPrimary, fontWeight: '500' },
  sub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  rightCol: { alignItems: 'flex-end' },
  dur: { ...typography.body, color: colors.accent, fontWeight: '500' },
  when: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});
