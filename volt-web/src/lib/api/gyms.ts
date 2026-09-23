import { z } from 'zod';
import { apiFetch } from './client';

export const membershipSchema = z.object({
  id: z.string(),
  userId: z.string(),
  gym: z.object({ id: z.string(), name: z.string() }),
  locationIds: z.array(z.string()),
  status: z.string(),
  membershipType: z.string(),
  startsAt: z.string(),
  expiresAt: z.string(),
  accessLevel: z.string(),
});
export type Membership = z.infer<typeof membershipSchema>;

export const locationSchema = z.object({
  id: z.string(),
  gymId: z.string(),
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  status: z.string(),
});
export type GymLocation = z.infer<typeof locationSchema>;

export const doorSchema = z.object({
  id: z.string(),
  locationId: z.string(),
  name: z.string(),
  provider: z.string(),
  enabled: z.boolean(),
  requiresProximity: z.boolean(),
  status: z.string(),
  accessHours: z.unknown().nullable(),
});
export type Door = z.infer<typeof doorSchema>;

export const accessEventSchema = z.object({
  id: z.string(),
  doorId: z.string(),
  doorName: z.string(),
  result: z.string(),
  reason: z.string().nullable(),
  createdAt: z.string(),
});
export type AccessEvent = z.infer<typeof accessEventSchema>;

export async function listMemberships(token: string) {
  const res = await apiFetch<unknown>('/v1/memberships', { authToken: token });
  return z.object({ memberships: z.array(membershipSchema) }).parse(res).memberships;
}
export async function listLocations(token: string, gymId: string) {
  const res = await apiFetch<unknown>(`/v1/gyms/${gymId}/locations`, { authToken: token });
  return z.object({ locations: z.array(locationSchema) }).parse(res).locations;
}
export async function listDoors(token: string, locationId: string) {
  const res = await apiFetch<unknown>(`/v1/locations/${locationId}/doors`, { authToken: token });
  return z.object({ doors: z.array(doorSchema) }).parse(res).doors;
}
export async function accessHistory(token: string) {
  const res = await apiFetch<unknown>('/v1/access/history', { authToken: token });
  return z.object({ events: z.array(accessEventSchema) }).parse(res).events;
}
