import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import ActivityCard from '../../components/ActivityCard';
import PageDots from '../../components/PageDots';
import PrimaryButton from '../../components/PrimaryButton';
import { popularActivities } from '../../data/mockActivities';
import { useAuth } from '../../state/AuthContext';
import { colors, spacing, typography } from '../../theme';

export default function OnboardingFavoritesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const finish = () => signIn({ email: 'guest@adventfitness.app' });
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => finish()} hitSlop={12}>
          <Text style={styles.skip}>SKIP</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>{'Add Your\nFavorite Activities'}</Text>
        <View style={styles.divider} />
        <Text style={styles.sub}>To Your Personalized Profile</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cards}
      >
        {popularActivities.map((a) => (
          <ActivityCard
            key={a.id}
            title={a.title}
            sublabel={a.sublabel.toUpperCase()}
            image={a.image}
            icon={a.type === 'surfing' ? 'wave' : 'mountain'}
            width={240}
            height={320}
          />
        ))}
      </ScrollView>

      <View style={styles.dots}>
        <PageDots count={3} active={0} />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
        <PrimaryButton label="Next" onPress={() => finish()} />
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
  titleWrap: { paddingHorizontal: spacing.xl, paddingTop: spacing.l, alignItems: 'center' },
  title: { ...typography.h1, color: colors.textOnDark, textAlign: 'center' },
  divider: { width: 28, height: 1, backgroundColor: colors.textOnDark, marginVertical: spacing.base, opacity: 0.85 },
  sub: { ...typography.body, color: colors.textOnDarkMuted, textAlign: 'center' },
  cards: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.l },
  dots: { marginVertical: spacing.l },
  footer: { paddingHorizontal: spacing.xxl, paddingTop: spacing.s },
});
