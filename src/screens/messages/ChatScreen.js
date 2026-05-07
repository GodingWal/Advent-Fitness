import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import MessageBubble from '../../components/MessageBubble';
import { sampleThread } from '../../data/mockMessages';
import { friends } from '../../data/mockFriends';
import { mockUser } from '../../data/mockUser';
import { colors, spacing, radius, typography, shadows } from '../../theme';

export default function ChatScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const friend = route?.params?.friend || friends[5];
  const [messages, setMessages] = useState(sampleThread);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 50);
  }, []);

  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [
      ...m,
      { id: `m${m.length + 1}`, fromMe: true, text: draft.trim(), time: 'Now' },
    ]);
    setDraft('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View>
        <HeaderBar onBack={() => navigation.goBack()} bordered />
        <View style={styles.titleRow}>
          <Image source={{ uri: friend.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{friend.firstName}</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            avatar={m.fromMe ? mockUser.avatar : friend.avatar}
          />
        ))}
        <Text style={styles.dayMarker}>Yesterday 11:12 AM</Text>
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: insets.bottom + spacing.s }]}>
        <TouchableOpacity hitSlop={10}>
          <Ionicons name="mic-outline" size={26} color={colors.accent} />
        </TouchableOpacity>
        <TouchableOpacity hitSlop={10} style={{ marginLeft: spacing.m }}>
          <Ionicons name="camera-outline" size={26} color={colors.accent} />
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            style={styles.input}
            placeholder="Write a message..."
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={send}
          />
        </View>
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Ionicons name="send" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceMuted },
  titleRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 50,
    alignItems: 'center',
  },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  name: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  scroll: { paddingVertical: spacing.l },
  dayMarker: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.l,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.m,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  inputWrap: {
    flex: 1,
    marginHorizontal: spacing.m,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingHorizontal: spacing.base,
    ...shadows.cardLight,
  },
  input: {
    paddingVertical: spacing.m,
    color: colors.textPrimary,
    ...typography.body,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
