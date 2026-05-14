// VOLT uses shadows sparingly. Regular cards rely on 1px borders for
// separation; only the hero CTA, REC button, and selected tiles glow.

export const shadows = {
  // Regular cards: no shadow — VOLT separates with `1px solid lineSoft`
  card: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  cardLight: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Hero accent glow — `0 20px 40px rgba(accent, 0.18)`
  hero: {
    shadowColor: '#D4FF3D',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 8,
  },
  // REC button — `0 8px 22px rgba(accent, 0.30)`
  fab: {
    shadowColor: '#D4FF3D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 10,
  },
  // Selected arena tile during onboarding
  selected: {
    shadowColor: '#D4FF3D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6,
  },
};
