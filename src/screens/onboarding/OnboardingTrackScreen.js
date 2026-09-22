import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderBar from '../../components/HeaderBar';
import { Caps, ProgressBar } from '../../components/VoltPrimitives';
import PageDots from '../../components/PageDots';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../state/AuthContext';
import { friendlyAuthError } from '../../services/authErrors';
import { strings } from '../../i18n/strings';
import { colors, spacing, radius, typography } from '../../theme';

// VOLT onboarding 02 — Goal picker. Caps "Profile / 02", h1 "Set a / target."
// Goal card with 84px mono accent number + 5 toggle pills.
// Persists { goal, weeklyTargetH, units } to PUT /v1/profile on continue.
const HOURS = [4, 6, 8, 10, 12];

export default function OnboardingTrackScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuth();
  const [target, setTarget] = React.useState(10);
  const [mode, setMode] = React.useState('build');
  const [error, setError] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  const persist = async (overrides = {}) => {
    setError(null);
    setSaving(true);
    try {
      await updateProfile({
        goal: overrides.mode ?? mode,
        weeklyTargetH: overrides.target ?? target,
        units: 'metric',
      });
      return true;
    } catch (e) {
      setError(friendlyAuthError(e, { fallback: strings.auth.genericError }));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const goNext = async () => {
    const ok = await persist();
    if (ok) navigation.navigate('OnboardingFavorites');
  };
  const skip = async () => {
    const ok = await persist();
    if (ok) navigation.navigate('OnboardingFavorites');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HeaderBar
        onBack={() => navigation.goBack()}
        title="ONBOARDING"
        rightIcon="close-outline"
        onRight={skip}
      />

      <View style={[styles.body, { paddingBottom: insets.bottom + spacing.xl }]}>
        <Caps size={10} color={colors.textMute}>
          Profile / 02
        </Caps>
        <Text style={styles.title}>
          Set a{'\n'}
          <Text style={{ color: colors.accent }}>target.</Text>
        </Text>

        <View style={styles.goalCard}>
          <Caps size={10} color={colors.textMute}>
            Weekly hours
          </Caps>
          <View style={styles.bigRow}>
            <Text style={styles.bigNum}>{target}</Text>
            <Text style={styles.bigUnit}>h</Text>
          </View>

          <View style={styles.pillRow}>
            {HOURS.map((h) => {
              const active = h === target;
              return (
                <TouchableOpacity
                  key={h}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setTarget(h)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{h}h</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.modeRow}>
          {['build', 'maintain'].map((m) => {
            const active = m === mode;
            return (
              <TouchableOpacity
                key={m}
                style={[styles.modeCard, active && styles.modeCardActive]}
                onPress={() => setMode(m)}
                activeOpacity={0.85}
              >
                <View style={styles.modeRow2}>
                  <View style={[styles.modeIndicator, active && styles.modeIndicatorActive]} />
                  <Text style={styles.modeLabel}>{m === 'build' ? 'Build' : 'Maintain'}</Text>
                </View>
                <Text style={styles.modeSub}>
                  {m === 'build' ? 'Push past your baseline' : 'Hold the routine'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.progressWrap}>
          <Caps size={9} color={colors.textMute} style={{ marginBottom: 6 }}>
            Weekly progress · 6.6 / {target}h
          </Caps>
          <ProgressBar value={6.6 / target} />
        </View>

        {error ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <View style={styles.spacer} />

        <PageDots count={3} active={1} />
        <View style={{ marginTop: spacing.l }}>
          <PrimaryButton
            label="Next"
            trailingIcon="arrow-forward"
            onPress={goNext}
            loading={saving}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: {
    flex: 1,
    paddingHorizontal: spacing.edge,
    paddingTop: spacing.l,
  },
  title: {
    ...typography.h1,
    fontSize: 38,
    lineHeight: 40,
    color: colors.text,
    marginTop: spacing.s,
    marginBottom: spacing.xl,
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: spacing.l,
  },
  bigRow: { flexDirection: 'row', alignItems: 'baseline', marginVertical: spacing.s },
  bigNum: {
    ...typography.monoDisplay,
    fontSize: 84,
    lineHeight: 88,
    color: colors.accent,
    letterSpacing: -4,
  },
  bigUnit: {
    ...typography.mono,
    fontSize: 22,
    color: colors.textMute,
    marginLeft: 6,
  },
  pillRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.m },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  pillActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(212,255,61,0.1)',
  },
  pillText: { ...typography.mono, fontSize: 13, color: colors.textMute },
  pillTextActive: { color: colors.accent },
  modeRow: { flexDirection: 'row', gap: spacing.m, marginTop: spacing.base },
  modeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: spacing.base,
    marginHorizontal: 4,
  },
  modeCardActive: { borderColor: colors.accent },
  modeRow2: { flexDirection: 'row', alignItems: 'center' },
  modeIndicator: {
    width: 8,
    height: 8,
    backgroundColor: colors.line,
    marginRight: spacing.s,
  },
  modeIndicatorActive: { backgroundColor: colors.accent },
  modeLabel: { ...typography.body, fontSize: 15, fontWeight: '600', color: colors.text },
  modeSub: { ...typography.bodySmall, color: colors.textMute, marginTop: 4 },
  progressWrap: { marginTop: spacing.l },
  errorText: { ...typography.mono, fontSize: 11, color: colors.accent2, marginTop: 8 },
  spacer: { flex: 1 },
});
