import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Caps, Mono } from '../VoltPrimitives';
import MembershipStatus from './MembershipStatus';
import { colors, spacing, radius, typography } from '../../theme';

function formatExpiry(expiresAt) {
  if (!expiresAt) return 'No expiry';
  const d = new Date(expiresAt);
  if (Number.isNaN(d.getTime())) return String(expiresAt);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `Valid ${mm} / ${yy}`;
}

export default function GymPassCard({ membership, gymName, locationName, onPress }) {
  const gym = membership?.gym?.name || gymName || 'Gym';
  const status = membership?.status || 'UNKNOWN';
  const detail = membership?.membershipType || membership?.accessLevel || '';
  const expiry = formatExpiry(membership?.expiresAt);

  const inner = (
    <View style={styles.cardInner}>
      <View style={styles.cardTop}>
        <Caps size={10} color="rgba(10,12,16,0.7)">
          Member · {String(membership?.id || '').slice(0, 8) || '—'}
        </Caps>
        <Caps size={10} color="rgba(10,12,16,0.7)">
          {expiry}
        </Caps>
      </View>
      <Text style={styles.passName}>{gym}</Text>
      <Mono size={11} color="rgba(10,12,16,0.7)">
        {[locationName, detail].filter(Boolean).join(' · ') || ' '}
      </Mono>
      <View style={styles.statusRow}>
        <MembershipStatus status={status} />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${gym} pass, ${status}`}
      >
        <View style={styles.overlay} />
        {inner}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.overlay} />
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 150,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    overflow: 'hidden',
    marginBottom: spacing.m,
    position: 'relative',
    backgroundColor: colors.accent,
  },
  overlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    backgroundColor: 'rgba(10,12,16,0.4)',
  },
  cardInner: { padding: spacing.l, flex: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  passName: {
    ...typography.h4,
    fontSize: 26,
    color: '#0A0C10',
    marginTop: spacing.s,
  },
  statusRow: { marginTop: spacing.s },
});
