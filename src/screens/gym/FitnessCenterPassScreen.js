import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import HeaderBar from '../../components/HeaderBar';
import { colors, spacing, radius, typography, shadows } from '../../theme';

const PASSES = [
  {
    id: 'snap',
    name: 'Snap Fitness 24-7',
    bg: '#D1232A',
    initials: 'SNAP\nFITNESS\n24/7',
  },
  {
    id: 'anytime',
    name: 'Anytime Fitness',
    bg: '#732C95',
    initials: 'ANYTIME\nFITNESS',
  },
];

export default function FitnessCenterPassScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <HeaderBar onMenu={() => navigation.openDrawer?.()} title="" bordered />
      <Text style={styles.title}>Fitness Center Pass</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        {PASSES.map((p) => (
          <TouchableOpacity key={p.id} activeOpacity={0.85} style={[styles.card, { backgroundColor: p.bg }]}>
            <Text style={styles.cardLabel}>{p.initials}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceMuted },
  title: { ...typography.h2, color: colors.textPrimary, padding: spacing.base, fontWeight: '300' },
  scroll: { padding: spacing.base, paddingBottom: 120 },
  card: {
    height: 180,
    borderRadius: radius.l,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
    ...shadows.card,
  },
  cardLabel: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 1,
  },
});
