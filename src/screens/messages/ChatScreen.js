import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import MessageBubble from '../../components/MessageBubble';
import { Caps } from '../../components/VoltPrimitives';
import { sampleThread } from '../../data/mockMessages';
import { friends } from '../../data/mockFriends';
import { colors, spacing, radius, typography } from '../../theme';

// VOLT chat — BackBar with sender's first name in caps + phone icon right.
// Centered Caps "Today · 11:12" divider. Composer with camera + bordered
// input + 40×40 accent send button.
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
      <HeaderBar
        onBack={() => navigation.goBack()}
        title={friend.firstName?.toUpperCase()}
        rightIcon="call-outline"
        onRight={() => {}}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Caps size={9} color={colors.textMute} style={styles.dayMarker}>
          Today · 11:12
        </Caps>
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: insets.bottom + spacing.s }]}>
        <TouchableOpacity hitSlop={10} style={styles.composerBtn}>
          <Ionicons name="camera-outline" size={20} color={colors.textMute} />
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            style={styles.input}
            placeholder="Message"
            placeholderTextColor={colors.textDim}
            onSubmitEditing={send}
          />
        </View>
        <TouchableOpacity style={styles.sendBtn} onPress={send} activeOpacity={0.85}>
          <Ionicons name="arrow-up" size={18} color="#0A0C10" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingVertical: spacing.l },
  dayMarker: { textAlign: 'center', marginVertical: spacing.l },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.edge,
    paddingTop: spacing.m,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
  },
  composerBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.s,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    paddingHorizontal: spacing.base,
    height: 40,
    justifyContent: 'center',
  },
  input: {
    color: colors.text,
    ...typography.body,
    fontSize: 14,
    paddingVertical: 0,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.m,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.s,
  },
});
