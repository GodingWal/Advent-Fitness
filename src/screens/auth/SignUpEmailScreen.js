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
import { isValidEmail, isValidPassword } from '../../utils/validation';
import { strings } from '../../i18n/strings';
import { colors, spacing, typography } from '../../theme';

export default function SignUpEmailScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: null, password: null });

  const handleContinue = () => {
    const next = {
      email: isValidEmail(email) ? null : strings.auth.invalidEmail,
      password: isValidPassword(password) ? null : strings.auth.passwordTooShort,
    };
    setErrors(next);
    if (next.email || next.password) return;

    navigation.navigate('OnboardingTrack', {
      pendingSignup: { email: email.trim(), password },
    });
  };

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
          style={[styles.input, errors.email && styles.inputError]}
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (errors.email) setErrors((e) => ({ ...e, email: null }));
          }}
          placeholder="you@example.com"
          placeholderTextColor={colors.textDim}
          autoCapitalize="none"
          keyboardType="email-address"
          accessibilityLabel="Email"
          returnKeyType="next"
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <Caps size={9} color={colors.textMute} style={[styles.label, { marginTop: spacing.l }]}>
          Password
        </Caps>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password) setErrors((e) => ({ ...e, password: null }));
          }}
          placeholder="••••••••"
          placeholderTextColor={colors.textDim}
          secureTextEntry
          accessibilityLabel="Password"
          returnKeyType="go"
          onSubmitEditing={handleContinue}
        />
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        <View style={[styles.cta, { marginBottom: insets.bottom + spacing.l }]}>
          <PrimaryButton label="Continue" trailingIcon="arrow-forward" onPress={handleContinue} />
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
  inputError: { borderBottomColor: colors.accent2 },
  errorText: { ...typography.mono, fontSize: 11, color: colors.accent2, marginTop: 4 },
  cta: { marginTop: 'auto' },
});
