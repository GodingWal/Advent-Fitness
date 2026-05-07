import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../theme';

export default function FriendRequestModal({ visible, friend, onApprove, onRemove, onClose }) {
  if (!friend) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.closeIcon} onPress={onClose}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Pressable onPress={() => {}} style={styles.card}>
          <Image source={{ uri: friend.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{`${friend.firstName} ${friend.lastName}`}</Text>
          <Text style={styles.sub}>Sent you a Friend Request!</Text>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.btn} onPress={onApprove}>
              <Text style={styles.btnLabel}>APPROVE</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.btn} onPress={onRemove}>
              <Text style={styles.btnLabel}>REMOVE</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.l,
  },
  closeIcon: { position: 'absolute', top: 60, left: spacing.base },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    width: '100%',
    paddingTop: 70,
    alignItems: 'center',
    ...shadows.card,
  },
  avatar: {
    position: 'absolute',
    top: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.surface,
  },
  name: { ...typography.h3, fontWeight: '500', color: colors.textPrimary },
  sub: { ...typography.body, color: colors.accent, marginTop: 4, marginBottom: spacing.xl },
  footer: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  btn: { flex: 1, paddingVertical: spacing.base, alignItems: 'center' },
  btnLabel: { ...typography.labelCaps, color: colors.accent },
  divider: { width: 1, backgroundColor: colors.divider },
});
