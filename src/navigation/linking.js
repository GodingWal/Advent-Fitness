import * as Linking from 'expo-linking';

export const linking = {
  prefixes: [Linking.createURL('/'), 'adventfitness://', 'https://adventfitness.app'],
  config: {
    screens: {
      Splash: 'welcome',
      Auth: 'signup',
      Login: 'login',
      OnboardingTrack: 'onboarding/track',
      OnboardingFavorites: 'onboarding/favorites',
      Main: {
        path: 'app',
        screens: {
          // Drawer / tab routes are nested; expose top-level shortcuts below.
        },
      },
      ActivityPicker: 'activity/new',
      ActivityTracking: 'activity/track',
      ActivitySummary: 'activity/:id',
      IndoorWorkout: 'activity/indoor',
      Recommended: 'discover',
      EditProfile: 'profile/edit',
      Achievements: 'profile/achievements',
      Inbox: 'inbox',
      Chat: 'chat/:threadId',
      FitnessCenterPass: 'pass',
      TrailDetail: 'trail/:id',
      Meetups: 'meetups',
      MeetupDetail: 'meetup/:id',
      Settings: 'settings',
    },
  },
};
