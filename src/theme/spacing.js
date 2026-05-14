// VOLT: padding lives at 16–22px for cards & screen edges. Section headers use
// 22px horizontal padding. Sharp corners are the brand — radius never exceeds 8.

export const spacing = {
  xxs: 2,
  xs: 4,
  s: 8,
  m: 12,
  base: 16,
  l: 20,
  edge: 22, // screen edge / section header horizontal padding
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  none: 0,
  // chips, badges, tags (VOLT: "Surf" tag, "LIVE" pill)
  xs: 2,
  s: 2,
  // small UI accents
  sm: 3,
  // buttons, inputs, list items, primary CTA, REC button
  m: 4,
  md: 4,
  lg: 4,
  // cards, hero card, floating sheets
  l: 6,
  xl: 6,
  // back-compat for legacy `radius.pill` callers — VOLT has no pills, use 4
  pill: 4,
};
