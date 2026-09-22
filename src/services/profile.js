import { http } from './http';

export function normalizeProfile(raw) {
  const profile = raw?.profile ?? raw ?? null;
  if (!profile || typeof profile !== 'object') return null;
  return profile;
}

export function needsOnboarding(profile) {
  const normalized = normalizeProfile(profile);
  if (!normalized) return false;
  return normalized.onboardingCompleted !== true;
}

export async function getProfile() {
  const res = await http.get('/v1/profile');
  return normalizeProfile(res.data);
}

export async function updateProfile(patch) {
  const res = await http.put('/v1/profile', patch);
  return normalizeProfile(res.data);
}

export async function completeOnboarding() {
  return updateProfile({ onboardingCompleted: true });
}
