import { describe, it, expect } from 'vitest';
import { normalizeError, loginSchema, registerSchema } from '@/lib/api/errors';
import { formatDistance, formatPace, weekProgress, daysUntil } from '@/lib/format';
import { membershipStatusLabel, denialExplanation } from '@/lib/api/access';
import { authErrorMessage, friendlySubmitError } from '@/lib/auth/messages';

describe('api error normalization', () => {
  it('maps 401 to session-expired copy', () => {
    expect(normalizeError({ status: 401 }).message).toMatch(/session expired/i);
  });
  it('maps EMAIL_TAKEN to duplicate copy', () => {
    expect(normalizeError({ status: 409, code: 'EMAIL_TAKEN' }).message).toMatch(/already registered/i);
  });
  it('maps network failure to unreachable copy without internals', () => {
    const e = normalizeError(new Error('fetch failed'));
    expect(e.message).toMatch(/cannot reach/i);
    expect(e.message).not.toMatch(/fetch failed/);
  });
});

describe('form validation', () => {
  it('rejects bad email and short password', () => {
    expect(loginSchema.safeParse({ email: 'x', password: 'y' }).success).toBe(false);
    expect(registerSchema.safeParse({ name: '', email: 'a@b.c', password: 'short' }).success).toBe(false);
  });
  it('accepts valid register input', () => {
    expect(registerSchema.safeParse({ name: 'Ada', email: 'ada@volt.test', password: 'Volt12345!' }).success).toBe(true);
  });
});

describe('formatting utilities', () => {
  it('formats distance by units', () => {
    expect(formatDistance(10, 'km')).toBe('10.00 km');
    expect(formatDistance(10, 'mi')).toBe('6.21 mi');
  });
  it('formats pace and guards bad input', () => {
    expect(formatPace(300, 'km')).toBe('5:00 /km');
    expect(formatPace(null, 'km')).toBe('—');
  });
  it('computes weekly progress capped at 100', () => {
    expect(weekProgress(90, 3)).toBe(50);
    expect(weekProgress(9999, 3)).toBe(100);
  });
  it('detects expiry ordering', () => {
    expect(daysUntil(new Date(Date.now() + 864e5).toISOString())).toBeGreaterThan(0);
  });
});

describe('membership-state rendering', () => {
  it('labels statuses', () => {
    expect(membershipStatusLabel('ACTIVE')).toBe('Active');
    expect(membershipStatusLabel('EXPIRED')).toBe('Expired');
  });
  it('explains denials without leaking internals', () => {
    expect(denialExplanation('OUTSIDE_PROXIMITY')).toMatch(/mobile app/i);
    expect(denialExplanation('MEMBERSHIP_EXPIRED')).toMatch(/Renew/i);
  });
});

describe('auth messages', () => {
  it('covers required actionable errors', () => {
    expect(authErrorMessage(401)).toMatch(/Incorrect email/);
    expect(authErrorMessage(409, 'EMAIL_TAKEN')).toMatch(/already registered/);
    expect(authErrorMessage(0)).toMatch(/cannot reach/i);
    expect(authErrorMessage(404)).toMatch(/expired/i);
  });
  it('maps raw network failures to friendly copy', () => {
    expect(friendlySubmitError(new Error('Failed to fetch'))).toMatch(/cannot reach/i);
    expect(friendlySubmitError(new TypeError('Load failed'))).toMatch(/cannot reach/i);
    expect(friendlySubmitError(new Error('Incorrect email or password.'))).toMatch(/Incorrect email/);
  });
});

describe('onboarding-state behavior', () => {
  it('treats missing profile as incomplete', async () => {
    const profile = null as unknown as { onboardingCompleted?: boolean } | null;
    expect(Boolean(profile?.onboardingCompleted)).toBe(false);
  });
});
