import {
  completeOnboarding,
  getProfile,
  needsOnboarding,
  normalizeProfile,
  updateProfile,
} from '../profile';
import { http } from '../http';

jest.mock('../http', () => ({
  http: { get: jest.fn(), put: jest.fn() },
}));

beforeEach(() => {
  http.get.mockReset();
  http.put.mockReset();
});

describe('profile service', () => {
  it('getProfile unwraps { profile } and returns it', async () => {
    http.get.mockResolvedValue({ data: { profile: { onboardingCompleted: false } } });
    await expect(getProfile()).resolves.toEqual({ onboardingCompleted: false });
    expect(http.get).toHaveBeenCalledWith('/v1/profile');
  });

  it('updateProfile PUTs the patch and returns the profile', async () => {
    http.put.mockResolvedValue({ data: { profile: { weeklyTargetH: 8 } } });
    await expect(updateProfile({ weeklyTargetH: 8 })).resolves.toEqual({ weeklyTargetH: 8 });
    expect(http.put).toHaveBeenCalledWith('/v1/profile', { weeklyTargetH: 8 });
  });

  it('completeOnboarding sets onboardingCompleted:true', async () => {
    http.put.mockResolvedValue({ data: { profile: { onboardingCompleted: true } } });
    await expect(completeOnboarding()).resolves.toEqual({ onboardingCompleted: true });
    expect(http.put).toHaveBeenCalledWith('/v1/profile', { onboardingCompleted: true });
  });
});

describe('profile-driven onboarding resume', () => {
  it('resumes when onboardingCompleted is not true', () => {
    expect(needsOnboarding({ onboardingCompleted: false })).toBe(true);
    expect(needsOnboarding({})).toBe(true);
    expect(needsOnboarding({ goal: 'build', weeklyTargetH: 8 })).toBe(true);
  });

  it('does not resume once onboarding is complete', () => {
    expect(needsOnboarding({ onboardingCompleted: true })).toBe(false);
  });

  it('unwraps { profile } envelopes and treats missing profiles as complete-safe', () => {
    expect(needsOnboarding({ profile: { onboardingCompleted: false } })).toBe(true);
    expect(needsOnboarding({ profile: { onboardingCompleted: true } })).toBe(false);
    expect(needsOnboarding(null)).toBe(false);
    expect(needsOnboarding(undefined)).toBe(false);
  });

  it('normalizeProfile returns null for non-objects', () => {
    expect(normalizeProfile(null)).toBeNull();
    expect(normalizeProfile('nope')).toBeNull();
  });
});
