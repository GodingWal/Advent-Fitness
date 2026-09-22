import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderBar from '../../components/HeaderBar';
import PrimaryButton from '../../components/PrimaryButton';
import { Caps } from '../../components/VoltPrimitives';
import { useAuth } from '../../state/AuthContext';
import { isValidPassword } from '../../utils/validation';
import { friendlyAuthError } from '../../services/authErrors';
import { strings } from '../../i18n/strings';
import { colors, spacing, typography } from '../../theme';

export default function ResetPasswordScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { confirmPasswordReset } = useAuth();
  const [token, setToken] = useState(String(route?.params?.token || ''));
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!String(token).trim()) {
      setError(strings.auth.genericError);
      return;
    }
    if (!isValidPassword(password)) {
      setError(strings.auth.passwordTooShort);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await confirmPasswordReset({ token: token.trim(), newPassword: password });
      setDone(true);
    } catch (e) {
      setError(friendlyAuthError(e, { fallback: strings.auth.genericError }));
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
      <HeaderBar onBack={() => navigation.goBack()} title="RESET" />

      <View style={styles.body}>
        <Caps size={10} color={colors.textMute}>
          Account
        </Caps>
        <Text style={styles.title}>
          {strings.auth.resetTitle.split('\n')[0]}
          {'\n'}
          <Text style={{ color: colors.accent }}>{strings.auth.resetTitle.split('\n')[1]}</Text>
        </Text>

        <Caps size={9} color={colors.textMute} style={styles.label}>
          {strings.auth.resetTokenLabel}
        </Caps>
        <TextInput
          style={styles.input}
          value={token}
          onChangeText={(t) => {
            setToken(t);
            if (error) setError(null);
          }}
          placeholder={strings.auth.resetTokenPlaceholder}
          placeholderTextColor={colors.textDim}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={strings.auth.resetTokenLabel}
        />

        <View style={styles.labelRow}>
          <Caps size={9} color={colors.textMute}>
            {strings.auth.newPasswordLabel}
          </Caps>
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? strings.auth.hidePassword : strings.auth.showPassword
            }
          >
            <Text style={styles.toggle}>
              {(showPassword ? strings.auth.hidePassword : strings.auth.showPassword).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (error) setError(null);
          }}
          placeholder={strings.auth.passwordPlaceholder}
          placeholderTextColor={colors.textDim}
          secureTextEntry={!showPassword}
          autoComplete="password-new"
          textContentType="newPassword"
          accessibilityLabel={strings.auth.newPasswordLabel}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
        {error ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
        {done ? (
          <Text style={styles.sentText} accessibilityLiveRegion="polite">
            {strings.auth.resetSuccess}
          </Text>
        ) : null}

        <View style={[styles.cta, { marginBottom: insets.bottom + spacing.l }]}>
          {done ? (
            <PrimaryButton
              label={strings.auth.logIn}
              trailingIcon="arrow-forward"
              onPress={() => navigation.navigate('Login')}
            />
          ) : (
            <PrimaryButton
              label={strings.auth.resetPassword}
              trailingIcon="arrow-forward"
              onPress={handleSubmit}
              loading={submitting}
            />
          )}
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
    marginTop: spacing.l,
  },
  toggle: { ...typography.caps, fontSize: 10, color: colors.accent },
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
  sentText: { ...typography.mono, fontSize: 11, color: colors.accent, marginTop: 8 },
  cta: { marginTop: 'auto' },
});
