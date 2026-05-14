import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import PrimaryButton from './PrimaryButton';
import OutlineButton from './OutlineButton';
import { Caps, Mono } from './VoltPrimitives';
import { colors, spacing, radius, typography } from '../theme';

// VOLT friend request modal — surface card, line border, radius 4, padding 24/22.
// Caps "INCOMING · 01", avatar 64 + name h4 + Mono "@handle · 12 mutual",
// 2-col footer: GhostButton "Ignore" + PrimaryButton "Accept".
export default function FriendRequestModal({ visible, friend, onApprove, onRemove, onClose }) {
  if (!friend) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}} style={styles.card}>
          <Caps size={10} color={colors.textMute} style={styles.kicker}>
            Incoming · 01
          </Caps>
          <View style={styles.identity}>
            <Image source={{ uri: friend.avatar }} style={styles.avatar} />
            <View style={styles.identityText}>
              <Text style={styles.name}>{`${friend.firstName} ${friend.lastName}`}</Text>
              <Mono
                size={11}
              >{`@${friend.shortName?.toLowerCase() || friend.firstName.toLowerCase()} · 12 mutual`}</Mono>
            </View>
          </View>

          <View style={styles.footer}>
            <OutlineButton label="Ignore" onPress={onRemove} style={styles.btn} />
            <View style={{ width: spacing.s }} />
            <PrimaryButton label="Accept" onPress={onApprove} style={styles.btn} />
          </View>

          <TouchableOpacity onPress={onClose} style={styles.dismiss}>
            <Text style={styles.dismissText}>DISMISS</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.l,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.edge,
    paddingTop: spacing.xl,
    paddingBottom: spacing.l,
  },
  kicker: { marginBottom: spacing.base },
  identity: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: radius.s },
  identityText: { marginLeft: spacing.base, flex: 1 },
  name: { ...typography.h4, fontSize: 22, color: colors.text, marginBottom: 4 },
  footer: { flexDirection: 'row', marginTop: spacing.xl },
  btn: { flex: 1 },
  dismiss: { alignSelf: 'center', marginTop: spacing.m, padding: spacing.s },
  dismissText: { ...typography.caps, fontSize: 10, color: colors.textDim },
});
