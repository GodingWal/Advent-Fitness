import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import PrimaryButton from '../../components/PrimaryButton';
import { Caps, Mono } from '../../components/VoltPrimitives';
import { useApp } from '../../state/AppContext';
import { colors, spacing, radius, typography } from '../../theme';

const SUGGESTED = [
  'Bench Press',
  'Back Squat',
  'Deadlift',
  'Overhead Press',
  'Pull-ups',
  'Rows',
  'Lunges',
];

const emptySet = () => ({
  id: `s_${Math.random().toString(36).slice(2, 8)}`,
  reps: '',
  weight: '',
});
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
      cur.map((e) => (e.id === eid ? { ...e, sets: e.sets.filter((s) => s.id !== sid) } : e))
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
      <HeaderBar onBack={() => navigation.goBack()} title="STRENGTH" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.summaryCard}>
          <SummaryStat label="Exercises" value={exercises.filter((e) => e.name).length} />
          <View style={styles.summaryDivider} />
          <SummaryStat label="Sets" value={totalSets} />
          <View style={styles.summaryDivider} />
          <SummaryStat label="Volume" value={totalVolume.toLocaleString()} />
        </View>

        {exercises.map((e, idx) => (
          <View key={e.id} style={styles.exerciseCard}>
            <Caps size={9} color={colors.textMute}>
              Exercise {idx + 1}
            </Caps>
            <TextInput
              value={e.name}
              onChangeText={(t) => updateExercise(e.id, { name: t })}
              style={styles.exerciseInput}
              placeholder="Search or type exercise"
              placeholderTextColor={colors.textDim}
            />
            {!e.name ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestRow}
              >
                {SUGGESTED.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => updateExercise(e.id, { name: s })}
                    style={styles.suggestChip}
                  >
                    <Caps size={9} color={colors.textMute}>
                      {s}
                    </Caps>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : null}

            <View style={styles.setsHeader}>
              <Caps size={9} color={colors.textMute} style={{ flex: 0.6 }}>
                Set
              </Caps>
              <Caps size={9} color={colors.textMute} style={styles.setHeaderCell}>
                Reps
              </Caps>
              <Caps size={9} color={colors.textMute} style={styles.setHeaderCell}>
                Weight (lb)
              </Caps>
              <View style={{ width: 36 }} />
            </View>

            {e.sets.map((s, sidx) => (
              <View key={s.id} style={styles.setRow}>
                <Mono
                  size={13}
                  color={colors.text}
                  weight="600"
                  style={{ flex: 0.6, textAlign: 'center' }}
                >
                  {sidx + 1}
                </Mono>
                <TextInput
                  value={s.reps}
                  onChangeText={(t) => updateSet(e.id, s.id, { reps: t })}
                  style={styles.setInput}
                  placeholder="0"
                  placeholderTextColor={colors.textDim}
                  keyboardType="number-pad"
                />
                <TextInput
                  value={s.weight}
                  onChangeText={(t) => updateSet(e.id, s.id, { weight: t })}
                  style={styles.setInput}
                  placeholder="0"
                  placeholderTextColor={colors.textDim}
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  onPress={() => removeSet(e.id, s.id)}
                  style={styles.removeBtn}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={16} color={colors.textMute} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity onPress={() => addSet(e.id)} style={styles.addSet}>
              <Ionicons name="add" size={14} color={colors.accent} />
              <Caps size={9} color={colors.accent} style={{ marginLeft: 6 }}>
                Add Set
              </Caps>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity onPress={addExercise} style={styles.addExercise}>
          <Ionicons name="add-circle-outline" size={18} color={colors.text} />
          <Caps size={11} color={colors.text} style={{ marginLeft: 8 }}>
            Add Exercise
          </Caps>
        </TouchableOpacity>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          style={styles.notes}
          placeholder="Notes (gym, mood, etc.)"
          placeholderTextColor={colors.textDim}
          multiline
        />

        <View style={{ marginTop: spacing.l }}>
          <PrimaryButton label="Finish & Save" trailingIcon="checkmark" onPress={save} />
        </View>
      </ScrollView>
    </View>
  );
}

function SummaryStat({ label, value }) {
  return (
    <View style={styles.summaryItem}>
      <Caps size={9} color={colors.textMute}>
        {label}
      </Caps>
      <Mono size={22} color={colors.text} weight="500" style={{ marginTop: 4 }}>
        {String(value)}
      </Mono>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.edge, paddingBottom: 120 },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    padding: spacing.base,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, backgroundColor: colors.lineSoft },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    padding: spacing.base,
    marginTop: spacing.m,
  },
  exerciseInput: {
    ...typography.body,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.s,
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  suggestRow: { paddingVertical: spacing.s },
  suggestChip: {
    paddingHorizontal: spacing.m,
    paddingVertical: 6,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    marginRight: spacing.s,
  },
  setsHeader: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.base },
  setHeaderCell: { flex: 1, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  setInput: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.s,
    paddingVertical: spacing.s,
    marginHorizontal: 4,
    textAlign: 'center',
    ...typography.mono,
    fontSize: 13,
    color: colors.text,
  },
  removeBtn: { width: 36, alignItems: 'center' },
  addSet: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.s },
  addExercise: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
    borderRadius: radius.m,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
    marginTop: spacing.m,
  },
  notes: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.l,
    padding: spacing.base,
    marginTop: spacing.l,
    minHeight: 80,
    textAlignVertical: 'top',
    color: colors.text,
    ...typography.body,
    fontSize: 14,
  },
});
