import * as Linking from 'expo-linking';

export const linking = {
  prefixes: [Linking.createURL('/'), 'volt://', 'https://volt.app'],
  config: {
    screens: {
      Splash: 'welcome',
      Auth: 'signup',
      SignUpEmail: 'signup/email',
      SignUpPhone: 'signup/phone',
      Login: 'login',
      ForgotPassword: 'forgot-password',
      ResetPassword: 'reset-password/:token?',
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
      Trainers: 'trainers',
      Profile: 'me',
      Settings: 'settings',
    },
  },
};
