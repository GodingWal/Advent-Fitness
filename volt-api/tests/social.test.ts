import { describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../src/app';
import { seed } from '../src/db/seed';
import { resetSocial } from '../src/social/store';

async function authed(app: any) {
  await seed();
  resetSocial();
  const login = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: 'member@volt.test', password: 'Volt12345!' },
  });
  const { accessToken } = login.json();
  return { accessToken, auth: { authorization: `Bearer ${accessToken}` } };
}

describe('social routes (memory store)', () => {
  let app: any;
  beforeEach(async () => {
    app = await buildApp();
  });

  it('activities CRUD with ownership enforcement', async () => {
    const { auth } = await authed(app);
    const created = await app.inject({
      method: 'POST', url: '/v1/activities', headers: auth,
      payload: { type: 'Run', title: 'Morning run', startedAt: new Date().toISOString(), durationMin: 30, distanceKm: 5 },
    });
    expect(created.statusCode).toBe(201);
    expect(created.json().activity.avgPaceSecPerKm).toBeCloseTo(360);
    const list = await app.inject({ method: 'GET', url: '/v1/activities', headers: auth });
    expect(list.json().activities).toHaveLength(1);
    const id = created.json().activity.id;
    const unauth = await app.inject({ method: 'GET', url: `/v1/activities/${id}` });
    expect(unauth.statusCode).toBe(401);
    const del = await app.inject({ method: 'DELETE', url: `/v1/activities/${id}`, headers: auth });
    expect(del.json().success).toBe(true);
  });

  it('feed post + reaction + comment', async () => {
    const { auth } = await authed(app);
    const p = await app.inject({ method: 'POST', url: '/v1/feed', headers: auth, payload: { body: 'Hello VOLT' } });
    expect(p.statusCode).toBe(201);
    const id = p.json().post.id;
    const like = await app.inject({ method: 'POST', url: `/v1/feed/${id}/reactions`, headers: auth, payload: {} });
    expect(like.json().liked).toBe(true);
    const c = await app.inject({ method: 'POST', url: `/v1/feed/${id}/comments`, headers: auth, payload: { body: 'Nice!' } });
    expect(c.statusCode).toBe(201);
  });

  it('meetup create + join + leave', async () => {
    const { auth } = await authed(app);
    const m = await app.inject({
      method: 'POST', url: '/v1/meetups', headers: auth,
      payload: { title: 'Sunrise run', activityType: 'Run', location: 'Park', startsAt: new Date(Date.now() + 864e5).toISOString(), capacity: 10 },
    });
    expect(m.statusCode).toBe(201);
    const id = m.json().meetup.id;
    const leave = await app.inject({ method: 'POST', url: `/v1/meetups/${id}/leave`, headers: auth, payload: {} });
    expect(leave.json().attendeeCount).toBe(0);
    const join = await app.inject({ method: 'POST', url: `/v1/meetups/${id}/join`, headers: auth, payload: {} });
    expect(join.json().attendeeCount).toBe(1);
  });

  it('messaging requires membership in conversation', async () => {
    const { auth } = await authed(app);
    const other = await app.inject({
      method: 'POST', url: '/auth/register',
      payload: { email: 'peer@volt.test', password: 'Volt12345!', name: 'Peer' },
    });
    const otherId = other.json().user.id;
    const conv = await app.inject({
      method: 'POST', url: '/v1/conversations', headers: auth, payload: { memberIds: [otherId] },
    });
    expect(conv.statusCode).toBe(201);
    const id = conv.json().conversation.id;
    const msg = await app.inject({
      method: 'POST', url: `/v1/conversations/${id}/messages`, headers: auth, payload: { body: 'Hey' },
    });
    expect(msg.statusCode).toBe(201);
    const list = await app.inject({ method: 'GET', url: '/v1/conversations', headers: auth });
    expect(list.json().conversations).toHaveLength(1);
  });
});
