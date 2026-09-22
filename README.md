# VOLT

> **Move with intent.**

A React Native + Expo fitness tracking app with a dark-first, performance-grade aesthetic. Log activities, see live stats and streaks, follow friends, message them, and discover spots and programs.

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

## Brand

- **Name:** VOLT
- **Tagline:** "Move with intent."
- **Default palette:** Voltage (electric lime on near-black). 4 palettes ship: Voltage, Magma, Subzero, Paper. See `src/theme/colors.js`.
- **Typography:** Space Grotesk (display / body) + JetBrains Mono (numbers, labels, deltas). System fallbacks until web fonts ship.
- **Radii:** never exceed 8px — sharp corners are the brand.

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
  components/       Reusable UI primitives (BrandStrip, Caps, Mono, etc.)
  data/             Mock seed data (replace with API client)
  i18n/             Centralized user-facing strings
  navigation/       Stack / Drawer / Tab definitions + linking
  screens/          Screen-level components
  services/         Network and device access (location, places, http)
  state/            React Context providers (auth, app data)
  theme/            Colors, spacing, typography, shadows + 4 palettes
```

## Backend (door access API)

`advent-fitness-api/` is a Fastify + TypeScript service owning auth, memberships,
door authorization, provider adapters (Mock, Kisi), webhooks, and audit events.
The mobile app never talks to locks directly. See `advent-fitness-api/README.md`.

Dev loop (two terminals):

```bash
npm start                                    # backend on :3000 (seed: member@volt.test / Volt12345!)
EXPO_PUBLIC_API_URL=http://<lan-ip>:3000 npm run start   # mobile, point at backend
```

## Deep linking

URL scheme: `volt://`. See `src/navigation/linking.js` for the route map. Examples:

- `volt://meetup/m1` opens MeetupDetail
- `volt://activity/route1` opens ActivitySummary

## Testing

Pure utility functions live under `src/services/` and are unit-tested in `src/services/__tests__`. Add tests for any new pure logic.

Coverage thresholds are enforced in `jest.config.js` (`npm run test:ci`).

## Persistence

`AppContext` hydrates from `AsyncStorage` (`@volt/v1/*`) on boot and persists
saved spots, submitted spots, recorded routes, meetups, feed extras, and settings.
Seeds in `src/data/` remain the fallback. Use `clearLocalData()` to reset.

## Telemetry

`src/services/telemetry.js` wires `logger.setReporter`. Set `EXPO_PUBLIC_SENTRY_DSN`
and install `@sentry/react-native` to forward production errors. `ErrorBoundary`
already logs via `logger.error`.

## Release

`eas.json` ships dev/preview/production profiles. Fill `app.json -> extra.eas.projectId`
and `updates.url` with your EAS project values, then `eas build` / `eas submit`.

## Backend proxy for Places

`fetchNearbyPOIs` tries `GET {EXPO_PUBLIC_API_URL}/places/nearby` first so the
Google key stays server-side. Direct Google fallback remains for dev only.
