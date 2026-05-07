import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme';

export default function MessageBubble({ message, avatar }) {
  const fromMe = message.fromMe;
  return (
    <View style={[styles.row, fromMe ? styles.rowRight : styles.rowLeft]}>
      {!fromMe && <Image source={{ uri: avatar }} style={styles.avatar} />}
      <View
        style={[
          styles.bubble,
          fromMe ? styles.bubbleMe : styles.bubbleThem,
        ]}
      >
        <Text style={[styles.text, fromMe ? styles.textMe : styles.textThem]}>
          {message.text}
        </Text>
      </View>
      {fromMe && <Image source={{ uri: avatar }} style={styles.avatar} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: spacing.s,
    paddingHorizontal: spacing.base,
  },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, marginHorizontal: spacing.s },
  bubble: {
    maxWidth: '70%',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.m,
    borderRadius: radius.xl,
    ...shadows.cardLight,
  },
  bubbleMe: { backgroundColor: colors.accent, borderBottomRightRadius: 6 },
  bubbleThem: { backgroundColor: colors.surface, borderBottomLeftRadius: 6 },
  text: { ...typography.body },
  textMe: { color: colors.white },
  textThem: { color: colors.textPrimary },
});
