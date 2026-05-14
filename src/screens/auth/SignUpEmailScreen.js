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
import { colors, spacing, typography } from '../../theme';

export default function SignUpEmailScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
          <Text style={{ color: colors.accent }}>email.</Text>
        </Text>

        <Caps size={9} color={colors.textMute} style={styles.label}>
          Email
        </Caps>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.textDim}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Caps size={9} color={colors.textMute} style={[styles.label, { marginTop: spacing.l }]}>
          Password
        </Caps>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textDim}
          secureTextEntry
        />

        <View style={[styles.cta, { marginBottom: insets.bottom + spacing.l }]}>
          <PrimaryButton
            label="Continue"
            trailingIcon="arrow-forward"
            onPress={() => navigation.navigate('OnboardingTrack')}
          />
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
    color: colors.text,
    ...typography.body,
    fontSize: 15,
  },
  cta: { marginTop: 'auto' },
});
