# AdventFitness

A React Native + Expo fitness app for discovering trails, gyms, courts, and meetups, and tracking outdoor activities.

## Stack

- Expo SDK 49 / React Native 0.72
- React Navigation 6 (native-stack, drawer, bottom-tabs, material-top-tabs)
- `react-native-maps` (Google Maps provider)
- `expo-location` for live tracking
- Mock data backed by an `AppContext` provider

## Quick start

```bash
npm install
npm run start          # Expo dev server
npm run ios            # iOS simulator
npm run android        # Android emulator
npm run web            # Web preview
```

## Environment

Configure secrets via env vars (preferred) or `app.json -> expo.extra`. **Never commit real keys.**

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Places API for live POI search |
| `EXPO_PUBLIC_API_URL` | Backend API base URL (must be `https://` outside dev) |
| `EXPO_PUBLIC_IOS_GOOGLE_MAPS_KEY` | Native iOS Google Maps key |
| `EXPO_PUBLIC_ANDROID_GOOGLE_MAPS_KEY` | Native Android Google Maps key |

For native map keys, set them in `app.json` (`ios.config.googleMapsApiKey`, `android.config.googleMaps.apiKey`) at build time via EAS secrets.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run lint` | Run ESLint over `src/` and `App.js` |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Verify formatting in CI |
| `npm test` | Run Jest unit tests |
| `npm run test:ci` | Jest with coverage, no watch |

## Project structure

```
src/
  components/       Reusable UI primitives
  data/             Mock seed data (replace with API client)
  i18n/             Centralized user-facing strings
  navigation/       Stack / Drawer / Tab definitions + linking
  screens/          Screen-level components
  services/         Network and device access (location, places, http)
  state/            React Context providers (auth, app data)
  theme/            Colors, spacing, typography, shadows
```

## Deep linking

URL scheme: `adventfitness://`. See `src/navigation/linking.js` for the route map. Examples:

- `adventfitness://meetup/m1` opens MeetupDetail
- `adventfitness://activity/route1` opens ActivitySummary

## Testing

Pure utility functions live under `src/services/` and are unit-tested in `src/services/__tests__`. Add tests for any new pure logic.
