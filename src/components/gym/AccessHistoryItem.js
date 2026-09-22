import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Caps, Mono } from '../VoltPrimitives';
import { colors, spacing, radius, typography } from '../../theme';

function formatWhen(createdAt) {
  if (!createdAt) return '—';
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return String(createdAt);
  return d.toLocaleString();
}

export default function AccessHistoryItem({ event }) {
  const granted = String(event?.result || '').toUpperCase() === 'GRANTED';
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: granted ? colors.accent : colors.accent2 }]} />
      <View style={styles.body}>
        <Text style={styles.door}>{event?.doorName || event?.doorId || 'Door'}</Text>
        <Mono size={10} color={colors.textMute}>
          {formatWhen(event?.createdAt)}
          {event?.reason ? ` · ${event.reason}` : ''}
        </Mono>
      </View>
      <Caps size={9} color={granted ? colors.accent : colors.accent2}>
        {String(event?.result || 'UNKNOWN').toUpperCase()}
      </Caps>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.m,
    padding: spacing.base,
    marginBottom: spacing.s,
  },
  dot: { width: 8, height: 8, borderRadius: 2, marginRight: spacing.m },
  body: { flex: 1 },
  door: { ...typography.body, fontSize: 14, fontWeight: '500', color: colors.text },
});
