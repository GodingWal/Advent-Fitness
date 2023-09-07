import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DrawerMenu from './src/navigation/DrawerMenu'; // Import your custom drawer component
import HomeScreen from './src/screens/HomeScreen'; // Import your actual screen components
import ActivityScreen from './src/screens/ActivityScreen';
import DiscoverScreen from './src/screens/DiscoverScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator drawerContent={(props) => <DrawerMenu {...props} />}>
        <Drawer.Screen name="Advent Fitness" component={TabNavigator} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default App;
