import {
  doors,
  gyms,
  locations,
  memberships,
  newId,
  nowIso,
  providerConnections,
  resetStore,
  seenKisiEventIds,
  users,
  usersByEmail,
} from './memoryStore';
import { hashPassword } from '../auth/password';
import { resetRateLimits } from '../access/rateLimit';
import { resetQrNonces } from '../access/qr';

export async function seed(): Promise<{
  userId: string;
  gymId: string;
  locationId: string;
  frontDoorId: string;
  sideDoorId: string;
  membershipId: string;
}> {
  resetStore();
  resetRateLimits();
  resetQrNonces();
  seenKisiEventIds.clear();

  const gymId = newId('gym');
  gyms.set(gymId, { id: gymId, name: 'Snap Fitness', status: 'ACTIVE', createdAt: nowIso() });

  const locationId = newId('loc');
  locations.set(locationId, {
    id: locationId,
    gymId,
    name: 'Albert Lea, MN',
    address: 'Albert Lea, MN',
    latitude: 43.648,
    longitude: -93.368,
    timezone: 'America/Chicago',
    status: 'ACTIVE',
    createdAt: nowIso(),
  });

  const frontDoorId = newId('door');
  doors.set(frontDoorId, {
    id: frontDoorId,
    locationId,
    gymId,
    name: 'front-entrance',
    provider: 'MOCK',
    providerDoorId: 'mock-front-door',
    enabled: true,
    requiresProximity: false,
    radiusMeters: 150,
    status: 'ONLINE',
    accessHours: null,
    createdAt: nowIso(),
  });

  const sideDoorId = newId('door');
  doors.set(sideDoorId, {
    id: sideDoorId,
    locationId,
    gymId,
    name: 'side-entrance',
    provider: 'MOCK',
    providerDoorId: 'mock-front-door',
    enabled: true,
    requiresProximity: false,
    radiusMeters: 150,
    status: 'ONLINE',
    accessHours: { start: '06:00', end: '22:00', days: [0, 1, 2, 3, 4, 5, 6] },
    createdAt: nowIso(),
  });

  const passwordHash = await hashPassword('Volt12345!');
  const userId = newId('user');
  const email = 'member@volt.test';
  users.set(userId, {
    id: userId,
    email,
    passwordHash,
    name: 'Seed Member',
    phone: null,
    status: 'ACTIVE',
    createdAt: nowIso(),
  });
  usersByEmail.set(email.toLowerCase(), userId);

  const membershipId = newId('mem');
  const startsAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  memberships.set(membershipId, {
    id: membershipId,
    userId,
    gymId,
    locationIds: [locationId],
    status: 'ACTIVE',
    membershipType: 'STANDARD',
    startsAt,
    expiresAt,
    accessLevel: 'FULL',
    createdAt: nowIso(),
  });

  const connId = newId('conn');
  providerConnections.set(connId, {
    id: connId,
    gymId,
    locationId: null,
    provider: 'MOCK',
    encryptedCredentials: 'mock-encrypted-credentials',
    status: 'ACTIVE',
    createdAt: nowIso(),
  });

  return { userId, gymId, locationId, frontDoorId, sideDoorId, membershipId };
}
