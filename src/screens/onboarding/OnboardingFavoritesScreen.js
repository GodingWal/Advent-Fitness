import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import { Caps } from '../../components/VoltPrimitives';
import PageDots from '../../components/PageDots';
import PrimaryButton from '../../components/PrimaryButton';
import IconBadge from '../../components/IconBadge';
import { useAuth } from '../../state/AuthContext';
import { colors, spacing, radius, typography, shadows } from '../../theme';

// VOLT onboarding 03 — Arena picker. 3×3 grid of square tiles. Selected =
// accent bg + dark text + lime shadow.
const ARENAS = [
  { type: 'surfing', label: 'Surf', icon: 'wave' },
  { type: 'hiking', label: 'Hike', icon: 'mountain' },
  { type: 'running', label: 'Run', icon: 'run' },
  { type: 'cycling', label: 'Cycle', icon: 'bike' },
  { type: 'yoga', label: 'Yoga', icon: 'yoga' },
  { type: 'meditation', label: 'Meditate', icon: 'meditate' },
  { type: 'weightLifting', label: 'Lift', icon: 'weight' },
  { type: 'swimming', label: 'Swim', icon: 'wave' },
  { type: 'tennis', label: 'Tennis', icon: 'run' },
];

export default function OnboardingFavoritesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [picked, setPicked] = useState(new Set(['surfing', 'hiking']));
  const finish = () => signIn({ email: 'guest@volt.app' });

  const togglePick = (type) => {
    setPicked((p) => {
      const next = new Set(p);
      if (next.has(type)) next.delete(type);
      else if (next.size < 6) next.add(type);
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HeaderBar
        onBack={() => navigation.goBack()}
        title="ONBOARDING"
        rightIcon="close-outline"
        onRight={finish}
      />

      <View style={[styles.body, { paddingBottom: insets.bottom + spacing.xl }]}>
        <Caps size={10} color={colors.textMute}>
          Profile / 03
        </Caps>
        <Text style={styles.title}>
          Pick your{'\n'}
          <Text style={{ color: colors.accent }}>arena.</Text>
        </Text>

        <Caps size={9} color={colors.textMute} style={styles.counter}>
          {picked.size} selected · pick up to 6
        </Caps>

        <View style={styles.grid}>
          {ARENAS.map((a) => {
            const active = picked.has(a.type);
            return (
              <View key={a.type} style={styles.tileWrap}>
                <TouchableOpacity
                  style={[styles.tile, active && styles.tileActive]}
                  onPress={() => togglePick(a.type)}
                  activeOpacity={0.85}
                >
                  <IconBadge
                    icon={a.icon}
                    size={28}
                    color={active ? '#0A0C10' : colors.text}
                    bg="transparent"
                    border="transparent"
                  />
                  <Text style={[styles.tileLabel, active && styles.tileLabelActive]}>
                    {a.label.toUpperCase()}
                  </Text>
                  {active ? (
                    <View style={styles.checkPill}>
                      <Ionicons name="checkmark" size={10} color={colors.accent} />
                    </View>
                  ) : null}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <PageDots count={3} active={2} />
        <View style={{ marginTop: spacing.l }}>
          <PrimaryButton label="Enter VOLT" trailingIcon="arrow-forward" onPress={finish} />
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
  },
  counter: { marginTop: spacing.m, marginBottom: spacing.base },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  tileWrap: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 4,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  tileActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    ...shadows.selected,
  },
  tileLabel: {
    ...typography.caps,
    fontSize: 10,
    color: colors.text,
    marginTop: 'auto',
  },
  tileLabelActive: { color: '#0A0C10' },
  checkPill: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#0A0C10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: { flex: 1 },
});
