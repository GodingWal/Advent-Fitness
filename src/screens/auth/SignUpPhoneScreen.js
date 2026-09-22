import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderBar from '../../components/HeaderBar';
import PrimaryButton from '../../components/PrimaryButton';
import { Caps } from '../../components/VoltPrimitives';
import { strings } from '../../i18n/strings';
import { colors, spacing, typography } from '../../theme';

export default function SignUpPhoneScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <HeaderBar onBack={() => navigation.goBack()} title="SIGN UP" />

      <View style={styles.body}>
        <Caps size={10} color={colors.textMute}>
          Step 02 / 03
        </Caps>
        <Text style={styles.title}>
          Sign up with{'\n'}
          <Text style={{ color: colors.accent }}>phone.</Text>
        </Text>

        <Caps size={9} color={colors.textMute} style={styles.label}>
          Phone Number
        </Caps>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="(555) 555-5555"
          placeholderTextColor={colors.textDim}
          keyboardType="phone-pad"
          editable={false}
        />
        <Text style={styles.noticeText}>{strings.auth.phoneComingSoon}</Text>

        <View style={[styles.cta, { marginBottom: insets.bottom + spacing.l }]}>
          <PrimaryButton label={strings.auth.phoneComingSoon} onPress={() => {}} disabled />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, paddingHorizontal: spacing.edge, paddingTop: spacing.l },
  title: {
    ...typography.h1,
    fontSize: 38,
    lineHeight: 40,
    color: colors.text,
    marginTop: spacing.s,
    marginBottom: spacing.xl,
  },
  label: { marginBottom: spacing.s },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: spacing.m,
    color: colors.textDim,
    ...typography.body,
    fontSize: 15,
  },
  noticeText: { ...typography.mono, fontSize: 11, color: colors.textMute, marginTop: 8 },
  cta: { marginTop: 'auto' },
});
