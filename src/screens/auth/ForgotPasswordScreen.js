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
import { Caps, Mono } from '../../components/VoltPrimitives';
import { useAuth } from '../../state/AuthContext';
import { isValidEmail } from '../../utils/validation';
import { friendlyAuthError } from '../../services/authErrors';
import { strings } from '../../i18n/strings';
import { colors, spacing, typography } from '../../theme';

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

export default function ForgotPasswordScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setError(strings.auth.invalidEmail);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const data = await requestPasswordReset(email.trim());
      setSent(true);
      if (isDev && data?.devResetToken) setDevToken(String(data.devResetToken));
      else setDevToken(null);
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
          {strings.auth.forgotTitle.split('\n')[0]}
          {'\n'}
          <Text style={{ color: colors.accent }}>{strings.auth.forgotTitle.split('\n')[1]}</Text>
        </Text>
        <Text style={styles.subhead}>{strings.auth.forgotBody}</Text>

        <Caps size={9} color={colors.textMute} style={styles.label}>
          {strings.auth.emailLabel}
        </Caps>
        <TextInput
          style={[styles.input, error && !sent && styles.inputError]}
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (error) setError(null);
          }}
          placeholder={strings.auth.emailPlaceholder}
          placeholderTextColor={colors.textDim}
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          accessibilityLabel={strings.auth.emailLabel}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
        {error ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
        {sent ? (
          <Text style={styles.sentText} accessibilityLiveRegion="polite">
            {strings.auth.resetLinkSent}
          </Text>
        ) : null}
        {isDev && sent && devToken ? (
          <View style={styles.devBox}>
            <Caps size={9} color={colors.textMute}>
              DEV RESET TOKEN
            </Caps>
            <Mono size={12} color={colors.accent} style={{ marginTop: 6 }}>
              {devToken}
            </Mono>
          </View>
        ) : null}

        <View style={[styles.cta, { marginBottom: insets.bottom + spacing.l }]}>
          <PrimaryButton
            label={strings.auth.sendResetLink}
            trailingIcon="arrow-forward"
            onPress={handleSubmit}
            loading={submitting}
          />
          {sent ? (
            <PrimaryButton
              label={strings.auth.resetPassword}
              onPress={() =>
                navigation.navigate('ResetPassword', devToken ? { token: devToken } : undefined)
              }
              variant="secondary"
              style={{ marginTop: spacing.m }}
            />
          ) : null}
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
  },
  subhead: { ...typography.body, fontSize: 14, color: colors.textMute, marginTop: spacing.m },
  label: { marginBottom: spacing.s, marginTop: spacing.xl },
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
  devBox: {
    marginTop: spacing.base,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: 8,
    padding: spacing.base,
  },
  cta: { marginTop: 'auto' },
});
