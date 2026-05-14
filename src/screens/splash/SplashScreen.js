import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Logo from '../../components/Logo';
import { Caps, Mono } from '../../components/VoltPrimitives';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, spacing, typography } from '../../theme';

// VOLT splash — BrandStrip top, watermark V behind hero, display 60px headline
// "Move with / intent." (period + "intent." in accent), stat strip
// (Sessions / Athletes / Miles), PrimaryButton START + "I have an account" link.
export default function SplashScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={[styles.brandRow, { paddingTop: insets.top + 14 }]}>
        <Logo size={22} />
        <Caps size={11} color={colors.accent}>
          Performance
        </Caps>
      </View>

      <View style={styles.hero}>
        <View style={styles.watermark} pointerEvents="none">
          <Svg width={260} height={260} viewBox="0 0 64 64">
            <Defs>
              <RadialGradient id="fade" cx="50%" cy="50%" rx="70%" ry="70%">
                <Stop offset="0%" stopColor={colors.accent} stopOpacity={0.22} />
                <Stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width="64" height="64" fill="url(#fade)" />
            <Path
              d="M4 8 L20 8 L32 38 L44 8 L60 8 L34 60 L30 60 Z"
              fill={colors.accent}
              opacity={0.22}
            />
          </Svg>
        </View>

        <View style={styles.headlineWrap}>
          <Caps size={11} color={colors.textMute} style={styles.kicker}>
            Track · Compete · Conquer
          </Caps>
          <Text style={styles.headline}>
            Move with{'\n'}
            <Text style={{ color: colors.accent }}>intent.</Text>
          </Text>
          <Text style={styles.subhead}>
            A performance-grade fitness logbook. Log every session, see your streaks live, and move
            with the circle.
          </Text>
        </View>
      </View>

      <View style={styles.statStrip}>
        <Stat label="Sessions" value="142K" />
        <View style={styles.statDivider} />
        <Stat label="Athletes" value="38K" />
        <View style={styles.statDivider} />
        <Stat label="Miles" value="2.4M" />
      </View>

      <View style={[styles.cta, { paddingBottom: insets.bottom + spacing.l }]}>
        <PrimaryButton
          label="Start"
          trailingIcon="arrow-forward"
          onPress={() => navigation.replace('Auth')}
        />
        <TouchableOpacity onPress={() => navigation.replace('Auth')} style={styles.linkBtn}>
          <Text style={styles.link}>I HAVE AN ACCOUNT →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.statCol}>
      <Caps size={9} color={colors.textMute}>
        {label}
      </Caps>
      <Mono size={18} color={colors.text} weight="500" style={{ marginTop: 6 }}>
        {value}
      </Mono>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.edge },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.m,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    position: 'relative',
  },
  watermark: {
    position: 'absolute',
    top: '10%',
    left: -40,
    opacity: 0.7,
  },
  headlineWrap: { paddingTop: spacing.l },
  kicker: { marginBottom: spacing.base },
  headline: {
    ...typography.display,
    fontSize: 54,
    lineHeight: 56,
    color: colors.text,
    letterSpacing: -2.5,
  },
  subhead: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMute,
    marginTop: spacing.base,
    maxWidth: 280,
    lineHeight: 20,
  },
  statStrip: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineSoft,
    paddingVertical: spacing.base,
    marginBottom: spacing.l,
  },
  statCol: { flex: 1, alignItems: 'flex-start' },
  statDivider: { width: 1, backgroundColor: colors.lineSoft },
  cta: { paddingTop: spacing.s },
  linkBtn: { alignItems: 'center', paddingVertical: spacing.base, marginTop: spacing.s },
  link: { ...typography.caps, fontSize: 10, color: colors.textDim, letterSpacing: 2 },
});
