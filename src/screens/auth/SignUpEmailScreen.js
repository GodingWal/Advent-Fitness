import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderBar from '../../components/HeaderBar';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, spacing, typography, radius } from '../../theme';

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
      <HeaderBar
        onBack={() => navigation.goBack()}
        background={colors.bgDark}
        iconColor={colors.white}
      />
      <View style={styles.body}>
        <Text style={styles.title}>{'Sign Up\nwith Email'}</Text>
        <View style={styles.divider} />

        <Text style={styles.label}>EMAIL</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.textOnDarkMuted}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={[styles.label, { marginTop: spacing.l }]}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textOnDarkMuted}
          secureTextEntry
        />

        <View style={[styles.cta, { marginBottom: insets.bottom + spacing.l }]}>
          <PrimaryButton
            label="Continue"
            trailingIcon="chevron-forward"
            onPress={() => navigation.navigate('OnboardingTrack')}
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
  divider: { width: 28, height: 1, backgroundColor: colors.textOnDark, marginVertical: spacing.base, opacity: 0.85 },
  label: { ...typography.labelCapsSmall, color: colors.textOnDarkMuted, marginTop: spacing.xl },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.4)',
    paddingVertical: spacing.m,
    color: colors.white,
    ...typography.body,
  },
  cta: { marginTop: 'auto' },
});
