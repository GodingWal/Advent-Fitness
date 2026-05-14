import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import { Caps, Mono } from '../../components/VoltPrimitives';
import { colors, spacing, radius, typography } from '../../theme';

// VOLT Gym Pass — gradient cards (per-pass tone), barcode bar at bottom,
// "Add a Pass" dashed-border affordance.
const PASSES = [
  { id: 'snap', name: 'Snap Fitness', city: 'San Diego', tone: '#FF5C3A', code: 'CB-08841' },
  { id: 'any', name: 'Anytime Fitness', city: 'Encinitas', tone: '#A36CFF', code: 'CB-02274' },
  { id: 'eq', name: 'Equinox', city: 'La Jolla', tone: '#5BE0FF', code: 'CB-11392' },
];

export default function FitnessCenterPassScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="GYM PASS" />

      <View style={styles.headerRow}>
        <Caps size={10} color={colors.textMute}>
          Gym Pass · {PASSES.length} active
        </Caps>
        <Text style={styles.h2}>Passes.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {PASSES.map((p) => (
          <View key={p.id} style={[styles.card, { backgroundColor: p.tone }]}>
            <View style={styles.overlay} />
            <View style={styles.cardInner}>
              <View style={styles.cardTop}>
                <Caps size={10} color="rgba(10,12,16,0.7)">
                  Member · {p.code}
                </Caps>
                <Caps size={10} color="rgba(10,12,16,0.7)">
                  Valid 04 / 27
                </Caps>
              </View>
              <Text style={styles.passName}>{p.name}</Text>
              <Mono size={11} color="rgba(10,12,16,0.7)">
                {p.city}
              </Mono>
              <View style={styles.barcode}>
                {Array.from({ length: 36 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.bar,
                      {
                        backgroundColor: i % 4 === 0 ? '#0A0C10' : 'rgba(10,12,16,0.5)',
                        height: i % 4 === 0 ? 24 : 20,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addCard} activeOpacity={0.85}>
          <Ionicons name="add-outline" size={18} color={colors.text} />
          <Text style={styles.addLabel}>ADD A PASS</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { paddingHorizontal: spacing.edge, paddingTop: spacing.s, paddingBottom: spacing.m },
  h2: { ...typography.h2, color: colors.text, marginTop: 4 },
  scroll: { padding: spacing.edge, paddingBottom: 120 },
  card: {
    minHeight: 170,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    overflow: 'hidden',
    marginBottom: spacing.m,
    position: 'relative',
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
  barcode: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginTop: 'auto',
  },
  bar: { width: 2 },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.l,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
    borderRadius: radius.m,
    marginTop: spacing.s,
  },
  addLabel: {
    ...typography.caps,
    color: colors.text,
    marginLeft: spacing.s,
    fontSize: 11,
  },
});
