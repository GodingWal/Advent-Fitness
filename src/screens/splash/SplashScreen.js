import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Logo from '../../components/Logo';
import { colors, spacing, typography } from '../../theme';

export default function SplashScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.body, { paddingTop: insets.top + 80 }]}>
        <Logo size={96} wordmarkColor={colors.accent} />
        <View style={styles.tagline}>
          <Text style={styles.h1}>{'Track Your\nActive Lifestyle'}</Text>
          <View style={styles.divider} />
          <Text style={styles.sub}>With goal a driven approach</Text>
        </View>
      </View>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.cta, { paddingBottom: insets.bottom + 18 }]}
        onPress={() => navigation.replace('Auth')}
      >
        <Text style={styles.ctaLabel}>GET STARTED</Text>
        <Ionicons name="chevron-forward" size={22} color={colors.white} style={styles.ctaIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDark },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xl },
  tagline: { marginTop: 'auto', marginBottom: spacing.xxxl, alignSelf: 'flex-start' },
  h1: { ...typography.display, color: colors.textOnDark, fontWeight: '300' },
  divider: { width: 28, height: 1, backgroundColor: colors.textOnDark, marginVertical: spacing.base, opacity: 0.85 },
  sub: { ...typography.body, color: colors.textOnDarkMuted },
  cta: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 22,
    paddingHorizontal: spacing.xl,
  },
  ctaLabel: { ...typography.labelCaps, color: colors.white, fontSize: 14 },
  ctaIcon: { position: 'absolute', right: spacing.xl, top: 22 },
});
