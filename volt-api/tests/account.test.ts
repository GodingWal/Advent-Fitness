import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { seed } from '../src/db/seed';
import { newId, nowIso, users, usersByEmail } from '../src/db/memoryStore';
import type { User } from '../src/db/types';
import { resetTokens, verifyTokens } from '../src/auth/accountTokens';
import { sha256Hex, signAccessToken } from '../src/auth/tokens';
import { hashPassword } from '../src/auth/password';

let app: FastifyInstance;

function authHeaders(token: string): Record<string, string> {
  return { authorization: `Bearer ${token}` };
}

async function register(email: string, password = 'Password123!', name = 'Test User'): Promise<{
  status: number;
  body: Record<string, any>;
}> {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { email, password, name },
  });
  return { status: res.statusCode, body: res.json() as Record<string, any> };
}

async function login(email: string, password: string): Promise<{ status: number; body: Record<string, any> }> {
  const res = await app.inject({ method: 'POST', url: '/auth/login', payload: { email, password } });
  return { status: res.statusCode, body: res.json() as Record<string, any> };
}

/** Legacy-shaped user written straight to the maps (no profile, like pre-existing rows). */
async function makeLegacyUser(email: string): Promise<{ userId: string; token: string }> {
  const userId = newId('user');
  const passwordHash = await hashPassword('Password123!');
  users.set(userId, {
    id: userId,
    email,
    passwordHash,
    name: 'Legacy User',
    phone: null,
    status: 'ACTIVE',
    createdAt: nowIso(),
  } as User);
  usersByEmail.set(email.toLowerCase(), userId);
  return { userId, token: signAccessToken(userId) };
}

const DEFAULT_PROFILE = {
  weeklyTargetH: 3,
  goal: '',
  activities: [],
  homeGymId: null,
  privacy: {},
  units: 'mi',
  experience: 'beginner',
  notifications: {},
  onboardingCompleted: false,
};

beforeAll(async () => {
  app = await buildApp();
});

beforeEach(async () => {
  await seed();
  resetTokens.clear();
  verifyTokens.clear();
});

describe('profile', () => {
  it('register creates a default profile; GET returns defaults', async () => {
    const { status, body } = await register('prof1@volt.test');
    expect(status).toBe(201);
    const res = await app.inject({
      method: 'GET',
      url: '/v1/profile',
      headers: authHeaders(body.accessToken),
    });
    expect(res.statusCode).toBe(200);
    const profile = res.json().profile;
    expect(profile).toMatchObject({ ...DEFAULT_PROFILE, userId: body.user.id });
    expect(profile.id).toBeTruthy();
    expect(profile.updatedAt).toBeTruthy();
  });

  it('PUT round-trips and strips unknown fields', async () => {
    const { body } = await register('prof2@volt.test');
    const put = await app.inject({
      method: 'PUT',
      url: '/v1/profile',
      headers: authHeaders(body.accessToken),
      payload: {
        weeklyTargetH: 5,
        goal: 'Run a marathon',
        activities: ['running', 'yoga'],
        homeGymId: 'gym_123',
        privacy: { showStats: true },
        units: 'km',
        experience: 'advanced',
        notifications: { email: false },
        onboardingCompleted: true,
        hackerField: 'should-be-stripped',
        passwordHash: 'should-be-stripped',
      },
    });
    expect(put.statusCode).toBe(200);
    const updated = put.json().profile;
    expect(updated).toMatchObject({
      weeklyTargetH: 5,
      goal: 'Run a marathon',
      activities: ['running', 'yoga'],
      homeGymId: 'gym_123',
      privacy: { showStats: true },
      units: 'km',
      experience: 'advanced',
      notifications: { email: false },
      onboardingCompleted: true,
    });
    expect(updated).not.toHaveProperty('hackerField');
    expect(updated).not.toHaveProperty('passwordHash');

    const get = await app.inject({
      method: 'GET',
      url: '/v1/profile',
      headers: authHeaders(body.accessToken),
    });
    expect(get.json().profile).toEqual(updated);
  });

  it('PUT is partial: untouched fields keep their values', async () => {
    const { body } = await register('prof3@volt.test');
    await app.inject({
      method: 'PUT',
      url: '/v1/profile',
      headers: authHeaders(body.accessToken),
      payload: { goal: 'Just move' },
    });
    const get = await app.inject({
      method: 'GET',
      url: '/v1/profile',
      headers: authHeaders(body.accessToken),
    });
    expect(get.json().profile).toMatchObject({ ...DEFAULT_PROFILE, goal: 'Just move' });
  });

  it('GET auto-creates a default profile for legacy users', async () => {
    const { token } = await makeLegacyUser('legacy@volt.test');
    const res = await app.inject({ method: 'GET', url: '/v1/profile', headers: authHeaders(token) });
    expect(res.statusCode).toBe(200);
    expect(res.json().profile).toMatchObject(DEFAULT_PROFILE);
  });

  it('requires auth', async () => {
    expect((await app.inject({ method: 'GET', url: '/v1/profile' })).statusCode).toBe(401);
    expect(
      (await app.inject({ method: 'PUT', url: '/v1/profile', payload: { goal: 'x' } })).statusCode
    ).toBe(401);
    expect(
      (await app.inject({
        method: 'GET',
        url: '/v1/profile',
        headers: { authorization: 'Bearer garbage' },
      })).statusCode
    ).toBe(401);
  });

  it('PUT rejects invalid field types with 400', async () => {
    const { body } = await register('prof4@volt.test');
    const res = await app.inject({
      method: 'PUT',
      url: '/v1/profile',
      headers: authHeaders(body.accessToken),
      payload: { weeklyTargetH: 'lots' },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('email verification', () => {
  it('register returns a dev token; login works unverified; verify flips the flag', async () => {
    const { body } = await register('verify1@volt.test');
    expect(body.devVerificationToken).toMatch(/^[0-9a-f]{64}$/);

    // Verification is notice-only: login works before verifying.
    const preLogin = await login('verify1@volt.test', 'Password123!');
    expect(preLogin.status).toBe(200);
    expect(preLogin.body.user.emailVerified).toBe(false);

    const verify = await app.inject({
      method: 'POST',
      url: '/auth/verify-email',
      payload: { token: body.devVerificationToken },
    });
    expect(verify.statusCode).toBe(200);
    expect(verify.json()).toEqual({ verified: true });

    const me = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: authHeaders(body.accessToken),
    });
    expect(me.json().user.emailVerified).toBe(true);
  });

  it('rejects unknown tokens with 404 INVALID_TOKEN', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/verify-email',
      payload: { token: '00'.repeat(32) },
    });
    expect(res.statusCode).toBe(404);
    expect(res.json().code).toBe('INVALID_TOKEN');
  });

  it('rejects expired tokens with 410 INVALID_TOKEN', async () => {
    const { body } = await register('verify2@volt.test');
    const rec = verifyTokens.get(sha256Hex(body.devVerificationToken));
    expect(rec).toBeTruthy();
    rec!.expiresAt = Date.now() - 1000;
    const res = await app.inject({
      method: 'POST',
      url: '/auth/verify-email',
      payload: { token: body.devVerificationToken },
    });
    expect(res.statusCode).toBe(410);
    expect(res.json().code).toBe('INVALID_TOKEN');
  });

  it('tokens are single-use', async () => {
    const { body } = await register('verify3@volt.test');
    const first = await app.inject({
      method: 'POST',
      url: '/auth/verify-email',
      payload: { token: body.devVerificationToken },
    });
    expect(first.statusCode).toBe(200);
    const second = await app.inject({
      method: 'POST',
      url: '/auth/verify-email',
      payload: { token: body.devVerificationToken },
    });
    expect([404, 410]).toContain(second.statusCode);
    expect(second.json().code).toBe('INVALID_TOKEN');
  });
});

describe('password reset', () => {
  it('request always returns 200 without user enumeration', async () => {
    await register('reset1@volt.test');
    const known = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/request',
      payload: { email: 'reset1@volt.test' },
    });
    expect(known.statusCode).toBe(200);
    expect(known.json().sent).toBe(true);
    expect(known.json().devResetToken).toMatch(/^[0-9a-f]{64}$/);

    const unknown = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/request',
      payload: { email: 'nobody@volt.test' },
    });
    expect(unknown.statusCode).toBe(200);
    expect(unknown.json()).toEqual({ sent: true });
  });

  it('confirm happy path: new password works, old refresh token is revoked', async () => {
    const reg = await register('reset2@volt.test');
    const oldRefresh = reg.body.refreshToken;
    const req = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/request',
      payload: { email: 'reset2@volt.test' },
    });
    const confirm = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/confirm',
      payload: { token: req.json().devResetToken, newPassword: 'BrandNew123!' },
    });
    expect(confirm.statusCode).toBe(200);

    expect((await login('reset2@volt.test', 'BrandNew123!')).status).toBe(200);
    expect((await login('reset2@volt.test', 'Password123!')).status).toBe(401);

    const refresh = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken: oldRefresh },
    });
    expect(refresh.statusCode).toBe(401);
  });

  it('confirm rejects reuse and unknown tokens with INVALID_TOKEN', async () => {
    const req = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/request',
      payload: { email: 'reset2b@volt.test' },
    });
    // Unknown email: no token issued, so use a garbage token for the invalid case.
    expect(req.json()).toEqual({ sent: true });
    const invalid = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/confirm',
      payload: { token: '00'.repeat(32), newPassword: 'BrandNew123!' },
    });
    expect(invalid.statusCode).toBe(404);
    expect(invalid.json().code).toBe('INVALID_TOKEN');

    await register('reset3@volt.test');
    const req2 = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/request',
      payload: { email: 'reset3@volt.test' },
    });
    const token = req2.json().devResetToken;
    const first = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/confirm',
      payload: { token, newPassword: 'BrandNew123!' },
    });
    expect(first.statusCode).toBe(200);
    const reuse = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/confirm',
      payload: { token, newPassword: 'Another123!' },
    });
    expect([404, 410]).toContain(reuse.statusCode);
    expect(reuse.json().code).toBe('INVALID_TOKEN');
  });

  it('confirm rejects short passwords with 400 and keeps the token usable', async () => {
    await register('reset4@volt.test');
    const req = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/request',
      payload: { email: 'reset4@volt.test' },
    });
    const token = req.json().devResetToken;
    const short = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/confirm',
      payload: { token, newPassword: 'short' },
    });
    expect(short.statusCode).toBe(400);
    const ok = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/confirm',
      payload: { token, newPassword: 'LongEnough123!' },
    });
    expect(ok.statusCode).toBe(200);
  });
});

describe('duplicate register', () => {
  it('returns 409 EMAIL_TAKEN', async () => {
    await register('dup@volt.test');
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'dup@volt.test', password: 'Password123!', name: 'Dup' },
    });
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({
      code: 'EMAIL_TAKEN',
      message: 'An account with this email already exists. Try logging in or reset your password.',
    });
  });
});

describe('secrets never leak (new endpoints)', () => {
  it('no hashes or server secrets in new responses', async () => {
    const bodies: string[] = [];
    const reg = await register('leak2@volt.test');
    bodies.push(JSON.stringify(reg.body));
    const token = reg.body.accessToken;

    const verify = await app.inject({
      method: 'POST',
      url: '/auth/verify-email',
      payload: { token: reg.body.devVerificationToken },
    });
    bodies.push(verify.body);

    const req = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/request',
      payload: { email: 'leak2@volt.test' },
    });
    bodies.push(req.body);
    const confirm = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/confirm',
      payload: { token: req.json().devResetToken, newPassword: 'Rotat3dPass!' },
    });
    bodies.push(confirm.body);

    const loginRes = await login('leak2@volt.test', 'Rotat3dPass!');
    bodies.push(JSON.stringify(loginRes.body));

    const get = await app.inject({ method: 'GET', url: '/v1/profile', headers: authHeaders(token) });
    bodies.push(get.body);
    const put = await app.inject({
      method: 'PUT',
      url: '/v1/profile',
      headers: authHeaders(token),
      payload: { goal: 'stay fit' },
    });
    bodies.push(put.body);

    const all = bodies.join('\n');
    for (const needle of [
      'passwordHash',
      'encrypted_credentials',
      'encryptedCredentials',
      'mock-encrypted-credentials',
      'AUTH_JWT_SECRET',
      'KISI_API_KEY',
      'dev-auth-secret',
      'GOOGLE_PLACES_API_KEY',
    ]) {
      expect(all).not.toContain(needle);
    }
    expect(reg.body.user).not.toHaveProperty('passwordHash');
  });
});
