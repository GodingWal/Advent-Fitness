import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import HeaderBar from '../../components/HeaderBar';
import IconBadge from '../../components/IconBadge';
import { activityHistory } from '../../data/mockActivities';
import { colors, spacing, radius, typography, shadows } from '../../theme';

export default function ActivityListScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <HeaderBar
        onMenu={() => navigation.openDrawer?.()}
        title="Activity"
        bordered
      />
      <FlatList
        data={activityHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scroll}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ActivityTracking', { activity: { ...item, title: item.label, type: item.type } })}
          >
            <IconBadge icon={item.type === 'hiking' ? 'mountain' : 'wave'} size={48} />
            <View style={styles.rowBody}>
              <Text style={styles.title}>{item.label}</Text>
              <Text style={styles.sub}>{item.location}</Text>
            </View>
            <View style={styles.rightCol}>
              <Text style={styles.dur}>{`${item.durationMin} min`}</Text>
              <Text style={styles.when}>{item.when}</Text>
            </View>
          </TouchableOpacity>
        )}
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
