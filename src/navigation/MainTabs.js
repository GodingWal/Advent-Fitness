import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeFeedScreen from '../screens/home/HomeFeedScreen';
import ActivityListScreen from '../screens/activity/ActivityListScreen';
import DiscoverScreen from '../screens/discover/DiscoverScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MapScreen from '../screens/map/MapScreen';
import IconBadge from '../components/IconBadge';
import { colors, spacing, typography, shadows } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: 'home',
  Activity: 'pulse',
  Map: 'map',
  Discover: 'search',
  Profile: 'person',
};

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { routes, index: activeIndex } = state;

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 6 }]}>
      <View style={styles.row}>
        {routes.map((route, i) => {
          const isFocused = activeIndex === i;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              accessibilityRole="button"
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFocused ? ICONS[route.name] : `${ICONS[route.name]}-outline`}
                size={24}
                color={isFocused ? colors.accent : colors.textMuted}
              />
              {isFocused ? (
                <Text style={[styles.tabLabel, { color: colors.accent }]}>
                  {route.name.toUpperCase()}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ActivityPicker')}
      >
        <IconBadge icon="diamondPlus" size={64} bg={colors.accent} color={colors.white} />
      </TouchableOpacity>
    </View>
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
      <Tab.Screen name="Map" component={MapScreen} options={{ tabBarLabel: 'Map' }} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 6,
    ...shadows.cardLight,
  },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.s,
    paddingBottom: spacing.s,
    minHeight: 56,
  },
  tabLabel: { ...typography.labelCapsSmall, marginTop: 2 },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 32,
  },
});
