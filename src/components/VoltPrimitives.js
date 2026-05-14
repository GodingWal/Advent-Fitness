import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '../theme';
import Logo from './Logo';

// VOLT atoms — small typography and layout primitives that compose into screens.

export function Caps({ children, style, color = colors.textMute, size = 11, ...rest }) {
  return (
    <Text
      {...rest}
      style={[
        typography.caps,
        { fontSize: size, color, letterSpacing: size >= 12 ? 2.4 : 2 },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Mono({ children, style, color = colors.textMute, size = 12, weight, ...rest }) {
  return (
    <Text
      {...rest}
      style={[typography.mono, { fontSize: size, color }, weight && { fontWeight: weight }, style]}
    >
      {children}
    </Text>
  );
}

export function Stat({ label, value, unit, big = false, accent = false, dark = false, style }) {
  return (
    <View style={style}>
      <Caps size={9} color={dark ? 'rgba(10,12,16,0.55)' : colors.textMute}>
        {label}
      </Caps>
      <View style={styles.statRow}>
        <Mono
          size={big ? 28 : 18}
          weight="500"
          color={dark ? '#0A0C10' : accent ? colors.accent : colors.text}
        >
          {value}
        </Mono>
        {unit ? (
          <Mono
            size={big ? 14 : 10}
            color={dark ? 'rgba(10,12,16,0.55)' : colors.textMute}
            style={styles.statUnit}
          >
            {unit}
          </Mono>
        ) : null}
      </View>
    </View>
  );
}

export function Tag({ label, accent = false, style }) {
  return (
    <View style={[styles.tag, { borderColor: accent ? colors.accent : colors.line }, style]}>
      <Text style={[typography.capsSm, { color: accent ? colors.accent : colors.textMute }]}>
        {label}
      </Text>
    </View>
  );
}

export function Divider({ style, color = colors.lineSoft }) {
  return <View style={[styles.divider, { backgroundColor: color }, style]} />;
}

export function ProgressBar({ value = 0, height = 4, accent = colors.accent }) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.track, { height }]}>
      <View
        style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: accent, height }]}
      />
    </View>
  );
}

export function BrandStrip({ right, left, paddingHorizontal = spacing.edge, style }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.strip, { paddingTop: insets.top + 6, paddingHorizontal }, style]}>
      <View style={styles.stripLeft}>{left ?? <Logo size={16} />}</View>
      <View style={styles.stripRight}>{right}</View>
    </View>
  );
}

export function ScreenHeader({ kicker, title, paddingHorizontal = spacing.edge, style }) {
  return (
    <View style={[styles.header, { paddingHorizontal }, style]}>
      {kicker ? (
        <Caps size={10} color={colors.textMute} style={styles.kicker}>
          {kicker}
        </Caps>
      ) : null}
      {title ? <Text style={[typography.h2, styles.headline]}>{title}</Text> : null}
    </View>
  );
}

export function SectionHeader({
  kicker,
  title,
  action,
  onAction,
  paddingHorizontal = spacing.edge,
}) {
  return (
    <View style={[styles.section, { paddingHorizontal }]}>
      <View style={{ flex: 1 }}>
        {kicker ? (
          <Caps size={10} color={colors.textMute} style={styles.sectionKicker}>
            {kicker}
          </Caps>
        ) : null}
        {title ? <Text style={[typography.title, styles.sectionTitle]}>{title}</Text> : null}
      </View>
      {action ? (
        <Text onPress={onAction} style={[typography.caps, styles.sectionAction]}>
          {action}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  statUnit: { marginLeft: 4 },
  tag: {
    borderWidth: 1,
    borderRadius: radius.s,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  divider: { height: 1, alignSelf: 'stretch' },
  track: {
    backgroundColor: colors.surface2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: { borderRadius: 2 },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.s,
  },
  stripLeft: { flex: 1, alignItems: 'flex-start' },
  stripRight: { flexDirection: 'row', alignItems: 'center' },
  header: { paddingTop: spacing.s, paddingBottom: spacing.s },
  kicker: { marginBottom: 6 },
  headline: { color: colors.text },
  section: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  sectionKicker: { marginBottom: 4 },
  sectionTitle: { color: colors.text },
  sectionAction: { color: colors.accent, fontSize: 10 },
});
