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
import { isValidEmail, isValidPassword } from '../../utils/validation';
import { friendlyAuthError } from '../../services/authErrors';
import { strings } from '../../i18n/strings';
import { colors, spacing, typography } from '../../theme';

export default function SignUpEmailScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({ email: null, password: null, confirm: null, form: null });
  const [verificationToken, setVerificationToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    const next = {
      email: isValidEmail(email) ? null : strings.auth.invalidEmail,
      password: isValidPassword(password) ? null : strings.auth.passwordTooShort,
      confirm: password === confirm ? null : strings.auth.passwordsMismatch,
      form: null,
    };
    setErrors(next);
    if (next.email || next.password || next.confirm) return;

    // Register the account immediately — onboarding steps only patch the profile.
    setSubmitting(true);
    try {
      const result = await register({ email: email.trim(), password });
      const token = result?.devVerificationToken ?? null;
      if (token) setVerificationToken(String(token));
      navigation.navigate('OnboardingTrack');
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        form: friendlyAuthError(e, { fallback: strings.auth.signUpFailed }),
      }));
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
            if (errors.email || errors.form) setErrors((e) => ({ ...e, email: null, form: null }));
          }}
          placeholder="you@example.com"
          placeholderTextColor={colors.textDim}
          autoCapitalize="none"
          keyboardType="email-address"
          accessibilityLabel="Email"
          returnKeyType="next"
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <View style={[styles.labelRow, { marginTop: spacing.l }]}>
          <Caps size={9} color={colors.textMute}>
            Password
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
          style={[styles.input, errors.password && styles.inputError]}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password || errors.confirm || errors.form)
              setErrors((e) => ({ ...e, password: null, confirm: null, form: null }));
          }}
          placeholder="••••••••"
          placeholderTextColor={colors.textDim}
          secureTextEntry={!showPassword}
          accessibilityLabel="Password"
          returnKeyType="next"
        />
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        <View style={[styles.labelRow, { marginTop: spacing.l }]}>
          <Caps size={9} color={colors.textMute}>
            {strings.auth.confirmPasswordLabel}
          </Caps>
          <TouchableOpacity
            onPress={() => setShowConfirm((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={showConfirm ? strings.auth.hidePassword : strings.auth.showPassword}
          >
            <Text style={styles.toggle}>
              {(showConfirm ? strings.auth.hidePassword : strings.auth.showPassword).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.input, errors.confirm && styles.inputError]}
          value={confirm}
          onChangeText={(t) => {
            setConfirm(t);
            if (errors.confirm || errors.form)
              setErrors((e) => ({ ...e, confirm: null, form: null }));
          }}
          placeholder={strings.auth.confirmPasswordPlaceholder}
          placeholderTextColor={colors.textDim}
          secureTextEntry={!showConfirm}
          accessibilityLabel={strings.auth.confirmPasswordLabel}
          returnKeyType="go"
          onSubmitEditing={handleContinue}
        />
        {errors.confirm ? <Text style={styles.errorText}>{errors.confirm}</Text> : null}
        {errors.form ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {errors.form}
          </Text>
        ) : null}
        {verificationToken ? (
          <Text style={styles.noticeText} accessibilityLiveRegion="polite">
            {strings.auth.verificationNotice}
          </Text>
        ) : null}

        <View style={[styles.cta, { marginBottom: insets.bottom + spacing.l }]}>
          <PrimaryButton
            label={strings.auth.createAccount}
            trailingIcon="arrow-forward"
            onPress={handleContinue}
            loading={submitting}
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
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
  noticeText: { ...typography.mono, fontSize: 11, color: colors.accent, marginTop: 8 },
  cta: { marginTop: 'auto' },
});
