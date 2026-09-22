import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Caps } from '../VoltPrimitives';
import { colors, spacing, radius, typography } from '../../theme';

export default function AccessQrCode({ token, size = 180 }) {
  if (!token) {
    return (
      <View style={[styles.box, { width: size, height: size }]}>
        <Caps size={9} color={colors.textMute}>
          No code
        </Caps>
      </View>
    );
  }
  return (
    <View style={styles.wrap} accessibilityRole="image" accessibilityLabel="Entry QR code">
      <View style={styles.codeBox}>
        <QRCode value={String(token)} size={size} backgroundColor="#FFFFFF" color="#0A0C10" />
      </View>
      <Text style={styles.token} numberOfLines={1} ellipsizeMode="middle">
        {String(token).slice(0, 24)}…
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  box: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBox: {
    backgroundColor: '#FFFFFF',
    padding: spacing.m,
    borderRadius: radius.m,
  },
  token: {
    ...typography.mono,
    fontSize: 10,
    color: colors.textMute,
    marginTop: spacing.s,
    maxWidth: 220,
  },
});
