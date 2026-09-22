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
import { useAuth } from '../../state/AuthContext';
import { isValidEmail, isValidPassword } from '../../utils/validation';
import { strings } from '../../i18n/strings';
import { colors, spacing, typography } from '../../theme';

function serverMessage(e) {
  const msg = e?.response?.data?.message || e?.message;
  if (typeof msg === 'string' && msg.trim()) return msg;
  return strings.auth.signInFailed;
}

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: null, password: null, form: null });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const next = {
      email: isValidEmail(email) ? null : strings.auth.invalidEmail,
      password: isValidPassword(password) ? null : strings.auth.passwordTooShort,
      form: null,
    };
    setErrors(next);
    if (next.email || next.password) return;

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (e) {
      setErrors((prev) => ({ ...prev, form: serverMessage(e) }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <HeaderBar onBack={() => navigation.goBack()} title="LOG IN" />

      <View style={styles.body}>
        <Caps size={10} color={colors.textMute}>
          Account
        </Caps>
        <Text style={styles.title}>
          Welcome{'\n'}
          <Text style={{ color: colors.accent }}>back.</Text>
        </Text>

        <Caps size={9} color={colors.textMute} style={styles.label}>
          {strings.auth.emailLabel}
        </Caps>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (errors.email || errors.form) setErrors((e) => ({ ...e, email: null, form: null }));
          }}
          placeholder={strings.auth.emailPlaceholder}
          placeholderTextColor={colors.textDim}
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          accessibilityLabel={strings.auth.emailLabel}
          returnKeyType="next"
        />
        {errors.email ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {errors.email}
          </Text>
        ) : null}

        <Caps size={9} color={colors.textMute} style={[styles.label, { marginTop: spacing.l }]}>
          {strings.auth.passwordLabel}
        </Caps>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password || errors.form)
              setErrors((e) => ({ ...e, password: null, form: null }));
          }}
          placeholder={strings.auth.passwordPlaceholder}
          placeholderTextColor={colors.textDim}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          accessibilityLabel={strings.auth.passwordLabel}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
        {errors.password ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {errors.password}
          </Text>
        ) : null}
        {errors.form ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {errors.form}
          </Text>
        ) : null}

        <View style={[styles.cta, { marginBottom: insets.bottom + spacing.l }]}>
          <PrimaryButton
            label="Sign in"
            trailingIcon="arrow-forward"
            onPress={handleSubmit}
            disabled={submitting}
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
  inputError: { borderBottomColor: colors.accent2 },
  errorText: { ...typography.mono, fontSize: 11, color: colors.accent2, marginTop: 4 },
  cta: { marginTop: 'auto' },
});
