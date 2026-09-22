import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';

let app: FastifyInstance;
const realFetch = globalThis.fetch;

beforeAll(async () => {
  app = await buildApp();
});

afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.GOOGLE_PLACES_API_KEY;
});

describe('GET /places/nearby', () => {
  it('replies 503 PLACES_UNCONFIGURED when env key is unset', async () => {
    delete process.env.GOOGLE_PLACES_API_KEY;
    const res = await app.inject({
      method: 'GET',
      url: '/places/nearby?category=gyms&latitude=43.648&longitude=-93.368&radius=5000',
    });
    expect(res.statusCode).toBe(503);
    expect(res.json()).toMatchObject({ success: false, code: 'PLACES_UNCONFIGURED' });
  });

  it('rejects invalid query with 400', async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'TESTKEY123';
    const missing = await app.inject({ method: 'GET', url: '/places/nearby?latitude=1&longitude=2' });
    expect(missing.statusCode).toBe(400);
    const badLat = await app.inject({
      method: 'GET',
      url: '/places/nearby?category=gyms&latitude=abc&longitude=2',
    });
    expect(badLat.statusCode).toBe(400);
  });

  it('calls Google with key in query, normalizes to mobile shape, never echoes key', async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'TESTKEY123';
    let seenUrl = '';
    globalThis.fetch = (async (url: unknown) => {
      seenUrl = String(url);
      return {
        json: async () => ({
          status: 'OK',
          results: [
            {
              place_id: 'p1',
              name: 'Snap Fitness',
              vicinity: '123 Main St',
              rating: 4.5,
              geometry: { location: { lat: 43.65, lng: -93.37 } },
              photos: [{ photo_reference: 'REF123' }],
              opening_hours: { open_now: true },
            },
            {
              place_id: 'p2',
              name: 'No Photo Gym',
              vicinity: '456 Side St',
              geometry: { location: { lat: 43.66, lng: -93.38 } },
            },
          ],
        }),
      } as unknown as Response;
    }) as typeof fetch;

    const res = await app.inject({
      method: 'GET',
      url: '/places/nearby?category=gyms&latitude=43.648&longitude=-93.368&radius=5000',
    });
    expect(res.statusCode).toBe(200);
    // Key must be sent to Google in the query string...
    expect(seenUrl).toContain('key=TESTKEY123');
    expect(seenUrl).toContain('nearbysearch');
    // ...but never echoed back to the client.
    expect(res.body).not.toContain('TESTKEY123');

    const data = res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(2);
    expect(data[0]).toEqual({
      id: 'p1',
      category: 'gyms',
      name: 'Snap Fitness',
      address: '123 Main St',
      rating: 4.5,
      coordinate: { latitude: 43.65, longitude: -93.37 },
      photo: expect.stringContaining('REF123'),
      open: true,
    });
    expect(data[0].photo).not.toContain('TESTKEY123');
    expect(data[1].photo).toBeNull();
  });
});
