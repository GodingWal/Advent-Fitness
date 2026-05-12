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
import { useAuth } from '../../state/AuthContext';
import { isValidEmail, isValidPassword } from '../../utils/validation';
import { strings } from '../../i18n/strings';
import { colors, spacing, typography } from '../../theme';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: null, password: null });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const next = {
      email: isValidEmail(email) ? null : strings.auth.invalidEmail,
      password: isValidPassword(password) ? null : strings.auth.passwordTooShort,
    };
    setErrors(next);
    if (next.email || next.password) return;

    setSubmitting(true);
    try {
      await signIn({ email: email.trim() });
      // RootNavigator switches to AppStack when auth state flips; no manual replace needed.
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
      <HeaderBar
        onBack={() => navigation.goBack()}
        background={colors.bgDark}
        iconColor={colors.white}
      />
      <View style={styles.body}>
        <Text style={styles.title}>{strings.auth.welcomeBack}</Text>
        <View style={styles.divider} />

        <Text style={styles.label}>{strings.auth.emailLabel}</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (errors.email) setErrors((e) => ({ ...e, email: null }));
          }}
          placeholder={strings.auth.emailPlaceholder}
          placeholderTextColor={colors.textOnDarkMuted}
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          accessibilityLabel={strings.auth.emailLabel}
          accessibilityHint="Enter the email address for your account"
          returnKeyType="next"
        />
        {errors.email ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {errors.email}
          </Text>
        ) : null}

        <Text style={[styles.label, { marginTop: spacing.l }]}>{strings.auth.passwordLabel}</Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password) setErrors((e) => ({ ...e, password: null }));
          }}
          placeholder={strings.auth.passwordPlaceholder}
          placeholderTextColor={colors.textOnDarkMuted}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          accessibilityLabel={strings.auth.passwordLabel}
          accessibilityHint="At least 8 characters"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
        {errors.password ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {errors.password}
          </Text>
        ) : null}

        <View style={[styles.cta, { marginBottom: insets.bottom + spacing.l }]}>
          <PrimaryButton
            label={strings.auth.logIn}
            trailingIcon="chevron-forward"
            onPress={handleSubmit}
            disabled={submitting}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDark },
  body: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.l },
  title: { ...typography.h1, color: colors.textOnDark },
  divider: {
    width: 28,
    height: 1,
    backgroundColor: colors.textOnDark,
    marginVertical: spacing.base,
    opacity: 0.85,
  },
  label: { ...typography.labelCapsSmall, color: colors.textOnDarkMuted, marginTop: spacing.xl },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.4)',
    paddingVertical: spacing.m,
    color: colors.white,
    ...typography.body,
  },
  inputError: {
    borderBottomColor: colors.like,
  },
  errorText: {
    ...typography.caption,
    color: colors.like,
    marginTop: spacing.xs,
  },
  cta: { marginTop: 'auto' },
});
