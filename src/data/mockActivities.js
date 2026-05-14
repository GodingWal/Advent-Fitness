export const ACTIVITY_TYPES = {
  surfing: { id: 'surfing', label: 'Surfing', icon: 'wave', color: '#4A7BB7' },
  hiking: { id: 'hiking', label: 'Hiking', icon: 'mountain', color: '#4A7BB7' },
  yoga: { id: 'yoga', label: 'Yoga', icon: 'lotus', color: '#4A7BB7' },
  meditation: { id: 'meditation', label: 'Meditation', icon: 'heart', color: '#4A7BB7' },
  weightLifting: {
    id: 'weightLifting',
    label: 'Weight Lifting',
    icon: 'dumbbell',
    color: '#4A7BB7',
  },
  running: { id: 'running', label: 'Running', icon: 'running', color: '#4A7BB7' },
  cycling: { id: 'cycling', label: 'Cycling', icon: 'bike', color: '#4A7BB7' },
  basketball: { id: 'basketball', label: 'Basketball', icon: 'basketball', color: '#4A7BB7' },
  tennis: { id: 'tennis', label: 'Tennis', icon: 'tennis', color: '#4A7BB7' },
};

export const popularActivities = [
  {
    id: 'a1',
    type: 'surfing',
    title: 'Surfing',
    sublabel: 'Ocean Beach',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80',
  },
  {
    id: 'a2',
    type: 'hiking',
    title: 'Hiking',
    sublabel: 'Torrey Pines',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  },
  {
    id: 'a3',
    type: 'cycling',
    title: 'Cycling',
    sublabel: 'Coronado Loop',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
  },
];

export const recommendedActivities = [
  {
    id: 'r1',
    type: 'yoga',
    title: 'Yoga',
    sublabel: 'Moderate Intensity',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&q=80',
  },
  {
    id: 'r2',
    type: 'meditation',
    title: 'Meditation',
    sublabel: 'Low Intensity',
    image: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=1000&q=80',
  },
  {
    id: 'r3',
    type: 'weightLifting',
    title: 'Weight Lifting',
    sublabel: 'High Intensity',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1000&q=80',
  },
];

export const activityHistory = [
  {
    id: 'h1',
    type: 'surfing',
    label: 'Surfing',
    location: 'Sunset Cliffs',
    durationMin: 90,
    when: 'Today, 5:37 PM',
  },
  {
    id: 'h2',
    type: 'hiking',
    label: 'Hiking',
    location: 'Yosemite Ntl. Park',
    durationMin: 195,
    when: 'Yesterday, 10:34 AM',
  },
  {
    id: 'h3',
    type: 'cycling',
    label: 'Cycling',
    location: 'Little Italy',
    durationMin: 35,
    when: 'Yesterday, 10:47 AM',
  },
];
