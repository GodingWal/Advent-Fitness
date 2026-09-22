import {
  getMemberships,
  getGymLocations,
  getDoors,
  unlockDoor,
  getAccessHistory,
  requestQrToken,
} from '../access';
import { http } from '../http';

jest.mock('../http', () => ({
  http: { get: jest.fn(), post: jest.fn() },
}));

beforeEach(() => {
  http.get.mockReset();
  http.post.mockReset();
});

describe('access service', () => {
  it('getMemberships hits /v1/memberships and returns data', async () => {
    const data = { memberships: [{ id: 'm1' }] };
    http.get.mockResolvedValue({ data });
    await expect(getMemberships()).resolves.toEqual(data);
    expect(http.get).toHaveBeenCalledWith('/v1/memberships');
  });

  it('getGymLocations hits /v1/gyms/:gymId/locations', async () => {
    const data = { locations: [] };
    http.get.mockResolvedValue({ data });
    await expect(getGymLocations('g1')).resolves.toEqual(data);
    expect(http.get).toHaveBeenCalledWith('/v1/gyms/g1/locations');
  });

  it('getDoors hits /v1/locations/:locationId/doors', async () => {
    const data = { doors: [] };
    http.get.mockResolvedValue({ data });
    await expect(getDoors('loc1')).resolves.toEqual(data);
    expect(http.get).toHaveBeenCalledWith('/v1/locations/loc1/doors');
  });

  it('unlockDoor posts coords payload', async () => {
    const data = { success: true };
    http.post.mockResolvedValue({ data });
    await expect(
      unlockDoor('door1', { latitude: 32.7, longitude: -117.1, accuracyMeters: 10 })
    ).resolves.toEqual(data);
    expect(http.post).toHaveBeenCalledWith('/v1/access/doors/door1/unlock', {
      latitude: 32.7,
      longitude: -117.1,
      accuracyMeters: 10,
    });
  });

  it('unlockDoor sends empty payload when no coords', async () => {
    const data = { success: true };
    http.post.mockResolvedValue({ data });
    await expect(unlockDoor('door2')).resolves.toEqual(data);
    expect(http.post).toHaveBeenCalledWith('/v1/access/doors/door2/unlock', {});
  });

  it('getAccessHistory hits /v1/access/history', async () => {
    const data = { events: [] };
    http.get.mockResolvedValue({ data });
    await expect(getAccessHistory()).resolves.toEqual(data);
    expect(http.get).toHaveBeenCalledWith('/v1/access/history');
  });

  it('requestQrToken posts membershipId', async () => {
    const data = { token: 'tok', expiresAt: '2026-01-01' };
    http.post.mockResolvedValue({ data });
    await expect(requestQrToken('m1')).resolves.toEqual(data);
    expect(http.post).toHaveBeenCalledWith('/v1/access/qr-token', { membershipId: 'm1' });
  });

  it('propagates errors to callers', async () => {
    const err = new Error('boom');
    http.get.mockRejectedValue(err);
    await expect(getMemberships()).rejects.toBe(err);
    http.post.mockRejectedValue(err);
    await expect(unlockDoor('d')).rejects.toBe(err);
  });

  it('surfaces HTTP 429 rate-limit errors', async () => {
    const err = new Error('Too many');
    err.response = { status: 429, data: { success: false, code: 'RATE_LIMITED' } };
    http.post.mockRejectedValue(err);
    await expect(unlockDoor('d', { latitude: 1, longitude: 2 })).rejects.toMatchObject({
      response: { status: 429 },
    });
    expect(http.post).toHaveBeenCalledWith('/v1/access/doors/d/unlock', {
      latitude: 1,
      longitude: 2,
    });
  });
});
