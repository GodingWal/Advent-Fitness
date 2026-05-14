import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import {
  BrandStrip,
  Caps,
  Mono,
  ProgressBar,
  SectionHeader,
} from '../../components/VoltPrimitives';
import IconBadge from '../../components/IconBadge';
import { activityHistory } from '../../data/mockActivities';
import { useApp } from '../../state/AppContext';
import { colors, spacing, radius, typography } from '../../theme';

function formatDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}`;
  const ss = sec % 60;
  return `${m}:${String(ss).padStart(2, '0')}`;
}

const ICONS = {
  hiking: 'mountain',
  surfing: 'wave',
  running: 'run',
  cycling: 'bike',
  weightLifting: 'weight',
  yoga: 'yoga',
};

// VOLT Stats screen — BrandStrip + compact header "Output.", big mono timer,
// daily chart card, 2×2 stat tiles, by-activity card, recent log section.
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_VALUES = [42, 58, 0, 76, 90, 24, 110];

const ActivityRow = React.memo(function ActivityRow({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.85} onPress={onPress}>
      <IconBadge icon={ICONS[item.type] || 'wave'} size={36} bg={colors.surface} />
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{item.label}</Text>
        <Mono size={11}>{`${item.location} · ${item.when}`}</Mono>
      </View>
      <Mono size={14} color={colors.accent} weight="500">
        {item.durationLabel}
      </Mono>
    </TouchableOpacity>
  );
});

const keyExtractor = (item) => item.id;

export default function ActivityListScreen({ navigation }) {
  const { recordedRoutes } = useApp();
  const maxDay = Math.max(...DAY_VALUES, 1);

  const items = useMemo(
    () => [
      ...recordedRoutes.map((r) => ({
        id: r.id,
        type: r.type,
        label: r.title,
        location: r.distanceMi > 0 ? `${r.distanceMi.toFixed(2)} mi` : 'Indoor',
        durationLabel: formatDuration(r.durationSec || 0),
        when: r.when,
        route: r,
      })),
      ...activityHistory.map((h) => ({
        id: h.id,
        type: h.type,
        label: h.label,
        location: h.location,
        durationLabel: `${h.durationMin}m`,
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
      <BrandStrip />
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <Caps size={10} color={colors.textMute}>
                Stats · This week
              </Caps>
              <Text style={styles.h2}>Output.</Text>
            </View>

            <View style={styles.bigTimer}>
              <Text style={styles.timerVal}>6:22</Text>
              <Caps size={11} color={colors.textMute} style={{ marginTop: 6 }}>
                Total Active Time
              </Caps>
            </View>

            <View style={styles.chartCard}>
              <View style={styles.chartHead}>
                <Caps size={10}>Daily Minutes</Caps>
                <Mono size={11} color={colors.accent}>
                  +18% vs last wk
                </Mono>
              </View>
              <View style={styles.chart}>
                {DAY_VALUES.map((v, i) => (
                  <View key={i} style={styles.chartCol}>
                    <Mono size={9}>{v || '·'}</Mono>
                    <View
                      style={[
                        styles.chartBar,
                        v === 0
                          ? styles.chartBarZero
                          : { height: (v / maxDay) * 100, backgroundColor: colors.accent },
                      ]}
                    />
                    <Mono size={9}>{DAYS[i]}</Mono>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.tiles}>
              <Tile label="Distance" value="14.2" unit="mi" delta="+2.1" />
              <Tile label="Calories" value="3.2K" unit="kcal" delta="+0.4K" />
            </View>
            <View style={styles.tiles}>
              <Tile label="Sessions" value="9" unit="" delta="+2" />
              <Tile label="Streak" value="5" unit="d" delta="🔥" coral />
            </View>

            <View style={styles.activityCard}>
              <Caps size={10}>By Activity</Caps>
              {[
                { name: 'Surf', time: '3:12', value: 0.5 },
                { name: 'Hike', time: '1:48', value: 0.28 },
                { name: 'Lift', time: '1:00', value: 0.16 },
                { name: 'Yoga', time: '0:22', value: 0.06 },
              ].map((a) => (
                <View key={a.name} style={styles.activityRow}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={styles.activityName}>{a.name}</Text>
                    <Mono size={12}>{a.time}</Mono>
                  </View>
                  <ProgressBar value={a.value} />
                </View>
              ))}
            </View>

            <SectionHeader kicker="Log" title="Recent" />
          </View>
        }
        renderItem={renderItem}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
}

function Tile({ label, value, unit, delta, coral }) {
  return (
    <View style={styles.tile}>
      <Caps size={9} color={colors.textMute}>
        {label}
      </Caps>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
        <Mono size={30} color={coral ? colors.accent2 : colors.text} weight="500">
          {value}
        </Mono>
        {unit ? (
          <Mono size={12} color={colors.textMute} style={{ marginLeft: 4 }}>
            {unit}
          </Mono>
        ) : null}
      </View>
      <Mono size={11} color={colors.accent} style={{ marginTop: 4 }}>
        {delta}
      </Mono>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 140 },
  headerRow: {
    paddingHorizontal: spacing.edge,
    paddingTop: spacing.s,
    paddingBottom: spacing.base,
  },
  h2: { ...typography.h2, color: colors.text, marginTop: 4 },
  bigTimer: {
    paddingHorizontal: spacing.edge,
    paddingBottom: spacing.l,
  },
  timerVal: {
    ...typography.monoDisplay,
    fontSize: 76,
    lineHeight: 80,
    color: colors.accent,
    letterSpacing: -3,
  },
  chartCard: {
    marginHorizontal: spacing.edge,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    padding: spacing.base,
  },
  chartHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
  },
  chartCol: { flex: 1, alignItems: 'center' },
  chartBar: { width: 14, marginVertical: 6 },
  chartBarZero: { height: 2, width: 14, backgroundColor: colors.line, marginVertical: 6 },
  tiles: {
    flexDirection: 'row',
    paddingHorizontal: spacing.edge,
    marginTop: spacing.m,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    padding: spacing.base,
    marginHorizontal: 3,
  },
  activityCard: {
    marginHorizontal: spacing.edge,
    marginTop: spacing.m,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    padding: spacing.base,
  },
  activityRow: { marginTop: spacing.m },
  activityName: { ...typography.body, color: colors.text, fontSize: 13, fontWeight: '500' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.edge,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
  },
  rowBody: { flex: 1, marginLeft: spacing.m },
  rowTitle: { ...typography.body, fontSize: 14, color: colors.text, fontWeight: '500' },
});
