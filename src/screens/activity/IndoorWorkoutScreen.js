import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import PrimaryButton from '../../components/PrimaryButton';
import { useApp } from '../../state/AppContext';
import { colors, spacing, radius, typography, shadows } from '../../theme';

const SUGGESTED = [
  'Bench Press',
  'Back Squat',
  'Deadlift',
  'Overhead Press',
  'Pull-ups',
  'Rows',
  'Lunges',
];

const emptySet = () => ({ id: `s_${Math.random().toString(36).slice(2, 8)}`, reps: '', weight: '' });
const emptyExercise = () => ({
  id: `e_${Math.random().toString(36).slice(2, 8)}`,
  name: '',
  sets: [emptySet()],
});

export default function IndoorWorkoutScreen({ navigation }) {
  const { addRecordedRoute, addFeedPost, user } = useApp();
  const [exercises, setExercises] = useState([emptyExercise()]);
  const [notes, setNotes] = useState('');

  const updateExercise = (id, patch) =>
    setExercises((cur) => cur.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const updateSet = (eid, sid, patch) =>
    setExercises((cur) =>
      cur.map((e) =>
        e.id === eid
          ? { ...e, sets: e.sets.map((s) => (s.id === sid ? { ...s, ...patch } : s)) }
          : e
      )
    );

  const addSet = (eid) =>
    setExercises((cur) =>
      cur.map((e) => (e.id === eid ? { ...e, sets: [...e.sets, emptySet()] } : e))
    );

  const removeSet = (eid, sid) =>
    setExercises((cur) =>
      cur.map((e) =>
        e.id === eid ? { ...e, sets: e.sets.filter((s) => s.id !== sid) } : e
      )
    );

  const addExercise = () => setExercises((cur) => [...cur, emptyExercise()]);

  const totalSets = exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const totalVolume = exercises.reduce(
    (sum, e) =>
      sum +
      e.sets.reduce(
        (s, set) => s + (parseInt(set.reps, 10) || 0) * (parseInt(set.weight, 10) || 0),
        0
      ),
    0
  );

  const save = () => {
    const validExercises = exercises.filter((e) => e.name.trim());
    if (!validExercises.length) return;
    addRecordedRoute({
      id: `gym_${Date.now()}`,
      type: 'weightLifting',
      title: 'Strength Workout',
      durationSec: 45 * 60,
      distanceMi: 0,
      coordinates: [],
      when: 'Just now',
      exercises: validExercises,
    });
    addFeedPost({
      id: `mp_${Date.now()}`,
      user: { id: 'me', shortName: 'You', avatar: user.avatar },
      action: 'lifted',
      quantity: `${totalSets} sets`,
      location: notes.trim(),
      when: 'Just now',
      section: 'Earlier Today',
      photos: [],
      likes: 0,
      likedByMe: false,
      comments: 0,
    });
    navigation.navigate('Main');
  };

  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="Indoor Workout" bordered />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{exercises.filter((e) => e.name).length}</Text>
            <Text style={styles.summaryLabel}>EXERCISES</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalSets}</Text>
            <Text style={styles.summaryLabel}>SETS</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalVolume.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>VOLUME</Text>
          </View>
        </View>

        {exercises.map((e, idx) => (
          <View key={e.id} style={styles.exerciseCard}>
            <Text style={styles.exerciseLabel}>EXERCISE {idx + 1}</Text>
            <TextInput
              value={e.name}
              onChangeText={(t) => updateExercise(e.id, { name: t })}
              style={styles.exerciseInput}
              placeholder="Search or type exercise"
              placeholderTextColor={colors.textMuted}
            />
            {!e.name ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestRow}>
                {SUGGESTED.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => updateExercise(e.id, { name: s })}
                    style={styles.suggestChip}
                  >
                    <Text style={styles.suggestText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : null}

            <View style={styles.setsHeader}>
              <Text style={[styles.setHeaderCell, { flex: 0.6 }]}>SET</Text>
              <Text style={styles.setHeaderCell}>REPS</Text>
              <Text style={styles.setHeaderCell}>WEIGHT (LB)</Text>
              <View style={{ width: 36 }} />
            </View>

            {e.sets.map((s, sidx) => (
              <View key={s.id} style={styles.setRow}>
                <Text style={[styles.setIndex, { flex: 0.6 }]}>{sidx + 1}</Text>
                <TextInput
                  value={s.reps}
                  onChangeText={(t) => updateSet(e.id, s.id, { reps: t })}
                  style={styles.setInput}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                />
                <TextInput
                  value={s.weight}
                  onChangeText={(t) => updateSet(e.id, s.id, { weight: t })}
                  style={styles.setInput}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  onPress={() => removeSet(e.id, s.id)}
                  style={styles.removeBtn}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity onPress={() => addSet(e.id)} style={styles.addSet}>
              <Ionicons name="add" size={18} color={colors.accent} />
              <Text style={styles.addSetLabel}>Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity onPress={addExercise} style={styles.addExercise}>
          <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
          <Text style={styles.addExerciseLabel}>Add Exercise</Text>
        </TouchableOpacity>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          style={styles.notes}
          placeholder="Notes (gym, mood, etc.)"
          placeholderTextColor={colors.textMuted}
          multiline
        />

        <View style={{ marginTop: spacing.l }}>
          <PrimaryButton
            label="Finish & Save"
            onPress={save}
            style={{ backgroundColor: colors.accent }}
            textStyle={{ color: colors.white }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceMuted },
  scroll: { padding: spacing.base, paddingBottom: 80 },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.l,
    ...shadows.cardLight,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, color: colors.textPrimary, fontWeight: '500' },
  summaryLabel: { ...typography.labelCapsSmall, color: colors.textMuted, marginTop: 4 },
  summaryDivider: { width: 1, backgroundColor: colors.divider },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.base,
    marginTop: spacing.base,
    ...shadows.cardLight,
  },
  exerciseLabel: { ...typography.labelCapsSmall, color: colors.textMuted },
  exerciseInput: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '400',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  suggestRow: { paddingVertical: spacing.s },
  suggestChip: {
    paddingHorizontal: spacing.m,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.divider,
    marginRight: spacing.s,
  },
  suggestText: { ...typography.bodySmall, color: colors.textSecondary },
  setsHeader: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.base },
  setHeaderCell: { flex: 1, ...typography.labelCapsSmall, color: colors.textMuted, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  setIndex: { ...typography.body, color: colors.textPrimary, textAlign: 'center', fontWeight: '500' },
  setInput: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.s,
    paddingVertical: spacing.s,
    marginHorizontal: 4,
    textAlign: 'center',
    ...typography.body,
    color: colors.textPrimary,
  },
  removeBtn: { width: 36, alignItems: 'center' },
  addSet: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.s, marginTop: spacing.s },
  addSetLabel: { ...typography.labelCapsSmall, color: colors.accent, marginLeft: 6 },
  addExercise: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.divider,
    marginTop: spacing.l,
  },
  addExerciseLabel: { ...typography.labelCaps, color: colors.accent, marginLeft: 6 },
  notes: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.base,
    marginTop: spacing.l,
    minHeight: 80,
    textAlignVertical: 'top',
    color: colors.textPrimary,
    ...typography.body,
    ...shadows.cardLight,
  },
});
