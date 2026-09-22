// Prisma-backed integration test. Runs ONLY when DATABASE_URL is set, otherwise skips.
// Requires: docker compose up -d, then `npx prisma migrate deploy`.
// Exercises register -> membership -> unlock -> history end-to-end against the Prisma store.
import { afterAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { newId, nowIso } from '../src/db/memoryStore';

const hasDb = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDb ? describe : describe.skip;

describeIfDb('prisma store integration (DATABASE_URL set)', () => {
  let app: FastifyInstance;

  it('register -> membership -> unlock -> history', async () => {
    const { buildApp } = await import('../src/app');
    const { seed } = await import('../src/db/seed');
    const { getStore } = await import('../src/db/store');
    app = await buildApp();
    const s = await seed();
    const store = getStore();
    expect(store.kind).toBe('prisma');

    // Register a fresh user via the API.
    const email = `prisma-${Date.now()}@volt.test`;
    const reg = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email, password: 'Password123!', name: 'Prisma User' },
    });
    expect(reg.statusCode).toBe(201);
    const { accessToken, user } = reg.json() as { accessToken: string; user: { id: string } };
    expect(accessToken).toBeTruthy();

    // Memberships start empty for the new user; grant one directly via the store
    // (there is no membership-creation endpoint by design).
    const before = await app.inject({
      method: 'GET',
      url: '/v1/memberships',
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(before.json().memberships).toHaveLength(0);

    const mid = newId('mem');
    await store.createMembership({
      id: mid,
      userId: user.id,
      gymId: s.gymId,
      locationIds: [s.locationId],
      status: 'ACTIVE',
      membershipType: 'STANDARD',
      startsAt: new Date(Date.now() - 86400000).toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      accessLevel: 'FULL',
      createdAt: nowIso(),
    });

    const mems = await app.inject({
      method: 'GET',
      url: '/v1/memberships',
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(mems.statusCode).toBe(200);
    expect(mems.json().memberships).toHaveLength(1);

    // Unlock the seeded front door.
    const unlock = await app.inject({
      method: 'POST',
      url: `/v1/access/doors/${s.frontDoorId}/unlock`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {},
    });
    expect(unlock.statusCode).toBe(200);
    expect(unlock.json().success).toBe(true);

    // History shows the GRANTED event.
    const hist = await app.inject({
      method: 'GET',
      url: '/v1/access/history',
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(hist.statusCode).toBe(200);
    const events = hist.json().events as Array<{ result: string }>;
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].result).toBe('GRANTED');
  });

  afterAll(async () => {
    const { __disconnectPrisma } = await import('../src/db/prismaStore');
    await __disconnectPrisma();
  });
});
