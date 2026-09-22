import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeFeedScreen from '../screens/home/HomeFeedScreen';
import ActivityListScreen from '../screens/activity/ActivityListScreen';
import DiscoverScreen from '../screens/discover/DiscoverScreen';
import MapScreen from '../screens/map/MapScreen';
import { colors, spacing, radius, typography, shadows } from '../theme';

const Tab = createBottomTabNavigator();

const TABS = {
  Home: { icon: 'home-outline', iconActive: 'home', label: 'HOME' },
  Activity: { icon: 'pulse-outline', iconActive: 'pulse', label: 'STATS' },
  Map: { icon: 'map-outline', iconActive: 'map', label: 'MAP' },
  Discover: { icon: 'search-outline', iconActive: 'search', label: 'DISCOVER' },
};

// VOLT BottomBar — 4 tabs + center REC (`1fr 1fr 96px 1fr 1fr`). Active tab
// gets a 24×2 lime bar at top. Center is the REC button — accent fill, mono
// UPPERCASE label, sharp 4px radius. Profile lives in the drawer.
function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { routes, index: activeIndex } = state;

  // Insert a pseudo-route for the REC button at index 2 (between Activity and Map).
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) + 8 }]}>
      <View style={styles.row}>
        {routes
          .slice(0, 2)
          .map((route, i) => renderTab(route, activeIndex === i, navigation, styles))}

        <TouchableOpacity
          style={styles.recBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ActivityPicker')}
          accessibilityRole="button"
          accessibilityLabel="Record activity"
        >
          <View style={styles.recDot} />
          <Text style={styles.recLabel}>REC</Text>
        </TouchableOpacity>

        {routes
          .slice(2)
          .map((route, i) => renderTab(route, activeIndex === i + 2, navigation, styles))}
      </View>
    </View>
  );
}

function renderTab(route, isFocused, navigation, styles) {
  const spec = TABS[route.name] || { icon: 'ellipse-outline', label: route.name.toUpperCase() };
  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  return (
    <TouchableOpacity
      key={route.key}
      style={styles.tab}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isFocused ? <View style={styles.activeBar} /> : null}
      <Ionicons
        name={isFocused ? spec.iconActive : spec.icon}
        size={20}
        color={isFocused ? colors.accent : colors.textMute}
      />
      <Text style={[styles.tabLabel, { color: isFocused ? colors.accent : colors.textMute }]}>
        {spec.label}
      </Text>
    </TouchableOpacity>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeFeedScreen} />
      <Tab.Screen name="Activity" component={ActivityListScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: 'rgba(10,12,16,0.94)',
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
    paddingTop: 8,
    paddingHorizontal: spacing.base,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    position: 'relative',
  },
  activeBar: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    width: 24,
    height: 2,
    backgroundColor: colors.accent,
  },
  tabLabel: {
    ...typography.caps,
    fontSize: 9,
    letterSpacing: 1.4,
    marginTop: 4,
  },
  recBtn: {
    width: 96,
    height: 52,
    marginHorizontal: spacing.s,
    backgroundColor: colors.accent,
    borderRadius: radius.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0A0C10',
    marginRight: 8,
  },
  recLabel: {
    ...typography.caps,
    fontSize: 11,
    color: '#0A0C10',
    fontWeight: '700',
    letterSpacing: 2,
  },
});
