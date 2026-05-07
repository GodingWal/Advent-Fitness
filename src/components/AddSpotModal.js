import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { POI_CATEGORIES } from '../data/mockPOIs';
import { colors, spacing, radius, typography, shadows } from '../theme';

const SELECTABLE = POI_CATEGORIES.filter((c) => c.id !== 'all');

export default function AddSpotModal({ visible, coordinate, onCancel, onSubmit }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('trails');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      setName('');
      setCategory('trails');
      setNotes('');
    }
  }, [visible]);

  const submit = () => {
    if (!name.trim() || !coordinate) return;
    onSubmit({
      id: `user_${Date.now()}`,
      category,
      name: name.trim(),
      address: notes.trim() || 'User-submitted spot',
      coordinate,
      userSubmitted: true,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>Submit a Spot</Text>
            <TouchableOpacity onPress={onCancel} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          {coordinate ? (
            <Text style={styles.coordText}>
              {coordinate.latitude.toFixed(5)}, {coordinate.longitude.toFixed(5)}
            </Text>
          ) : null}

          <Text style={styles.label}>NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="e.g. Hidden Trailhead"
            placeholderTextColor={colors.textMuted}
            autoFocus
          />

          <Text style={styles.label}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {SELECTABLE.map((c) => {
              const active = c.id === category;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setCategory(c.id)}
                >
                  <Ionicons
                    name={c.icon}
                    size={14}
                    color={active ? colors.white : colors.accent}
                  />
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>NOTES (OPTIONAL)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, styles.notes]}
            placeholder="What should others know?"
            placeholderTextColor={colors.textMuted}
            multiline
          />

          <TouchableOpacity
            style={[styles.submit, !name.trim() && styles.submitDisabled]}
            onPress={submit}
            disabled={!name.trim()}
            activeOpacity={0.85}
          >
            <Text style={styles.submitLabel}>Submit Spot</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.l,
    paddingBottom: spacing.xxl,
    ...shadows.card,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    alignSelf: 'center',
    marginBottom: spacing.base,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.h3, fontWeight: '500', color: colors.textPrimary },
  coordText: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  label: { ...typography.labelCapsSmall, color: colors.textSecondary, marginTop: spacing.base },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingVertical: spacing.m,
    color: colors.textPrimary,
    ...typography.body,
  },
  notes: { minHeight: 60, textAlignVertical: 'top' },
  chips: { paddingVertical: spacing.s },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.divider,
    marginRight: spacing.s,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipLabel: { ...typography.bodySmall, color: colors.textPrimary, marginLeft: 4 },
  chipLabelActive: { color: colors.white },
  submit: {
    marginTop: spacing.l,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.base,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.4 },
  submitLabel: { ...typography.labelCaps, color: colors.white },
});
