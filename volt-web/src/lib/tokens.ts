// VOLT web design tokens — copied from src/theme/* (React Native) so both
// interfaces stay visually consistent. Single source of truth for volt-web.
export const colors = {
  bg: '#0A0C10',
  bgAlt: '#11141A',
  surface: '#161A21',
  surface2: '#1C212B',
  line: '#262C37',
  lineSoft: '#1E232C',
  text: '#F5F7FA',
  textMute: '#8E96A4',
  textDim: '#5A6271',
  accent: '#D4FF3D',
  accentDark: '#B8E034',
  accent2: '#FF5C3A',
  accent3: '#5BE0FF',
  error: '#FF5C3A',
  overlay: 'rgba(0,0,0,0.65)',
} as const;

export const fonts = {
  sans: "'Space Grotesk', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', Menlo, monospace",
} as const;

export const spacing = {
  xxs: 2, xs: 4, s: 8, m: 12, base: 16, l: 20, edge: 22, xl: 24, xxl: 32, xxxl: 48,
} as const;

export const radius = { none: 0, xs: 2, s: 2, sm: 3, m: 4, md: 4, lg: 4, l: 6, xl: 6 } as const;
export const MAX_RADIUS = 8;

export const shadows = {
  card: 'none',
  hero: '0 20px 40px rgba(212,255,61,0.18)',
  fab: '0 8px 22px rgba(212,255,61,0.30)',
  selected: '0 8px 24px rgba(212,255,61,0.25)',
} as const;

export const breakpoints = { mobileMax: 767, tabletMax: 1199, desktopMin: 1200 } as const;

export const motion = { fast: 120, base: 200, slow: 320 } as const;

export const zIndex = { base: 0, header: 10, sidebar: 20, modal: 50, toast: 60 } as const;

export const cssVars = `
  --volt-bg: ${colors.bg};
  --volt-bg-alt: ${colors.bgAlt};
  --volt-surface: ${colors.surface};
  --volt-surface-2: ${colors.surface2};
  --volt-line: ${colors.line};
  --volt-line-soft: ${colors.lineSoft};
  --volt-text: ${colors.text};
  --volt-text-mute: ${colors.textMute};
  --volt-text-dim: ${colors.textDim};
  --volt-accent: ${colors.accent};
  --volt-accent-dark: ${colors.accentDark};
  --volt-accent-2: ${colors.accent2};
  --volt-accent-3: ${colors.accent3};
  --volt-error: ${colors.error};
  --volt-font-sans: ${fonts.sans};
  --volt-font-mono: ${fonts.mono};
`;
