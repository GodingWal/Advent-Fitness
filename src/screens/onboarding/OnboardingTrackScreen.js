import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import IconBadge from '../../components/IconBadge';
import PageDots from '../../components/PageDots';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../state/AuthContext';
import { colors, spacing, typography } from '../../theme';

export default function OnboardingTrackScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const skip = () => signIn({ email: 'guest@adventfitness.app' });
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={skip} hitSlop={12}>
          <Text style={styles.skip}>SKIP</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{'Easily Track\nAny Activity'}</Text>
        <View style={styles.divider} />
        <Text style={styles.sub}>Log & record your activities</Text>

        <View style={styles.iconWrap}>
          <View style={styles.glow} />
          <View style={styles.glow2} />
          <IconBadge icon="diamondPlus" size={150} bg={colors.accent} color={colors.white} />
        </View>

        <View style={styles.dots}>
          <PageDots count={3} active={1} />
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
        <PrimaryButton label="Next" onPress={() => navigation.navigate('OnboardingFavorites')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDark },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.s,
  },
  skip: { ...typography.labelCaps, color: 'rgba(255,255,255,0.5)' },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  title: { ...typography.h1, color: colors.textOnDark, textAlign: 'center' },
  divider: { width: 28, height: 1, backgroundColor: colors.textOnDark, marginVertical: spacing.base, opacity: 0.85 },
  sub: { ...typography.body, color: colors.textOnDarkMuted, textAlign: 'center' },
  iconWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.accent,
    opacity: 0.15,
  },
  glow2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accent,
    opacity: 0.25,
  },
  dots: { marginBottom: spacing.l },
  footer: { paddingHorizontal: spacing.xxl, paddingTop: spacing.l },
});
