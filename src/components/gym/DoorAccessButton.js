import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Caps, Mono } from '../VoltPrimitives';
import { strings } from '../../i18n/strings';
import { colors, spacing, radius, typography } from '../../theme';

function isDoorAvailable(door) {
  return door?.status === 'ONLINE' && door?.enabled !== false;
}

export default function DoorAccessButton({
  door,
  onUnlock,
  loading = false,
  error = null,
  success = false,
}) {
  const available = isDoorAvailable(door);
  const disabled = !available || loading;

  const handlePress = () => {
    if (loading || disabled) return;
    if (typeof onUnlock === 'function') onUnlock(door);
  };

  let label = strings.access.unlock;
  if (loading) label = strings.access.unlocking;
  else if (success) label = strings.access.unlocked;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>{door?.name || 'Door'}</Text>
          <Mono size={10} color={colors.textMute}>
            {[door?.status, door?.requiresProximity ? 'PROXIMITY' : null]
              .filter(Boolean)
              .join(' · ')}
          </Mono>
          {!available ? (
            <Caps size={9} color={colors.textMute} style={styles.unavailable}>
              {strings.access.doorUnavailable}
            </Caps>
          ) : null}
          {error ? (
            <Text style={styles.errorText} accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}
          {success && !error ? (
            <Caps size={9} color={colors.accent} style={styles.success}>
              {strings.access.success}
            </Caps>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.btn, disabled && styles.btnDisabled, success && styles.btnSuccess]}
          onPress={handlePress}
          disabled={disabled}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={
            available ? `Unlock ${door?.name || 'door'}` : strings.access.doorUnavailable
          }
          accessibilityState={{ disabled }}
        >
          {loading ? (
            <ActivityIndicator color="#0A0C10" size="small" />
          ) : (
            <Text style={styles.btnLabel}>{available ? label : strings.access.unlock}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.m,
    padding: spacing.base,
    marginBottom: spacing.s,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginRight: spacing.m },
  name: { ...typography.body, fontSize: 15, fontWeight: '600', color: colors.text },
  unavailable: { marginTop: 4 },
  success: { marginTop: 4 },
  errorText: { ...typography.mono, fontSize: 11, color: colors.accent2, marginTop: 4 },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.m,
    minWidth: 120,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  btnDisabled: { opacity: 0.4 },
  btnSuccess: { opacity: 1 },
  btnLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: '#0A0C10',
  },
});
