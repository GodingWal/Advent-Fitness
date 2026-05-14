import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import PrimaryButton from './PrimaryButton';
import { Caps, Mono } from './VoltPrimitives';
import { POI_CATEGORIES } from '../data/mockPOIs';
import { colors, spacing, radius, typography } from '../theme';

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
            <Caps size={10} color={colors.textMute}>
              New Spot
            </Caps>
            <TouchableOpacity onPress={onCancel} hitSlop={12}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Submit a spot.</Text>
          {coordinate ? (
            <Mono size={11} style={{ marginTop: 4 }}>
              {coordinate.latitude.toFixed(5)}, {coordinate.longitude.toFixed(5)}
            </Mono>
          ) : null}

          <Caps size={9} color={colors.textMute} style={styles.label}>
            Name
          </Caps>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="e.g. Hidden Trailhead"
            placeholderTextColor={colors.textDim}
            autoFocus
          />

          <Caps size={9} color={colors.textMute} style={styles.label}>
            Category
          </Caps>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {SELECTABLE.map((c) => {
              const active = c.id === category;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setCategory(c.id)}
                >
                  <Ionicons name={c.icon} size={12} color={active ? '#0A0C10' : colors.textMute} />
                  <Caps
                    size={9}
                    color={active ? '#0A0C10' : colors.textMute}
                    style={{ marginLeft: 6 }}
                  >
                    {c.label}
                  </Caps>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Caps size={9} color={colors.textMute} style={styles.label}>
            Notes (optional)
          </Caps>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, styles.notes]}
            placeholder="What should others know?"
            placeholderTextColor={colors.textDim}
            multiline
          />

          <View style={{ marginTop: spacing.l }}>
            <PrimaryButton
              label="Submit"
              trailingIcon="arrow-forward"
              onPress={submit}
              disabled={!name.trim()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bgAlt,
    borderTopLeftRadius: radius.l,
    borderTopRightRadius: radius.l,
    paddingHorizontal: spacing.edge,
    paddingTop: spacing.s,
    paddingBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.line,
  },
  handle: {
    width: 40,
    height: 3,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginBottom: spacing.base,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.h4, fontSize: 24, color: colors.text, marginTop: 4 },
  label: { marginTop: spacing.l, marginBottom: spacing.xs },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: spacing.m,
    color: colors.text,
    ...typography.body,
    fontSize: 15,
  },
  notes: { minHeight: 60, textAlignVertical: 'top' },
  chips: { paddingVertical: spacing.s },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: 8,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    marginRight: spacing.s,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
});
