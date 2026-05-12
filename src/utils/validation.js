// RFC 5322 simplified — good enough for client-side hinting.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  return EMAIL_RE.test(value.trim());
}

export function isValidPassword(value, { minLength = 8 } = {}) {
  return typeof value === 'string' && value.length >= minLength;
}
