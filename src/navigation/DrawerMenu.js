import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';
import Logo from '../components/Logo';
import { Caps, Mono, Divider } from '../components/VoltPrimitives';
import { mockUser } from '../data/mockUser';
import { colors, spacing, radius, typography } from '../theme';

const ITEMS = [
  { label: 'Home', tab: 'Home', icon: 'home-outline' },
  { label: 'Stats', tab: 'Activity', icon: 'pulse-outline' },
  { label: 'Map', tab: 'Map', icon: 'map-outline' },
  { label: 'Discover', tab: 'Discover', icon: 'search-outline' },
  { label: 'Profile', tab: 'Profile', icon: 'person-outline' },
];

const STACK_ITEMS = [
  { label: 'Inbox', screen: 'Inbox', icon: 'file-tray-outline' },
  { label: 'Meetups', screen: 'Meetups', icon: 'people-outline' },
  { label: 'Achievements', screen: 'Achievements', icon: 'trophy-outline' },
  { label: 'Gym Pass', screen: 'FitnessCenterPass', icon: 'card-outline' },
  { label: 'Settings', screen: 'Settings', icon: 'settings-outline' },
];

// VOLT drawer — `bg-alt` background, VOLT wordmark at top, profile row, then
// nav items each with stroke icon + name + chevron, separated by 1px lineSoft.
// Footer Caps "v0.1 · iOS".
export default function DrawerMenu(props) {
  const { navigation } = props;

  const goTab = (tab) => {
    navigation.navigate('Tabs', { screen: tab });
    navigation.closeDrawer();
  };

  const goStack = (screen) => {
    navigation.closeDrawer();
    navigation.getParent()?.navigate(screen);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.brand}>
        <Logo size={22} />
      </View>

      <View style={styles.profile}>
        <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
        <View style={{ marginLeft: spacing.m, flex: 1 }}>
          <Text style={styles.name}>{mockUser.name}</Text>
          <Mono size={11}>{`@${mockUser.handle || 'codybrown'}`}</Mono>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>L4</Text>
        </View>
      </View>

      <Divider style={{ marginVertical: spacing.l }} />

      <Caps size={9} color={colors.textMute} style={styles.section}>
        Navigate
      </Caps>
      {ITEMS.map((it) => (
        <NavItem key={it.label} item={it} onPress={() => goTab(it.tab)} />
      ))}

      <Caps size={9} color={colors.textMute} style={[styles.section, { marginTop: spacing.l }]}>
        More
      </Caps>
      {STACK_ITEMS.map((it) => (
        <NavItem key={it.label} item={it} onPress={() => goStack(it.screen)} />
      ))}

      <View style={styles.spacer} />

      <TouchableOpacity
        style={[styles.item, { marginTop: spacing.l }]}
        onPress={() => {
          navigation.closeDrawer();
          navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Splash' }] });
        }}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.accent2} />
        <Text style={[styles.itemText, { color: colors.accent2 }]}>Log Out</Text>
      </TouchableOpacity>

      <Caps size={9} color={colors.textDim} style={styles.footer}>
        v0.1 · iOS
      </Caps>
    </DrawerContentScrollView>
  );
}

function NavItem({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={item.icon} size={18} color={colors.text} />
      <Text style={styles.itemText}>{item.label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgAlt,
    flexGrow: 1,
    paddingHorizontal: spacing.edge,
    paddingTop: spacing.xxl,
  },
  brand: { marginBottom: spacing.xl },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: { width: 44, height: 44, borderRadius: radius.s },
  name: { ...typography.body, color: colors.text, fontWeight: '600' },
  levelBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.s,
  },
  levelText: {
    ...typography.capsSm,
    color: '#0A0C10',
    fontWeight: '700',
  },
  section: { marginBottom: spacing.s },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  itemText: {
    color: colors.text,
    marginLeft: spacing.m,
    flex: 1,
    ...typography.body,
    fontSize: 14,
  },
  spacer: { flex: 1 },
  footer: { textAlign: 'center', paddingVertical: spacing.l, marginTop: spacing.l },
});
