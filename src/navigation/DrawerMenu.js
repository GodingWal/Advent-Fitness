import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';
import Logo from '../components/Logo';
import { mockUser } from '../data/mockUser';
import { colors, spacing, typography } from '../theme';

const ITEMS = [
  { label: 'Home', tab: 'Home', icon: 'home-outline' },
  { label: 'Activity', tab: 'Activity', icon: 'pulse-outline' },
  { label: 'Map', tab: 'Map', icon: 'map-outline' },
  { label: 'Discover', tab: 'Discover', icon: 'search-outline' },
  { label: 'Profile', tab: 'Profile', icon: 'person-outline' },
];

const STACK_ITEMS = [
  { label: 'Messages', screen: 'Inbox', icon: 'chatbubbles-outline' },
  { label: 'Group Meetups', screen: 'Meetups', icon: 'people-outline' },
  { label: 'Achievements', screen: 'Achievements', icon: 'trophy-outline' },
  { label: 'Fitness Center Pass', screen: 'FitnessCenterPass', icon: 'card-outline' },
  { label: 'Settings', screen: 'Settings', icon: 'settings-outline' },
];

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
        <Logo size={56} wordmarkColor={colors.white} />
      </View>

      <View style={styles.profile}>
        <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{mockUser.name}</Text>
          <Text style={styles.location}>{mockUser.location}</Text>
        </View>
      </View>

      <Text style={styles.section}>NAVIGATE</Text>
      {ITEMS.map((it) => (
        <TouchableOpacity key={it.label} style={styles.item} onPress={() => goTab(it.tab)}>
          <Ionicons name={it.icon} size={20} color={colors.white} />
          <Text style={styles.itemText}>{it.label}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.section}>MORE</Text>
      {STACK_ITEMS.map((it) => (
        <TouchableOpacity key={it.label} style={styles.item} onPress={() => goStack(it.screen)}>
          <Ionicons name={it.icon} size={20} color={colors.white} />
          <Text style={styles.itemText}>{it.label}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.spacer} />
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          navigation.closeDrawer();
          navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Splash' }] });
        }}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.white} />
        <Text style={styles.itemText}>Log Out</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.bgDark, flexGrow: 1, paddingHorizontal: spacing.l, paddingTop: spacing.l },
  brand: { alignItems: 'flex-start', marginBottom: spacing.l },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: spacing.m },
  name: { ...typography.body, color: colors.white, fontWeight: '500' },
  location: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
  section: { ...typography.labelCapsSmall, color: 'rgba(255,255,255,0.5)', marginTop: spacing.l, marginBottom: spacing.s },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.m },
  itemText: { color: colors.white, marginLeft: spacing.m, ...typography.body },
  spacer: { flex: 1 },
});
