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
import OutlineButton from '../../components/OutlineButton';
import { Caps } from '../../components/VoltPrimitives';
import { useAuth } from '../../state/AuthContext';
import { isValidEmail, isValidPassword } from '../../utils/validation';
import { friendlyAuthError } from '../../services/authErrors';
import { strings } from '../../i18n/strings';
import { colors, spacing, typography } from '../../theme';

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
const DEMO_EMAIL = 'member@volt.test';
const DEMO_PASSWORD = 'Volt12345!';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: null, password: null, form: null });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (overrides) => {
    const nextEmail = overrides?.email ?? email;
    const nextPassword = overrides?.password ?? password;
    const next = {
      email: isValidEmail(nextEmail) ? null : strings.auth.invalidEmail,
      password: isValidPassword(nextPassword) ? null : strings.auth.passwordTooShort,
      form: null,
    };
    setErrors(next);
    if (next.email || next.password) return;

    setSubmitting(true);
    try {
      await login({ email: nextEmail.trim(), password: nextPassword });
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        form: friendlyAuthError(e, { fallback: strings.auth.signInFailed }),
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    await handleSubmit({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
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

        <View style={[styles.labelRow, { marginTop: spacing.l }]}>
          <Caps size={9} color={colors.textMute}>
            {strings.auth.passwordLabel}
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
            if (errors.password || errors.form)
              setErrors((e) => ({ ...e, password: null, form: null }));
          }}
          placeholder={strings.auth.passwordPlaceholder}
          placeholderTextColor={colors.textDim}
          secureTextEntry={!showPassword}
          autoComplete="password"
          textContentType="password"
          accessibilityLabel={strings.auth.passwordLabel}
          returnKeyType="go"
          onSubmitEditing={() => handleSubmit()}
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

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotBtn}
          accessibilityRole="button"
        >
          <Text style={styles.forgotText}>{strings.auth.forgotPassword.toUpperCase()}</Text>
        </TouchableOpacity>

        <View style={[styles.cta, { marginBottom: insets.bottom + spacing.l }]}>
          {isDev ? (
            <OutlineButton
              label={strings.auth.useDemoAccount}
              onPress={handleDemo}
              disabled={submitting}
              style={{ marginBottom: spacing.m }}
            />
          ) : null}
          <PrimaryButton
            label="Sign in"
            trailingIcon="arrow-forward"
            onPress={() => handleSubmit()}
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
  forgotBtn: { alignSelf: 'flex-start', paddingVertical: spacing.s, marginTop: spacing.s },
  forgotText: { ...typography.caps, fontSize: 10, color: colors.textMute },
  cta: { marginTop: 'auto' },
});
