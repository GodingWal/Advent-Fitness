import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/splash/SplashScreen';
import CreateAccountScreen from '../screens/auth/CreateAccountScreen';
import SignUpEmailScreen from '../screens/auth/SignUpEmailScreen';
import SignUpPhoneScreen from '../screens/auth/SignUpPhoneScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OnboardingTrackScreen from '../screens/onboarding/OnboardingTrackScreen';
import OnboardingFavoritesScreen from '../screens/onboarding/OnboardingFavoritesScreen';
import ActivityTrackingScreen from '../screens/activity/ActivityTrackingScreen';
import RecommendedScreen from '../screens/discover/RecommendedScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import InboxScreen from '../screens/messages/InboxScreen';
import ChatScreen from '../screens/messages/ChatScreen';
import FitnessCenterPassScreen from '../screens/gym/FitnessCenterPassScreen';
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
        name="ActivityTracking"
        component={ActivityTrackingScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="Recommended" component={RecommendedScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Inbox" component={InboxScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="FitnessCenterPass" component={FitnessCenterPassScreen} />
    </Stack.Navigator>
  );
}
