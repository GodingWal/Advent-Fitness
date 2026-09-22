import { defaultProfile, newId, nowIso, resetStore } from './memoryStore';
import { getStore, getStoreKind } from './store';
import { hashPassword } from '../auth/password';
import { resetAccountTokens } from '../auth/accountTokens';
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
  const store = getStore();
  await store.reset();
  if (getStoreKind() === 'memory') {
    // Keep legacy maps pristine too (tests import them directly).
    resetStore();
  }
  resetRateLimits();
  resetQrNonces();
  resetAccountTokens();

  const gymId = newId('gym');
  await store.createGym({ id: gymId, name: 'Snap Fitness', status: 'ACTIVE', createdAt: nowIso() });

  const locationId = newId('loc');
  await store.createLocation({
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
  await store.createDoor({
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
  await store.createDoor({
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
  await store.createUser({
    id: userId,
    email,
    passwordHash,
    name: 'Seed Member',
    phone: null,
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: nowIso(),
  });
  await store.createProfile(defaultProfile(userId));

  const membershipId = newId('mem');
  const startsAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  await store.createMembership({
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
  await store.createProviderConnection({
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
