import { http } from './http';

export async function getMemberships() {
  const res = await http.get('/v1/memberships');
  return res.data;
}

export async function getGymLocations(gymId) {
  const res = await http.get(`/v1/gyms/${encodeURIComponent(gymId)}/locations`);
  return res.data;
}

export async function getDoors(locationId) {
  const res = await http.get(`/v1/locations/${encodeURIComponent(locationId)}/doors`);
  return res.data;
}

export async function unlockDoor(doorId, { latitude, longitude, accuracyMeters } = {}) {
  const payload = {};
  if (latitude !== undefined && latitude !== null) payload.latitude = latitude;
  if (longitude !== undefined && longitude !== null) payload.longitude = longitude;
  if (accuracyMeters !== undefined && accuracyMeters !== null) {
    payload.accuracyMeters = accuracyMeters;
  }
  const res = await http.post(`/v1/access/doors/${encodeURIComponent(doorId)}/unlock`, payload);
  return res.data;
}

export async function getAccessHistory() {
  const res = await http.get('/v1/access/history');
  return res.data;
}

export async function requestQrToken(membershipId) {
  const res = await http.post('/v1/access/qr-token', { membershipId });
  return res.data;
}
