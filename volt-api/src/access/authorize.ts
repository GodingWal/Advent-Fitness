import { doors, findMembershipForGym, gyms, locations, users } from '../db/memoryStore';
import { getAccessProvider } from './providers/ProviderFactory';
import { KisiProviderError } from './providers/KisiProvider';
import { MockProviderError } from './providers/MockProvider';
import { checkDoorAccessRateLimit } from './rateLimit';
import { AuthorizeError, type AuthorizeCode } from './errors';

export type { AuthorizeCode };
export { AuthorizeError };

export interface AuthorizeContext {
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
}

export interface AuthorizeSuccess {
  doorId: string;
  providerEventId: string | null;
}

function parseHm(hm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

export function isWithinAccessHours(
  accessHours: { start: string; end: string; days: number[] } | null,
  at = new Date()
): boolean {
  if (!accessHours) return true;
  const day = at.getDay();
  if (!accessHours.days.includes(day)) return false;
  const start = parseHm(accessHours.start);
  const end = parseHm(accessHours.end);
  if (start === null || end === null) return true;
  const cur = at.getHours() * 60 + at.getMinutes();
  if (start <= end) return cur >= start && cur <= end;
  return cur >= start || cur <= end;
}

export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const r = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return r * c;
}

export async function authorizeDoorAccess(
  userId: string,
  doorId: string,
  ctx: AuthorizeContext = {}
): Promise<AuthorizeSuccess> {
  const user = users.get(userId);
  if (!user || user.status !== 'ACTIVE') {
    if (user && user.status === 'SUSPENDED') {
      throw new AuthorizeError('MEMBERSHIP_SUSPENDED', 'Membership is suspended.');
    }
    throw new AuthorizeError('NO_MEMBERSHIP', 'No active membership found.');
  }

  const door = doors.get(doorId);
  if (!door) {
    throw new AuthorizeError('DOOR_NOT_FOUND', 'Door not found.', 404);
  }
  if (!door.enabled || door.status === 'DISABLED' || door.status === 'MAINTENANCE') {
    throw new AuthorizeError('DOOR_DISABLED', 'This door is currently disabled.');
  }

  const gym = gyms.get(door.gymId);
  const location = locations.get(door.locationId);
  if (!gym || gym.status !== 'ACTIVE' || !location || location.status !== 'ACTIVE') {
    throw new AuthorizeError('DOOR_DISABLED', 'This door is currently disabled.');
  }

  const membership = findMembershipForGym(userId, door.gymId);
  if (!membership) {
    throw new AuthorizeError('NO_MEMBERSHIP', 'No active membership found.');
  }
  if (membership.status === 'SUSPENDED') {
    throw new AuthorizeError('MEMBERSHIP_SUSPENDED', 'Membership is suspended.');
  }
  if (membership.status !== 'ACTIVE') {
    throw new AuthorizeError('MEMBERSHIP_INACTIVE', 'Membership is not active.');
  }
  const now = new Date();
  if (new Date(membership.expiresAt).getTime() < now.getTime()) {
    throw new AuthorizeError('MEMBERSHIP_EXPIRED', 'Membership has expired.');
  }
  if (new Date(membership.startsAt).getTime() > now.getTime()) {
    throw new AuthorizeError('MEMBERSHIP_INACTIVE', 'Membership is not active.');
  }
  if (membership.locationIds.length > 0 && !membership.locationIds.includes(door.locationId)) {
    throw new AuthorizeError('NO_MEMBERSHIP', 'No active membership found.');
  }

  if (!isWithinAccessHours(door.accessHours, now)) {
    throw new AuthorizeError('OUTSIDE_ACCESS_HOURS', 'Door is outside access hours.');
  }

  checkDoorAccessRateLimit(userId, doorId);

  if (door.requiresProximity) {
    if (typeof ctx.latitude !== 'number' || typeof ctx.longitude !== 'number') {
      throw new AuthorizeError('OUTSIDE_PROXIMITY', 'You must be near the door to unlock it.');
    }
    const radius = door.radiusMeters > 0 ? door.radiusMeters : 150;
    const dist = haversineMeters(ctx.latitude, ctx.longitude, location.latitude, location.longitude);
    if (dist > radius) {
      throw new AuthorizeError('OUTSIDE_PROXIMITY', 'You must be near the door to unlock it.');
    }
  }

  if (door.status === 'OFFLINE') {
    throw new AuthorizeError('DOOR_OFFLINE', 'Door is offline.');
  }

  const provider = getAccessProvider(door.provider);
  try {
    if (door.status === 'UNKNOWN') {
      const live = await provider.getDoorStatus(door.providerDoorId);
      if (live === 'OFFLINE') {
        throw new AuthorizeError('DOOR_OFFLINE', 'Door is offline.');
      }
    }
    const result = await provider.unlockDoor({ providerDoorId: door.providerDoorId, userId });
    void result;
    return { doorId: door.id, providerEventId: result.providerEventId ?? null };
  } catch (err) {
    if (err instanceof AuthorizeError) throw err;
    const code =
      (err as { code?: string }).code ?? 'PROVIDER_ERROR';
    if (code === 'OFFLINE') {
      throw new AuthorizeError('DOOR_OFFLINE', 'Door is offline.');
    }
    if (code === 'RATE_LIMITED') {
      throw new AuthorizeError('RATE_LIMITED', 'Too many requests. Slow down and try again.', 429);
    }
    if (code === 'PROVIDER_UNCONFIGURED') {
      throw new AuthorizeError('PROVIDER_ERROR', 'Access provider error.');
    }
    if (err instanceof MockProviderError || err instanceof KisiProviderError) {
      throw new AuthorizeError('PROVIDER_ERROR', 'Access provider error.');
    }
    throw new AuthorizeError('PROVIDER_ERROR', 'Access provider error.');
  }
}
