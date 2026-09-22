import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { mockUser } from '../data/mockUser';
import { getJSON, setJSON, removeItem } from '../services/storage';
import { logger } from '../services/logger';

const AppContext = createContext(null);

export const APP_STORAGE_VERSION = 1;
export const APP_STORAGE_KEYS = {
  savedSpots: '@volt/v1/savedSpots',
  submittedSpots: '@volt/v1/submittedSpots',
  recordedRoutes: '@volt/v1/recordedRoutes',
  meetups: '@volt/v1/meetups',
  feedExtras: '@volt/v1/feedExtras',
  settings: '@volt/v1/settings',
};

export function sanitizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function sanitizeSettings(value, fallback) {
  if (!value || typeof value !== 'object') return fallback;
  return { ...fallback, ...value };
}

const SEED_RECORDED_ROUTES = [
  {
    id: 'route1',
    type: 'hiking',
    title: 'Torrey Pines Loop',
    distanceMi: 3.4,
    durationSec: 65 * 60,
    when: 'Yesterday',
    coordinates: [
      { latitude: 32.9213, longitude: -117.2546 },
      { latitude: 32.923, longitude: -117.252 },
      { latitude: 32.9255, longitude: -117.2502 },
      { latitude: 32.927, longitude: -117.252 },
      { latitude: 32.9252, longitude: -117.2548 },
      { latitude: 32.9213, longitude: -117.2546 },
    ],
  },
  {
    id: 'route2',
    type: 'cycling',
    title: 'Coronado Loop',
    distanceMi: 8.2,
    durationSec: 32 * 60,
    when: '2 days ago',
    coordinates: [
      { latitude: 32.6859, longitude: -117.1831 },
      { latitude: 32.689, longitude: -117.175 },
      { latitude: 32.691, longitude: -117.17 },
      { latitude: 32.694, longitude: -117.166 },
    ],
  },
];

const SEED_ACHIEVEMENTS = [
  {
    id: 'ach1',
    title: 'First Activity',
    description: 'Logged your first activity.',
    icon: 'trophy',
    earned: true,
    earnedDate: '2 weeks ago',
  },
  {
    id: 'ach2',
    title: '5 Surf Sessions',
    description: 'Completed 5 surf sessions.',
    icon: 'water',
    earned: true,
    earnedDate: '1 week ago',
  },
  {
    id: 'ach3',
    title: 'Trailblazer',
    description: 'Hiked 25 miles total.',
    icon: 'trail-sign',
    earned: true,
    earnedDate: '3 days ago',
  },
  {
    id: 'ach4',
    title: '7-Day Streak',
    description: 'Stay active 7 days in a row.',
    icon: 'flame',
    earned: true,
    earnedDate: 'Today',
  },
  {
    id: 'ach5',
    title: '30-Day Streak',
    description: 'Stay active 30 days in a row.',
    icon: 'flame',
    earned: false,
  },
  {
    id: 'ach6',
    title: 'Mountain Climber',
    description: 'Gain 10,000 ft of elevation.',
    icon: 'triangle',
    earned: false,
    progress: 0.62,
  },
  {
    id: 'ach7',
    title: 'Century Ride',
    description: 'Cycle 100 miles in one ride.',
    icon: 'bicycle',
    earned: false,
    progress: 0.08,
  },
];

const SEED_MEETUPS = [
  {
    id: 'm1',
    title: 'Sunrise Hike at Torrey Pines',
    type: 'hiking',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1000&q=80',
    location: 'Torrey Pines State Reserve',
    when: 'Sat, May 10 · 6:30 AM',
    host: 'Kate Austen',
    coordinate: { latitude: 32.9213, longitude: -117.2546 },
    attendees: 8,
    rsvped: false,
    description: 'Easy 3-mile loop with ocean views. All levels welcome.',
  },
  {
    id: 'm2',
    title: 'Pickup Basketball at Balboa Park',
    type: 'basketball',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1000&q=80',
    location: 'Balboa Park Courts',
    when: 'Sun, May 11 · 10:00 AM',
    host: 'Angel Hernandez',
    coordinate: { latitude: 32.7341, longitude: -117.1442 },
    attendees: 6,
    rsvped: true,
    description: 'Casual 4-on-4 games. Bring water.',
  },
  {
    id: 'm3',
    title: 'Sunset Surf Session',
    type: 'surfing',
    image: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=1000&q=80',
    location: 'Sunset Cliffs',
    when: 'Wed, May 14 · 7:00 PM',
    host: 'Thomas Hidalgo',
    coordinate: { latitude: 32.7252, longitude: -117.2548 },
    attendees: 4,
    rsvped: false,
    description: 'Intermediate to advanced. Check the swell forecast.',
  },
];

const SEED_PRIVACY_ZONE = {
  enabled: true,
  center: { latitude: 32.748, longitude: -117.1492 },
  radiusMi: 0.15,
};

export function AppProvider({ children }) {
  const [savedSpots, setSavedSpots] = useState([]);
  const [submittedSpots, setSubmittedSpots] = useState([]);
  const [recordedRoutes, setRecordedRoutes] = useState(SEED_RECORDED_ROUTES);
  const [achievements] = useState(SEED_ACHIEVEMENTS);
  const [meetups, setMeetups] = useState(SEED_MEETUPS);
  const [feedExtras, setFeedExtras] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettings] = useState({
    pushEnabled: true,
    healthSyncEnabled: false,
    liveShareEnabled: false,
    privacyZone: SEED_PRIVACY_ZONE,
    heatmapEnabled: false,
  });

  // Hydrate persisted slices once. Seeds above remain the fallback.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sSpots, subSpots, routes, meets, feed, persistedSettings] = await Promise.all([
          getJSON(APP_STORAGE_KEYS.savedSpots),
          getJSON(APP_STORAGE_KEYS.submittedSpots),
          getJSON(APP_STORAGE_KEYS.recordedRoutes),
          getJSON(APP_STORAGE_KEYS.meetups),
          getJSON(APP_STORAGE_KEYS.feedExtras),
          getJSON(APP_STORAGE_KEYS.settings),
        ]);
        if (cancelled) return;
        if (Array.isArray(sSpots)) setSavedSpots(sSpots);
        if (Array.isArray(subSpots)) setSubmittedSpots(subSpots);
        if (Array.isArray(routes) && routes.length) setRecordedRoutes(routes);
        if (Array.isArray(meets) && meets.length) setMeetups(meets);
        if (Array.isArray(feed)) setFeedExtras(feed);
        setSettings((cur) => sanitizeSettings(persistedSettings, cur));
      } catch (e) {
        logger.warn('AppContext hydrate failed', { message: e?.message });
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist after hydration. Individual effects avoid clobbering on first mount.
  useEffect(() => {
    if (hydrated) setJSON(APP_STORAGE_KEYS.savedSpots, savedSpots);
  }, [hydrated, savedSpots]);
  useEffect(() => {
    if (hydrated) setJSON(APP_STORAGE_KEYS.submittedSpots, submittedSpots);
  }, [hydrated, submittedSpots]);
  useEffect(() => {
    if (hydrated) setJSON(APP_STORAGE_KEYS.recordedRoutes, recordedRoutes);
  }, [hydrated, recordedRoutes]);
  useEffect(() => {
    if (hydrated) setJSON(APP_STORAGE_KEYS.meetups, meetups);
  }, [hydrated, meetups]);
  useEffect(() => {
    if (hydrated) setJSON(APP_STORAGE_KEYS.feedExtras, feedExtras);
  }, [hydrated, feedExtras]);
  useEffect(() => {
    if (hydrated) setJSON(APP_STORAGE_KEYS.settings, settings);
  }, [hydrated, settings]);

  // Stable callbacks — empty dep arrays because they only use setState updaters.
  const toggleSpot = useCallback((spot) => {
    setSavedSpots((cur) => {
      const exists = cur.find((s) => s.id === spot.id);
      return exists ? cur.filter((s) => s.id !== spot.id) : [...cur, spot];
    });
  }, []);

  const submitSpot = useCallback((spot) => {
    setSubmittedSpots((cur) => [...cur, spot]);
  }, []);

  const addRecordedRoute = useCallback((route) => {
    setRecordedRoutes((cur) => [route, ...cur]);
  }, []);

  const toggleRsvp = useCallback((id) => {
    setMeetups((cur) =>
      cur.map((m) =>
        m.id === id ? { ...m, rsvped: !m.rsvped, attendees: m.attendees + (m.rsvped ? -1 : 1) } : m
      )
    );
  }, []);

  const addFeedPost = useCallback((post) => {
    setFeedExtras((cur) => [post, ...cur]);
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings((cur) => ({ ...cur, [key]: value }));
  }, []);

  const updatePrivacyZone = useCallback((next) => {
    setSettings((cur) => ({ ...cur, privacyZone: { ...cur.privacyZone, ...next } }));
  }, []);

  const clearLocalData = useCallback(async () => {
    setSavedSpots([]);
    setSubmittedSpots([]);
    setRecordedRoutes(SEED_RECORDED_ROUTES);
    setMeetups(SEED_MEETUPS);
    setFeedExtras([]);
    setSettings({
      pushEnabled: true,
      healthSyncEnabled: false,
      liveShareEnabled: false,
      privacyZone: SEED_PRIVACY_ZONE,
      heatmapEnabled: false,
    });
    await Promise.all(Object.values(APP_STORAGE_KEYS).map((k) => removeItem(k)));
  }, []);

  // isSpotSaved depends on savedSpots — keep memoized but only on that.
  const isSpotSaved = useCallback((id) => savedSpots.some((s) => s.id === id), [savedSpots]);

  const value = useMemo(
    () => ({
      user: mockUser,
      savedSpots,
      submittedSpots,
      recordedRoutes,
      achievements,
      meetups,
      feedExtras,
      settings,
      hydrated,
      toggleSpot,
      isSpotSaved,
      submitSpot,
      addRecordedRoute,
      toggleRsvp,
      addFeedPost,
      updateSetting,
      updatePrivacyZone,
      clearLocalData,
    }),
    [
      savedSpots,
      submittedSpots,
      recordedRoutes,
      achievements,
      meetups,
      feedExtras,
      settings,
      hydrated,
      isSpotSaved,
      toggleSpot,
      submitSpot,
      addRecordedRoute,
      toggleRsvp,
      addFeedPost,
      updateSetting,
      updatePrivacyZone,
      clearLocalData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

// Selector-style hooks let consumers subscribe to the slice they care about.
// They still re-render on any context change today (React context limitation),
// but reading through these hooks documents the intended dependency surface.
export function useSavedSpots() {
  return useApp().savedSpots;
}

export function useRecordedRoutes() {
  return useApp().recordedRoutes;
}

export function useMeetups() {
  return useApp().meetups;
}

export function useSettings() {
  return useApp().settings;
}
