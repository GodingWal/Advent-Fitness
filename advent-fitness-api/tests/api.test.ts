import { createHmac } from 'node:crypto';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { seed } from '../src/db/seed';
import {
  accessEvents,
  doors,
  gyms,
  locations,
  memberships,
  newId,
  nowIso,
  users,
  usersByEmail,
} from '../src/db/memoryStore';
import { hashPassword } from '../src/auth/password';
import { signAccessToken } from '../src/auth/tokens';
import { resetRateLimits } from '../src/access/rateLimit';
import { config } from '../src/config';

type Seed = {
  userId: string;
  gymId: string;
  locationId: string;
  frontDoorId: string;
  sideDoorId: string;
  membershipId: string;
};

let app: FastifyInstance;
let s: Seed;
let seedToken: string;

const SEED_EMAIL = 'member@volt.test';
const SEED_PASSWORD = 'Volt12345!';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function login(email = SEED_EMAIL, password = SEED_PASSWORD): Promise<{
  accessToken: string;
  refreshToken: string;
  user: Record<string, unknown>;
}> {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email, password },
  });
  expect(res.statusCode).toBe(200);
  return res.json();
}

function authHeaders(token: string): Record<string, string> {
  return { authorization: `Bearer ${token}` };
}

async function makeUser(
  email: string,
  opts: { status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'; password?: string; name?: string } = {}
): Promise<{ userId: string; token: string; email: string }> {
  const password = opts.password ?? 'Password123!';
  const passwordHash = await hashPassword(password);
  const userId = newId('user');
  users.set(userId, {
    id: userId,
    email,
    passwordHash,
    name: opts.name ?? 'Test User',
    phone: null,
    status: opts.status ?? 'ACTIVE',
    createdAt: nowIso(),
  });
  usersByEmail.set(email.toLowerCase(), userId);
  return { userId, token: signAccessToken(userId), email };
}

function makeMembership(
  userId: string,
  gymId: string,
  locationIds: string[],
  opts: {
    status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'EXPIRED' | 'CANCELLED';
    startsAt?: string;
    expiresAt?: string;
  } = {}
): string {
  const id = newId('mem');
  memberships.set(id, {
    id,
    userId,
    gymId,
    locationIds,
    status: opts.status ?? 'ACTIVE',
    membershipType: 'STANDARD',
    startsAt: opts.startsAt ?? new Date(Date.now() - 86400000).toISOString(),
    expiresAt: opts.expiresAt ?? new Date(Date.now() + 365 * 86400000).toISOString(),
    accessLevel: 'FULL',
    createdAt: nowIso(),
  });
  return id;
}

function makeDoor(
  locationId: string,
  gymId: string,
  opts: {
    name?: string;
    provider?: 'MOCK' | 'KISI';
    providerDoorId?: string;
    enabled?: boolean;
    requiresProximity?: boolean;
    radiusMeters?: number;
    status?: 'ONLINE' | 'OFFLINE' | 'UNKNOWN' | 'DISABLED' | 'MAINTENANCE';
    accessHours?: { start: string; end: string; days: number[] } | null;
  } = {}
): string {
  const id = newId('door');
  doors.set(id, {
    id,
    locationId,
    gymId,
    name: opts.name ?? `door-${id.slice(0, 6)}`,
    provider: opts.provider ?? 'MOCK',
    providerDoorId: opts.providerDoorId ?? 'mock-front-door',
    enabled: opts.enabled ?? true,
    requiresProximity: opts.requiresProximity ?? false,
    radiusMeters: opts.radiusMeters ?? 150,
    status: opts.status ?? 'ONLINE',
    accessHours: opts.accessHours === undefined ? null : opts.accessHours,
    createdAt: nowIso(),
  });
  return id;
}

beforeAll(async () => {
  app = await buildApp();
});

beforeEach(async () => {
  s = await seed();
  const creds = await login();
  seedToken = creds.accessToken;
});

describe('auth', () => {
  it('registers, logs in, returns me, refreshes (rotates), rejects reuse, logs out', async () => {
    const reg = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'new@volt.test', password: 'Password123!', name: 'New User' },
    });
    expect(reg.statusCode).toBe(201);
    const regBody = reg.json();
    expect(regBody.accessToken).toBeTruthy();
    expect(regBody.refreshToken).toBeTruthy();
    expect(regBody.user.email).toBe('new@volt.test');

    const me = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: authHeaders(regBody.accessToken),
    });
    expect(me.statusCode).toBe(200);
    expect(me.json().user.email).toBe('new@volt.test');

    const r1 = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken: regBody.refreshToken },
    });
    expect(r1.statusCode).toBe(200);
    expect(r1.json().accessToken).toBeTruthy();
    const rotatedRefresh = r1.json().refreshToken;

    const reuse = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken: regBody.refreshToken },
    });
    expect(reuse.statusCode).toBe(401);

    const logout = await app.inject({
      method: 'POST',
      url: '/auth/logout',
      payload: { refreshToken: rotatedRefresh },
    });
    expect(logout.statusCode).toBe(200);

    const afterLogout = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken: rotatedRefresh },
    });
    expect(afterLogout.statusCode).toBe(401);
  });

  it('rejects invalid JWT', async () => {
    const bad = await app.inject({
      method: 'GET',
      url: '/v1/memberships',
      headers: { authorization: 'Bearer garbage-token' },
    });
    expect(bad.statusCode).toBe(401);

    const missing = await app.inject({ method: 'GET', url: '/v1/memberships' });
    expect(missing.statusCode).toBe(401);

    const unlockNoAuth = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${s.frontDoorId}/unlock`,
      payload: {},
    });
    expect(unlockNoAuth.statusCode).toBe(401);
  });
});

describe('memberships / gyms / locations / doors', () => {
  it('lists memberships, gym, locations, doors with exact contract shapes', async () => {
    const m = await app.inject({
      method: 'GET',
      url: '/v1/memberships',
      headers: authHeaders(seedToken),
    });
    expect(m.statusCode).toBe(200);
    const mems = m.json().memberships;
    expect(Array.isArray(mems)).toBe(true);
    expect(mems.length).toBeGreaterThan(0);
    const one = mems[0];
    for (const k of ['id', 'userId', 'gym', 'locationIds', 'status', 'membershipType', 'startsAt', 'expiresAt', 'accessLevel']) {
      expect(one).toHaveProperty(k);
    }
    expect(one.gym).toHaveProperty('id');
    expect(one.gym).toHaveProperty('name');

    const g = await app.inject({
      method: 'GET',
      url: `/v1/gyms/${s.gymId}`,
      headers: authHeaders(seedToken),
    });
    expect(g.statusCode).toBe(200);
    expect(g.json().gym.name).toBe('Snap Fitness');

    const loc = await app.inject({
      method: 'GET',
      url: `/v1/gyms/${s.gymId}/locations`,
      headers: authHeaders(seedToken),
    });
    expect(loc.statusCode).toBe(200);
    const locs = loc.json().locations;
    expect(locs.length).toBeGreaterThan(0);
    for (const k of ['id', 'gymId', 'name', 'address', 'latitude', 'longitude', 'timezone', 'status']) {
      expect(locs[0]).toHaveProperty(k);
    }

    const d = await app.inject({
      method: 'GET',
      url: `/v1/locations/${s.locationId}/doors`,
      headers: authHeaders(seedToken),
    });
    expect(d.statusCode).toBe(200);
    const ds = d.json().doors;
    expect(ds.length).toBeGreaterThan(0);
    for (const door of ds) {
      expect(['ONLINE', 'OFFLINE', 'UNKNOWN', 'DISABLED', 'MAINTENANCE']).toContain(door.status);
      for (const k of ['id', 'locationId', 'name', 'provider', 'enabled', 'requiresProximity', 'status', 'accessHours']) {
        expect(door).toHaveProperty(k);
      }
    }
  });
});

describe('unlock happy path + policy denies', () => {
  it('granted happy path', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${s.frontDoorId}/unlock`,
      headers: authHeaders(seedToken),
      payload: {},
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.eventId).toBeTruthy();
    expect(body.door.id).toBe(s.frontDoorId);
    expect(body.unlockedAt).toBeTruthy();
  });

  it('denies expired membership', async () => {
    const u = await makeUser('expired@volt.test');
    makeMembership(u.userId, s.gymId, [s.locationId], {
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });
    const res = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${s.frontDoorId}/unlock`,
      headers: authHeaders(u.token),
      payload: {},
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ success: false, code: 'MEMBERSHIP_EXPIRED' });
  });

  it('denies suspended membership', async () => {
    const u = await makeUser('susp@volt.test');
    makeMembership(u.userId, s.gymId, [s.locationId], { status: 'SUSPENDED' });
    const res = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${s.frontDoorId}/unlock`,
      headers: authHeaders(u.token),
      payload: {},
    });
    expect(res.json()).toMatchObject({ success: false, code: 'MEMBERSHIP_SUSPENDED' });
  });

  it('denies inactive membership', async () => {
    const u = await makeUser('inactive@volt.test');
    makeMembership(u.userId, s.gymId, [s.locationId], { status: 'INACTIVE' });
    const res = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${s.frontDoorId}/unlock`,
      headers: authHeaders(u.token),
      payload: {},
    });
    expect(res.json()).toMatchObject({ success: false, code: 'MEMBERSHIP_INACTIVE' });
  });

  it('denies when user has no membership (NO_MEMBERSHIP / missing membership)', async () => {
    const u = await makeUser('nomem@volt.test');
    const res = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${s.frontDoorId}/unlock`,
      headers: authHeaders(u.token),
      payload: {},
    });
    expect(res.json()).toMatchObject({ success: false, code: 'NO_MEMBERSHIP' });
  });

  it('denies wrong-gym membership', async () => {
    const gymB = newId('gym');
    gyms.set(gymB, { id: gymB, name: 'Other Gym', status: 'ACTIVE', createdAt: nowIso() });
    const locB = newId('loc');
    locations.set(locB, {
      id: locB,
      gymId: gymB,
      name: 'Elsewhere',
      address: 'Elsewhere',
      latitude: 44,
      longitude: -93,
      timezone: 'America/Chicago',
      status: 'ACTIVE',
      createdAt: nowIso(),
    });
    const doorB = makeDoor(locB, gymB);
    const u = await makeUser('wronggym@volt.test');
    makeMembership(u.userId, s.gymId, [s.locationId]);
    const res = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${doorB}/unlock`,
      headers: authHeaders(u.token),
      payload: {},
    });
    expect(res.json()).toMatchObject({ success: false, code: 'NO_MEMBERSHIP' });
  });

  it('denies location not covered by membership', async () => {
    const locB = newId('loc');
    locations.set(locB, {
      id: locB,
      gymId: s.gymId,
      name: 'Second Branch',
      address: 'Second Branch',
      latitude: 43.7,
      longitude: -93.4,
      timezone: 'America/Chicago',
      status: 'ACTIVE',
      createdAt: nowIso(),
    });
    const doorB = makeDoor(locB, s.gymId);
    const u = await makeUser('loccover@volt.test');
    makeMembership(u.userId, s.gymId, [s.locationId]);
    const res = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${doorB}/unlock`,
      headers: authHeaders(u.token),
      payload: {},
    });
    expect(res.json()).toMatchObject({ success: false, code: 'NO_MEMBERSHIP' });
  });

  it('denies disabled door', async () => {
    const doorId = makeDoor(s.locationId, s.gymId, { enabled: false });
    const res = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${doorId}/unlock`,
      headers: authHeaders(seedToken),
      payload: {},
    });
    expect(res.json()).toMatchObject({ success: false, code: 'DOOR_DISABLED' });
  });

  it('denies door with DISABLED status', async () => {
    const doorId = makeDoor(s.locationId, s.gymId, { status: 'DISABLED' });
    const res = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${doorId}/unlock`,
      headers: authHeaders(seedToken),
      payload: {},
    });
    expect(res.json()).toMatchObject({ success: false, code: 'DOOR_DISABLED' });
  });

  it('denies outside access hours', async () => {
    const tomorrow = (new Date().getDay() + 1) % 7;
    const doorId = makeDoor(s.locationId, s.gymId, {
      accessHours: { start: '00:00', end: '23:59', days: [tomorrow] },
    });
    const res = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${doorId}/unlock`,
      headers: authHeaders(seedToken),
      payload: {},
    });
    expect(res.json()).toMatchObject({ success: false, code: 'OUTSIDE_ACCESS_HOURS' });
  });

  it('denies outside proximity and grants when near (server-computed)', async () => {
    const doorId = makeDoor(s.locationId, s.gymId, { requiresProximity: true, radiusMeters: 150 });
    const missing = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${doorId}/unlock`,
      headers: authHeaders(seedToken),
      payload: {},
    });
    expect(missing.json()).toMatchObject({ success: false, code: 'OUTSIDE_PROXIMITY' });

    resetRateLimits();
    const far = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${doorId}/unlock`,
      headers: authHeaders(seedToken),
      payload: { latitude: 0, longitude: 0 },
    });
    expect(far.json()).toMatchObject({ success: false, code: 'OUTSIDE_PROXIMITY' });

    resetRateLimits();
    const near = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${doorId}/unlock`,
      headers: authHeaders(seedToken),
      payload: { latitude: 43.648, longitude: -93.368 },
    });
    expect(near.json().success).toBe(true);
  });

  it('maps provider offline to DOOR_OFFLINE', async () => {
    const doorId = makeDoor(s.locationId, s.gymId, {
      providerDoorId: 'mock-offline-door',
      status: 'ONLINE',
    });
    const res = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${doorId}/unlock`,
      headers: authHeaders(seedToken),
      payload: {},
    });
    expect(res.json()).toMatchObject({ success: false, code: 'DOOR_OFFLINE' });
  });

  it('maps stored OFFLINE status to DOOR_OFFLINE', async () => {
    const doorId = makeDoor(s.locationId, s.gymId, { status: 'OFFLINE' });
    const res = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${doorId}/unlock`,
      headers: authHeaders(seedToken),
      payload: {},
    });
    expect(res.json()).toMatchObject({ success: false, code: 'DOOR_OFFLINE' });
  });

  it('maps provider timeout + reject to PROVIDER_ERROR', async () => {
    const tDoor = makeDoor(s.locationId, s.gymId, { providerDoorId: 'mock-timeout-door' });
    const t = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${tDoor}/unlock`,
      headers: authHeaders(seedToken),
      payload: {},
    });
    expect(t.json()).toMatchObject({ success: false, code: 'PROVIDER_ERROR' });

    resetRateLimits();
    const rDoor = makeDoor(s.locationId, s.gymId, { providerDoorId: 'mock-reject-door' });
    const r = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${rDoor}/unlock`,
      headers: authHeaders(seedToken),
      payload: {},
    });
    expect(r.json()).toMatchObject({ success: false, code: 'PROVIDER_ERROR' });
  });

  it('enforces 1 unlock per door per 3s (429 RATE_LIMITED)', async () => {
    const first = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${s.frontDoorId}/unlock`,
      headers: authHeaders(seedToken),
      payload: {},
    });
    expect(first.json().success).toBe(true);
    const second = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${s.frontDoorId}/unlock`,
      headers: authHeaders(seedToken),
      payload: {},
    });
    expect(second.statusCode).toBe(429);
    expect(second.json()).toMatchObject({ success: false, code: 'RATE_LIMITED' });
  });

  it('enforces 10 unlocks per minute per user across doors', async () => {
    const doorIds: string[] = [];
    for (let i = 0; i < 11; i++) doorIds.push(makeDoor(s.locationId, s.gymId));
    for (let i = 0; i < 10; i++) {
      const r = await app.inject({
        method: 'POST',
        url: `/v1/access/doors/${doorIds[i]}/unlock`,
        headers: authHeaders(seedToken),
        payload: {},
      });
      expect(r.json().success).toBe(true);
    }
    const limited = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${doorIds[10]}/unlock`,
      headers: authHeaders(seedToken),
      payload: {},
    });
    expect(limited.statusCode).toBe(429);
    expect(limited.json()).toMatchObject({ success: false, code: 'RATE_LIMITED' });
  });
});

describe('events are written on success AND failure, history newest first', () => {
  it('writes events for success and failure; history sorted newest first', async () => {
    const before = accessEvents.size;
    const ok = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${s.frontDoorId}/unlock`,
      headers: authHeaders(seedToken),
      payload: {},
    });
    expect(ok.json().success).toBe(true);
    const okEvents = [...accessEvents.values()].filter(
      (e) => e.userId === s.userId && e.result === 'GRANTED'
    );
    expect(okEvents.length).toBeGreaterThan(0);
    expect(accessEvents.size).toBe(before + 1);
    await sleep(5);

    const u = await makeUser('evt@volt.test');
    makeMembership(u.userId, s.gymId, [s.locationId], {
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });
    const failDoor = makeDoor(s.locationId, s.gymId);
    const fail = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${failDoor}/unlock`,
      headers: authHeaders(u.token),
      payload: {},
    });
    expect(fail.json().success).toBe(false);
    const failEvents = [...accessEvents.values()].filter((e) => e.userId === u.userId);
    expect(failEvents.length).toBe(1);
    expect(failEvents[0].result).toBe('DENIED');
    expect(failEvents[0].reason).toBe('MEMBERSHIP_EXPIRED');

    await sleep(5);
    resetRateLimits();
    await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${s.frontDoorId}/unlock`,
      headers: authHeaders(seedToken),
      payload: {},
    });
    const hist = await app.inject({
      method: 'GET',
      url: '/v1/access/history',
      headers: authHeaders(seedToken),
    });
    expect(hist.statusCode).toBe(200);
    const events = hist.json().events;
    expect(events.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < events.length; i++) {
      expect(new Date(events[i - 1].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(events[i].createdAt).getTime()
      );
    }
    for (const e of events) {
      for (const k of ['id', 'doorId', 'doorName', 'result', 'reason', 'createdAt']) {
        expect(e).toHaveProperty(k);
      }
    }
    const onlyMine = events.every((e: { doorId: string }) => {
      const evt = accessEvents.get(e.id);
      return evt?.userId === s.userId;
    });
    expect(onlyMine).toBe(true);
  });
});

describe('secrets never leak', () => {
  it('no encrypted credentials, password hashes, or provider keys in any response', async () => {
    const bodies: string[] = [];
    const reg = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'leak@volt.test', password: 'Password123!', name: 'Leak' },
    });
    bodies.push(reg.body);
    const loginRes = await login('leak@volt.test', 'Password123!');
    bodies.push(JSON.stringify(loginRes));
    const token = loginRes.accessToken;

    const urls: Array<{ method: string; url: string }> = [
      { method: 'GET', url: '/auth/me' },
      { method: 'GET', url: '/v1/memberships' },
      { method: 'GET', url: `/v1/gyms/${s.gymId}` },
      { method: 'GET', url: `/v1/gyms/${s.gymId}/locations` },
      { method: 'GET', url: `/v1/locations/${s.locationId}/doors` },
      { method: 'GET', url: '/v1/access/history' },
    ];
    for (const u of urls) {
      const r = await app.inject({ method: u.method as 'GET', url: u.url, headers: authHeaders(token) });
      bodies.push(r.body);
    }
    const unlock = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${s.frontDoorId}/unlock`,
      headers: authHeaders(token),
      payload: {},
    });
    bodies.push(unlock.body);

    const qr = await app.inject({
      method: 'POST',
      url: '/v1/access/qr-token',
      headers: authHeaders(seedToken),
      payload: { membershipId: s.membershipId },
    });
    bodies.push(qr.body);

    const all = bodies.join('\n');
    for (const needle of [
      'passwordHash',
      'encrypted_credentials',
      'encryptedCredentials',
      'mock-encrypted-credentials',
      'AUTH_JWT_SECRET',
      'KISI_API_KEY',
      'dev-auth-secret',
    ]) {
      expect(all).not.toContain(needle);
    }
    expect(loginRes.user).not.toHaveProperty('passwordHash');
    const me = await app.inject({ method: 'GET', url: '/auth/me', headers: authHeaders(token) });
    expect(me.json().user).not.toHaveProperty('passwordHash');
  });
});

describe('qr tokens single-use', () => {
  it('issues a 60s token and rejects replays', async () => {
    const qr = await app.inject({
      method: 'POST',
      url: '/v1/access/qr-token',
      headers: authHeaders(seedToken),
      payload: { membershipId: s.membershipId },
    });
    expect(qr.statusCode).toBe(200);
    const { token, expiresAt } = qr.json();
    expect(token).toBeTruthy();
    expect(expiresAt).toBeTruthy();

    const first = await app.inject({ method: 'GET', url: `/v1/access/qr-verify?token=${encodeURIComponent(token)}` });
    expect(first.json()).toMatchObject({ valid: true });

    const replay = await app.inject({ method: 'GET', url: `/v1/access/qr-verify?token=${encodeURIComponent(token)}` });
    expect(replay.json()).toEqual({ valid: false, code: 'QR_REPLAY' });
  });
});

describe('kisi webhook', () => {
  function sign(body: string): string {
    return createHmac('sha256', config.kisiWebhookSecret).update(body).digest('hex');
  }

  it('verifies HMAC, maps door, stores event, rejects replays and bad signatures', async () => {
    const kisiDoor = makeDoor(s.locationId, s.gymId, {
      name: 'kisi-door',
      provider: 'KISI',
      providerDoorId: 'kisi-lock-1',
    });
    void kisiDoor;
    const before = accessEvents.size;
    const payload = JSON.stringify({
      event_id: 'kisi-evt-1',
      lock_id: 'kisi-lock-1',
      action: 'UNLOCK',
      result: 'success',
    });
    const first = await app.inject({
      method: 'POST',
      url: '/v1/webhooks/kisi',
      headers: { 'content-type': 'application/json', 'x-kisi-signature': sign(payload) },
      payload,
    });
    expect(first.statusCode).toBe(200);
    expect(first.json().mapped).toBe(true);
    expect(accessEvents.size).toBe(before + 1);

    const replay = await app.inject({
      method: 'POST',
      url: '/v1/webhooks/kisi',
      headers: { 'content-type': 'application/json', 'x-kisi-signature': sign(payload) },
      payload,
    });
    expect(replay.statusCode).toBe(200);
    expect(replay.json()).toEqual({ duplicate: true });
    expect(accessEvents.size).toBe(before + 1);

    const badSig = await app.inject({
      method: 'POST',
      url: '/v1/webhooks/kisi',
      headers: { 'content-type': 'application/json', 'x-kisi-signature': 'bad' },
      payload,
    });
    expect(badSig.statusCode).toBe(401);
  });
});
