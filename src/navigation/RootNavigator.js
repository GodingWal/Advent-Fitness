import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/splash/SplashScreen';
import CreateAccountScreen from '../screens/auth/CreateAccountScreen';
import SignUpEmailScreen from '../screens/auth/SignUpEmailScreen';
import SignUpPhoneScreen from '../screens/auth/SignUpPhoneScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OnboardingTrackScreen from '../screens/onboarding/OnboardingTrackScreen';
import OnboardingFavoritesScreen from '../screens/onboarding/OnboardingFavoritesScreen';
import ActivityPickerScreen from '../screens/activity/ActivityPickerScreen';
import ActivityTrackingScreen from '../screens/activity/ActivityTrackingScreen';
import ActivitySummaryScreen from '../screens/activity/ActivitySummaryScreen';
import IndoorWorkoutScreen from '../screens/activity/IndoorWorkoutScreen';
import RecommendedScreen from '../screens/discover/RecommendedScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import AchievementsScreen from '../screens/profile/AchievementsScreen';
import InboxScreen from '../screens/messages/InboxScreen';
import ChatScreen from '../screens/messages/ChatScreen';
import FitnessCenterPassScreen from '../screens/gym/FitnessCenterPassScreen';
import TrailDetailScreen from '../screens/map/TrailDetailScreen';
import MeetupsScreen from '../screens/meetups/MeetupsScreen';
import MeetupDetailScreen from '../screens/meetups/MeetupDetailScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import MainDrawer from './MainDrawer';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={CreateAccountScreen} />
      <Stack.Screen name="SignUpEmail" component={SignUpEmailScreen} />
      <Stack.Screen name="SignUpPhone" component={SignUpPhoneScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OnboardingTrack" component={OnboardingTrackScreen} />
      <Stack.Screen name="OnboardingFavorites" component={OnboardingFavoritesScreen} />
      <Stack.Screen name="Main" component={MainDrawer} />

      <Stack.Screen
        name="ActivityPicker"
        component={ActivityPickerScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="ActivityTracking"
        component={ActivityTrackingScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="ActivitySummary" component={ActivitySummaryScreen} />
      <Stack.Screen name="IndoorWorkout" component={IndoorWorkoutScreen} />

      <Stack.Screen name="Recommended" component={RecommendedScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="Inbox" component={InboxScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="FitnessCenterPass" component={FitnessCenterPassScreen} />
      <Stack.Screen name="TrailDetail" component={TrailDetailScreen} />
      <Stack.Screen name="Meetups" component={MeetupsScreen} />
      <Stack.Screen name="MeetupDetail" component={MeetupDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
