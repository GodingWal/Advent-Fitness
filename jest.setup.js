jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3, High: 4 },
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  expoConfig: { extra: {} },
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockIcon = ({ name, testID }) =>
    React.createElement(Text, { testID }, name ? String(name) : '');
  return {
    __esModule: true,
    default: MockIcon,
    Ionicons: MockIcon,
    MaterialIcons: MockIcon,
    FontAwesome: MockIcon,
  };
});

jest.mock('@expo/vector-icons/Ionicons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ name, testID }) => React.createElement(Text, { testID }, name ? String(name) : ''),
  };
});

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockMapView = ({ children, testID }) => React.createElement(View, { testID }, children);
  const MockOverlay = () => null;
  return {
    __esModule: true,
    default: MockMapView,
    MapView: MockMapView,
    Marker: MockOverlay,
    Polyline: MockOverlay,
    Polygon: MockOverlay,
    Circle: MockOverlay,
    PROVIDER_GOOGLE: 'google',
    PROVIDER_DEFAULT: null,
  };
});

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((k) => Promise.resolve(store.has(k) ? store.get(k) : null)),
      setItem: jest.fn((k, v) => {
        store.set(k, v);
        return Promise.resolve();
      }),
      removeItem: jest.fn((k) => {
        store.delete(k);
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store.clear();
        return Promise.resolve();
      }),
    },
  };
});

jest.mock('expo-secure-store', () => {
  const store = new Map();
  return {
    getItemAsync: jest.fn((k) => Promise.resolve(store.has(k) ? store.get(k) : null)),
    setItemAsync: jest.fn((k, v) => {
      store.set(k, v);
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((k) => {
      store.delete(k);
      return Promise.resolve();
    }),
    __store: store,
  };
});

jest.mock('react-native-qrcode-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  function MockQRCode() {
    return React.createElement(View, { testID: 'qr-code-mock' });
  }
  return { __esModule: true, default: MockQRCode };
});
