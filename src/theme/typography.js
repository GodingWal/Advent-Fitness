import { Platform } from 'react-native';

// VOLT uses Space Grotesk (sans) + JetBrains Mono (mono). Until web fonts are
// loaded natively, fall back to platform system + monospace; the type scale,
// weights, and tracking still carry the brand feel.
const sans = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });
const sansMedium = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'System',
});
const mono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

export const fonts = { sans, sansMedium, mono };

export const typography = {
  // Display — splash hero
  display: { fontFamily: sans, fontSize: 60, fontWeight: '700', lineHeight: 60, letterSpacing: -3 },
  // h1 — onboarding section titles
  h1: { fontFamily: sans, fontSize: 38, fontWeight: '700', lineHeight: 40, letterSpacing: -1.5 },
  // h2 — screen headlines ("Hey, Cody.", "Output.")
  h2: { fontFamily: sans, fontSize: 30, fontWeight: '700', lineHeight: 32, letterSpacing: -1.2 },
  // h3 — hero card titles
  h3: { fontFamily: sans, fontSize: 28, fontWeight: '700', lineHeight: 32, letterSpacing: -0.8 },
  // h4 — section card titles, modals
  h4: { fontFamily: sans, fontSize: 26, fontWeight: '700', lineHeight: 30, letterSpacing: -0.8 },
  // title — profile name, secondary headers
  title: {
    fontFamily: sansMedium,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  // body — list items, card body
  body: { fontFamily: sans, fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodySmall: { fontFamily: sans, fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption: { fontFamily: sans, fontSize: 12, fontWeight: '400', lineHeight: 16 },

  // JetBrains Mono — numbers, stats, durations, deltas
  mono: { fontFamily: mono, fontSize: 12, fontWeight: '400', letterSpacing: 0.7 },
  monoSmall: { fontFamily: mono, fontSize: 10, fontWeight: '500', letterSpacing: 0.6 },
  monoMd: { fontFamily: mono, fontSize: 14, fontWeight: '500', letterSpacing: 0.7 },
  monoLg: { fontFamily: mono, fontSize: 18, fontWeight: '500', letterSpacing: 0.6 },
  monoXL: { fontFamily: mono, fontSize: 28, fontWeight: '500', letterSpacing: -0.4 },
  monoDisplay: { fontFamily: mono, fontSize: 76, fontWeight: '500', letterSpacing: -3 },

  // Caps — kickers, labels, tab labels (UPPERCASE)
  caps: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  capsSm: {
    fontFamily: mono,
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  capsLg: {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },

  // Legacy aliases — kept stable for existing screens
  labelCaps: {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  labelCapsSmall: {
    fontFamily: mono,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
};
