import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import PrimaryButton from '../../components/PrimaryButton';
import OutlineButton from '../../components/OutlineButton';
import { colors, spacing, typography } from '../../theme';

const TABS = [
  { value: 'signup', label: 'Sign Up' },
  { value: 'login', label: 'Log In' },
];

export default function CreateAccountScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('signup');

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.logoWrap}>
        <Logo size={64} wordmarkColor={colors.accent} />
      </View>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>{tab === 'signup' ? 'Create a\nNew Account' : 'Welcome\nBack'}</Text>
        <View style={styles.titleDivider} />
      </View>

      <View style={styles.spacer} />

      <View style={styles.tabsRow}>
        {TABS.map((t) => {
          const active = t.value === tab;
          return (
            <View key={t.value} style={styles.tabCol}>
              <Text
                onPress={() => setTab(t.value)}
                style={[styles.tabLabel, !active && styles.tabLabelInactive]}
              >
                {t.label}
              </Text>
              <View style={[styles.tabUnderline, active && styles.tabUnderlineActive]} />
            </View>
          );
        })}
      </View>

      <View style={[styles.actions, { paddingBottom: insets.bottom + spacing.xxl }]}>
        {tab === 'signup' ? (
          <>
            <PrimaryButton
              label="Sign up with Email"
              trailingIcon="mail-outline"
              onPress={() => navigation.navigate('SignUpEmail')}
              style={styles.cta}
            />
            <OutlineButton
              label="Sign up with Phone Number"
              onPress={() => navigation.navigate('SignUpPhone')}
              style={styles.ctaOutline}
            />
          </>
        ) : (
          <>
            <PrimaryButton
              label="Log in with Email"
              trailingIcon="mail-outline"
              onPress={() => navigation.navigate('Login')}
              style={styles.cta}
            />
            <OutlineButton
              label="Log in with Phone Number"
              onPress={() => navigation.navigate('Login')}
              style={styles.ctaOutline}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDark, paddingHorizontal: spacing.xl },
  logoWrap: { alignItems: 'center' },
  titleWrap: { marginTop: spacing.xxxl, alignItems: 'flex-start' },
  title: { ...typography.h1, color: colors.textOnDark },
  titleDivider: { width: 28, height: 1, backgroundColor: colors.textOnDark, marginVertical: spacing.base, opacity: 0.85 },
  spacer: { flex: 1 },
  tabsRow: { flexDirection: 'row', marginBottom: spacing.xl },
  tabCol: { flex: 1, alignItems: 'center' },
  tabLabel: { ...typography.h3, color: colors.textOnDark, paddingVertical: spacing.m, fontWeight: '400' },
  tabLabelInactive: { color: colors.textOnDarkMuted },
  tabUnderline: { height: 2, backgroundColor: 'transparent', alignSelf: 'stretch' },
  tabUnderlineActive: { backgroundColor: colors.accent },
  actions: { paddingTop: spacing.l },
  cta: { marginBottom: spacing.base },
  ctaOutline: {},
});
