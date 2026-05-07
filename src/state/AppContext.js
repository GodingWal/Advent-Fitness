import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { mockUser } from '../data/mockUser';

const AppContext = createContext(null);

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
      { latitude: 32.9230, longitude: -117.2520 },
      { latitude: 32.9255, longitude: -117.2502 },
      { latitude: 32.9270, longitude: -117.2520 },
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
      { latitude: 32.6890, longitude: -117.1750 },
      { latitude: 32.6910, longitude: -117.1700 },
      { latitude: 32.6940, longitude: -117.1660 },
    ],
  },
];

const SEED_ACHIEVEMENTS = [
  { id: 'ach1', title: 'First Activity', description: 'Logged your first activity.', icon: 'trophy', earned: true, earnedDate: '2 weeks ago' },
  { id: 'ach2', title: '5 Surf Sessions', description: 'Completed 5 surf sessions.', icon: 'water', earned: true, earnedDate: '1 week ago' },
  { id: 'ach3', title: 'Trailblazer', description: 'Hiked 25 miles total.', icon: 'trail-sign', earned: true, earnedDate: '3 days ago' },
  { id: 'ach4', title: '7-Day Streak', description: 'Stay active 7 days in a row.', icon: 'flame', earned: true, earnedDate: 'Today' },
  { id: 'ach5', title: '30-Day Streak', description: 'Stay active 30 days in a row.', icon: 'flame', earned: false },
  { id: 'ach6', title: 'Mountain Climber', description: 'Gain 10,000 ft of elevation.', icon: 'triangle', earned: false, progress: 0.62 },
  { id: 'ach7', title: 'Century Ride', description: 'Cycle 100 miles in one ride.', icon: 'bicycle', earned: false, progress: 0.08 },
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
  center: { latitude: 32.7480, longitude: -117.1492 },
  radiusMi: 0.15,
};

export function AppProvider({ children }) {
  const [savedSpots, setSavedSpots] = useState([]);
  const [submittedSpots, setSubmittedSpots] = useState([]);
  const [recordedRoutes, setRecordedRoutes] = useState(SEED_RECORDED_ROUTES);
  const [achievements] = useState(SEED_ACHIEVEMENTS);
  const [meetups, setMeetups] = useState(SEED_MEETUPS);
  const [feedExtras, setFeedExtras] = useState([]);
  const [settings, setSettings] = useState({
    pushEnabled: true,
    healthSyncEnabled: false,
    liveShareEnabled: false,
    privacyZone: SEED_PRIVACY_ZONE,
    heatmapEnabled: false,
  });

  const toggleSpot = useCallback((spot) => {
    setSavedSpots((cur) => {
      const exists = cur.find((s) => s.id === spot.id);
      return exists ? cur.filter((s) => s.id !== spot.id) : [...cur, spot];
    });
  }, []);

  const isSpotSaved = useCallback(
    (id) => savedSpots.some((s) => s.id === id),
    [savedSpots]
  );

  const submitSpot = useCallback((spot) => {
    setSubmittedSpots((cur) => [...cur, spot]);
  }, []);

  const addRecordedRoute = useCallback((route) => {
    setRecordedRoutes((cur) => [route, ...cur]);
  }, []);

  const toggleRsvp = useCallback((id) => {
    setMeetups((cur) =>
      cur.map((m) =>
        m.id === id
          ? { ...m, rsvped: !m.rsvped, attendees: m.attendees + (m.rsvped ? -1 : 1) }
          : m
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
      toggleSpot,
      isSpotSaved,
      submitSpot,
      addRecordedRoute,
      toggleRsvp,
      addFeedPost,
      updateSetting,
      updatePrivacyZone,
    }),
    [
      savedSpots,
      submittedSpots,
      recordedRoutes,
      achievements,
      meetups,
      feedExtras,
      settings,
      toggleSpot,
      isSpotSaved,
      submitSpot,
      addRecordedRoute,
      toggleRsvp,
      addFeedPost,
      updateSetting,
      updatePrivacyZone,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
