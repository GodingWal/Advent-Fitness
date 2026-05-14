import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';

// VOLT message bubble — sharp 4px radius (no rounded pillows), max-width 74%,
// padding 10x14. Mine: accent bg + dark text. Theirs: surface + lineSoft border.
export default function MessageBubble({ message }) {
  const fromMe = message.fromMe;
  return (
    <View style={[styles.row, fromMe ? styles.rowRight : styles.rowLeft]}>
      <View style={[styles.bubble, fromMe ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={[styles.text, fromMe ? styles.textMe : styles.textThem]}>{message.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: spacing.edge,
  },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '74%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.m,
  },
  bubbleMe: { backgroundColor: colors.accent },
  bubbleThem: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  text: { ...typography.body, fontSize: 14, lineHeight: 20 },
  textMe: { color: '#0A0C10' },
  textThem: { color: colors.text },
});
