import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderBar from '../../components/HeaderBar';
import PrimaryButton from '../../components/PrimaryButton';
import OutlineButton from '../../components/OutlineButton';
import { Caps } from '../../components/VoltPrimitives';
import { colors, spacing, typography } from '../../theme';

const TABS = [
  { value: 'signup', label: 'Sign Up' },
  { value: 'login', label: 'Log In' },
];

// VOLT account screen — BackBar "ACCOUNT", Caps kicker "Step 01 / 03", h1
// "Create your / account." (accent period). Tab row with 2px lime underline.
export default function CreateAccountScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('signup');

  const title = tab === 'signup' ? 'Create your\n' : 'Welcome\n';
  const tail = tab === 'signup' ? 'account.' : 'back.';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HeaderBar onBack={() => navigation.goBack()} title="ACCOUNT" />

      <View style={[styles.body, { paddingBottom: insets.bottom + spacing.l }]}>
        <Caps size={10} color={colors.textMute}>
          Step 01 / 03
        </Caps>
        <Text style={styles.title}>
          {title}
          <Text style={{ color: colors.accent }}>{tail}</Text>
        </Text>

        <View style={styles.tabsRow}>
          {TABS.map((t) => {
            const active = t.value === tab;
            return (
              <TouchableOpacity
                key={t.value}
                style={styles.tabCol}
                onPress={() => setTab(t.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabLabel, !active && styles.tabLabelInactive]}>
                  {t.label.toUpperCase()}
                </Text>
                <View style={[styles.tabUnderline, active && styles.tabUnderlineActive]} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <View style={styles.actions}>
          {tab === 'signup' ? (
            <>
              <PrimaryButton
                label="Sign up with Email"
                trailingIcon="arrow-forward"
                onPress={() => navigation.navigate('SignUpEmail')}
                style={styles.cta}
              />
              <OutlineButton
                label="Sign up with Phone"
                onPress={() => navigation.navigate('SignUpPhone')}
              />
            </>
          ) : (
            <>
              <PrimaryButton
                label="Log in with Email"
                trailingIcon="arrow-forward"
                onPress={() => navigation.navigate('Login')}
                style={styles.cta}
              />
              <OutlineButton
                label="Log in with Phone"
                onPress={() => navigation.navigate('Login')}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: {
    flex: 1,
    paddingHorizontal: spacing.edge,
    paddingTop: spacing.l,
  },
  title: {
    ...typography.h1,
    fontSize: 38,
    lineHeight: 40,
    color: colors.text,
    marginTop: spacing.s,
  },
  tabsRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  tabCol: { flex: 1, alignItems: 'center', paddingVertical: spacing.m },
  tabLabel: {
    ...typography.caps,
    fontSize: 11,
    color: colors.text,
  },
  tabLabelInactive: { color: colors.textMute },
  tabUnderline: {
    height: 2,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
  },
  tabUnderlineActive: { backgroundColor: colors.accent },
  spacer: { flex: 1 },
  actions: { paddingTop: spacing.l },
  cta: { marginBottom: spacing.m },
});
