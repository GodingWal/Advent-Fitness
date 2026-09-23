import { Prisma, PrismaClient } from '@prisma/client';
import type {
  AccessEvent,
  AccessProviderConnection,
  Door,
  Gym,
  GymLocation,
  Membership,
  Profile,
  ProfilePatch,
  ProviderName,
  RefreshTokenRecord,
  User,
} from './types';
import type { Store } from './store';

let client: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!client) {
    client = new PrismaClient();
  }
  return client;
}

/** Test-only: disconnect + drop cached client. */
export async function __disconnectPrisma(): Promise<void> {
  if (client) {
    await client.$disconnect();
    client = null;
  }
}

function iso(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : d;
}

// Ephemeral state with no Prisma model: refresh tokens + Kisi dedupe stay in memory.
const refreshTokens = new Map<string, RefreshTokenRecord>();
const seenKisiEventIds = new Set<string>();

function toUser(r: {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string | null;
  status: User['status'];
  emailVerified: boolean;
  createdAt: Date;
}): User {
  return {
    id: r.id,
    email: r.email,
    passwordHash: r.passwordHash,
    name: r.name,
    phone: r.phone,
    status: r.status,
    emailVerified: r.emailVerified,
    createdAt: iso(r.createdAt),
  };
}

function toProfile(r: {
  id: string;
  userId: string;
  weeklyTargetH: number;
  goal: string;
  activities: string[];
  homeGymId: string | null;
  privacy: unknown;
  units: string;
  experience: string;
  notifications: unknown;
  onboardingCompleted: boolean;
  updatedAt: Date;
}): Profile {
  return {
    id: r.id,
    userId: r.userId,
    weeklyTargetH: r.weeklyTargetH,
    goal: r.goal,
    activities: r.activities,
    homeGymId: r.homeGymId,
    privacy: (r.privacy as Record<string, unknown>) ?? {},
    units: r.units,
    experience: r.experience,
    notifications: (r.notifications as Record<string, unknown>) ?? {},
    onboardingCompleted: r.onboardingCompleted,
    updatedAt: iso(r.updatedAt),
  };
}

function toGym(r: { id: string; name: string; status: Gym['status']; createdAt: Date }): Gym {
  return { id: r.id, name: r.name, status: r.status, createdAt: iso(r.createdAt) };
}

function toLocation(r: {
  id: string;
  gymId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timezone: string;
  status: GymLocation['status'];
  createdAt: Date;
}): GymLocation {
  return {
    id: r.id,
    gymId: r.gymId,
    name: r.name,
    address: r.address,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
    status: r.status,
    createdAt: iso(r.createdAt),
  };
}

function toMembership(r: {
  id: string;
  userId: string;
  gymId: string;
  locationIds: string[];
  status: Membership['status'];
  membershipType: string;
  startsAt: Date;
  expiresAt: Date;
  accessLevel: string;
  createdAt: Date;
}): Membership {
  return {
    id: r.id,
    userId: r.userId,
    gymId: r.gymId,
    locationIds: r.locationIds,
    status: r.status,
    membershipType: r.membershipType,
    startsAt: iso(r.startsAt),
    expiresAt: iso(r.expiresAt),
    accessLevel: r.accessLevel,
    createdAt: iso(r.createdAt),
  };
}

function toDoor(r: {
  id: string;
  locationId: string;
  gymId: string;
  name: string;
  provider: ProviderName;
  providerDoorId: string;
  enabled: boolean;
  requiresProximity: boolean;
  radiusMeters: number;
  status: Door['status'];
  accessHoursStart: string | null;
  accessHoursEnd: string | null;
  accessHoursDays: number[];
  createdAt: Date;
}): Door {
  return {
    id: r.id,
    locationId: r.locationId,
    gymId: r.gymId,
    name: r.name,
    provider: r.provider,
    providerDoorId: r.providerDoorId,
    enabled: r.enabled,
    requiresProximity: r.requiresProximity,
    radiusMeters: r.radiusMeters,
    status: r.status,
    accessHours:
      r.accessHoursStart && r.accessHoursEnd
        ? { start: r.accessHoursStart, end: r.accessHoursEnd, days: r.accessHoursDays ?? [] }
        : null,
    createdAt: iso(r.createdAt),
  };
}

function toEvent(r: {
  id: string;
  userId: string;
  doorId: string;
  gymId: string;
  action: string;
  result: AccessEvent['result'];
  reason: string | null;
  provider: ProviderName;
  providerEventId: string | null;
  deviceId: string | null;
  ip: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
}): AccessEvent {
  return {
    id: r.id,
    userId: r.userId,
    doorId: r.doorId,
    gymId: r.gymId,
    action: r.action,
    result: r.result,
    reason: r.reason,
    provider: r.provider,
    providerEventId: r.providerEventId,
    deviceId: r.deviceId,
    ip: r.ip,
    latitude: r.latitude,
    longitude: r.longitude,
    createdAt: iso(r.createdAt),
  };
}

class PrismaStore implements Store {
  kind = 'prisma' as const;
  private db(): PrismaClient {
    return getPrismaClient();
  }

  async reset(): Promise<void> {
    const db = this.db() as any;
    // FK-safe truncation order (children first). Social tables may not exist
    // in older generated clients — guard each so reset never throws.
    await db.chatMessage.deleteMany().catch(() => undefined);
    await db.conversationMember.deleteMany().catch(() => undefined);
    await db.conversation.deleteMany().catch(() => undefined);
    await db.meetupAttendee.deleteMany().catch(() => undefined);
    await db.meetup.deleteMany().catch(() => undefined);
    await db.reaction.deleteMany().catch(() => undefined);
    await db.comment.deleteMany().catch(() => undefined);
    await db.post.deleteMany().catch(() => undefined);
    await db.activity.deleteMany().catch(() => undefined);
    await db.accessEvent.deleteMany();
    await db.accessRule.deleteMany();
    await db.accessProviderConnection.deleteMany();
    await db.door.deleteMany();
    await db.membership.deleteMany();
    await db.profile.deleteMany();
    await db.gymLocation.deleteMany();
    await db.gym.deleteMany();
    await db.user.deleteMany();
    refreshTokens.clear();
    seenKisiEventIds.clear();
    const { resetAccountTokens } = await import('../auth/accountTokens');
    resetAccountTokens();
  }

  async getUserById(id: string): Promise<User | undefined> {
    const r = await this.db().user.findUnique({ where: { id } });
    return r ? toUser(r) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const lowered = email.toLowerCase();
    const r =
      (await this.db().user.findFirst({ where: { email: { equals: lowered, mode: 'insensitive' } } })) ??
      (await this.db().user.findUnique({ where: { email: lowered } }).catch(() => null));
    return r ? toUser(r) : undefined;
  }

  async createUser(u: User): Promise<void> {
    await this.db().user.create({
      data: {
        id: u.id,
        email: u.email,
        passwordHash: u.passwordHash,
        name: u.name,
        phone: u.phone ?? null,
        status: u.status,
        emailVerified: u.emailVerified ?? false,
        createdAt: new Date(u.createdAt),
      },
    });
  }

  async updateUser(id: string, patch: Partial<User>): Promise<User | undefined> {
    const data: { passwordHash?: string; emailVerified?: boolean; name?: string; phone?: string | null; status?: User['status'] } = {};
    if (patch.passwordHash !== undefined) data.passwordHash = patch.passwordHash;
    if (patch.emailVerified !== undefined) data.emailVerified = patch.emailVerified;
    if (patch.name !== undefined) data.name = patch.name;
    if (patch.phone !== undefined) data.phone = patch.phone;
    if (patch.status !== undefined) data.status = patch.status;
    try {
      const r = await this.db().user.update({ where: { id }, data });
      return toUser(r);
    } catch {
      return undefined;
    }
  }

  async revokeAllRefreshForUser(userId: string): Promise<void> {
    for (const rec of refreshTokens.values()) {
      if (rec.userId === userId) rec.revoked = true;
    }
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    const r = await this.db().profile.findUnique({ where: { userId } });
    return r ? toProfile(r) : undefined;
  }

  async createProfile(p: Profile): Promise<void> {
    await this.db().profile.create({
      data: {
        id: p.id,
        userId: p.userId,
        weeklyTargetH: p.weeklyTargetH,
        goal: p.goal,
        activities: p.activities,
        homeGymId: p.homeGymId,
        privacy: p.privacy as Prisma.InputJsonValue,
        units: p.units,
        experience: p.experience,
        notifications: p.notifications as Prisma.InputJsonValue,
        onboardingCompleted: p.onboardingCompleted,
      },
    });
  }

  async updateProfile(userId: string, patch: ProfilePatch): Promise<Profile | undefined> {
    const data: Prisma.ProfileUpdateInput = {};
    if (patch.weeklyTargetH !== undefined) data.weeklyTargetH = patch.weeklyTargetH;
    if (patch.goal !== undefined) data.goal = patch.goal;
    if (patch.activities !== undefined) data.activities = patch.activities;
    if (patch.homeGymId !== undefined) data.homeGymId = patch.homeGymId;
    if (patch.privacy !== undefined) data.privacy = patch.privacy as Prisma.InputJsonValue;
    if (patch.units !== undefined) data.units = patch.units;
    if (patch.experience !== undefined) data.experience = patch.experience;
    if (patch.notifications !== undefined) data.notifications = patch.notifications as Prisma.InputJsonValue;
    if (patch.onboardingCompleted !== undefined) data.onboardingCompleted = patch.onboardingCompleted;
    try {
      const r = await this.db().profile.update({ where: { userId }, data });
      return toProfile(r);
    } catch {
      return undefined;
    }
  }

  async getGym(id: string): Promise<Gym | undefined> {
    const r = await this.db().gym.findUnique({ where: { id } });
    return r ? toGym(r) : undefined;
  }

  async createGym(g: Gym): Promise<void> {
    await this.db().gym.create({
      data: { id: g.id, name: g.name, status: g.status, createdAt: new Date(g.createdAt) },
    });
  }

  async getLocation(id: string): Promise<GymLocation | undefined> {
    const r = await this.db().gymLocation.findUnique({ where: { id } });
    return r ? toLocation(r) : undefined;
  }

  async listLocationsByGym(gymId: string): Promise<GymLocation[]> {
    const rows = await this.db().gymLocation.findMany({ where: { gymId } });
    return rows.map(toLocation);
  }

  async createLocation(l: GymLocation): Promise<void> {
    await this.db().gymLocation.create({
      data: {
        id: l.id,
        gymId: l.gymId,
        name: l.name,
        address: l.address,
        latitude: l.latitude,
        longitude: l.longitude,
        timezone: l.timezone,
        status: l.status,
        createdAt: new Date(l.createdAt),
      },
    });
  }

  async getMembership(id: string): Promise<Membership | undefined> {
    const r = await this.db().membership.findUnique({ where: { id } });
    return r ? toMembership(r) : undefined;
  }

  async listMembershipsByUser(userId: string): Promise<Membership[]> {
    const rows = await this.db().membership.findMany({ where: { userId } });
    return rows.map(toMembership);
  }

  async findMembershipForGym(userId: string, gymId: string): Promise<Membership | undefined> {
    const r = await this.db().membership.findFirst({ where: { userId, gymId } });
    return r ? toMembership(r) : undefined;
  }

  async createMembership(m: Membership): Promise<void> {
    await this.db().membership.create({
      data: {
        id: m.id,
        userId: m.userId,
        gymId: m.gymId,
        locationIds: m.locationIds,
        status: m.status,
        membershipType: m.membershipType,
        startsAt: new Date(m.startsAt),
        expiresAt: new Date(m.expiresAt),
        accessLevel: m.accessLevel,
        createdAt: new Date(m.createdAt),
      },
    });
  }

  async getDoor(id: string): Promise<Door | undefined> {
    const r = await this.db().door.findUnique({ where: { id } });
    return r ? toDoor(r) : undefined;
  }

  async listDoorsByLocation(locationId: string): Promise<Door[]> {
    const rows = await this.db().door.findMany({ where: { locationId } });
    return rows.map(toDoor);
  }

  async findDoorByProviderDoorId(providerDoorId: string): Promise<Door | undefined> {
    const r = await this.db().door.findUnique({ where: { providerDoorId } });
    return r ? toDoor(r) : undefined;
  }

  async createDoor(d: Door): Promise<void> {
    await this.db().door.create({
      data: {
        id: d.id,
        locationId: d.locationId,
        gymId: d.gymId,
        name: d.name,
        provider: d.provider,
        providerDoorId: d.providerDoorId,
        enabled: d.enabled,
        requiresProximity: d.requiresProximity,
        radiusMeters: d.radiusMeters,
        status: d.status,
        accessHoursStart: d.accessHours?.start ?? null,
        accessHoursEnd: d.accessHours?.end ?? null,
        accessHoursDays: d.accessHours?.days ?? [],
        createdAt: new Date(d.createdAt),
      },
    });
  }

  async listEventsForUser(userId: string): Promise<AccessEvent[]> {
    const rows = await this.db().accessEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toEvent);
  }

  async createAccessEvent(e: AccessEvent): Promise<void> {
    await this.db().accessEvent.create({
      data: {
        id: e.id,
        userId: e.userId,
        doorId: e.doorId,
        gymId: e.gymId,
        action: e.action,
        result: e.result,
        reason: e.reason,
        provider: e.provider as ProviderName,
        providerEventId: e.providerEventId,
        deviceId: e.deviceId ?? null,
        ip: e.ip,
        latitude: e.latitude,
        longitude: e.longitude,
        createdAt: new Date(e.createdAt),
      },
    });
  }

  async getRefreshRecord(hash: string): Promise<RefreshTokenRecord | undefined> {
    return refreshTokens.get(hash);
  }

  async saveRefreshRecord(rec: RefreshTokenRecord): Promise<void> {
    refreshTokens.set(rec.hash, rec);
  }

  async deleteRefreshRecord(hash: string): Promise<void> {
    refreshTokens.delete(hash);
  }

  async hasRefreshRecord(hash: string): Promise<boolean> {
    return refreshTokens.has(hash);
  }

  async hasSeenKisiEvent(id: string): Promise<boolean> {
    return seenKisiEventIds.has(id);
  }

  async addSeenKisiEvent(id: string): Promise<void> {
    seenKisiEventIds.add(id);
  }

  async createProviderConnection(c: AccessProviderConnection): Promise<void> {
    await this.db().accessProviderConnection.create({
      data: {
        id: c.id,
        gymId: c.gymId ?? null,
        locationId: c.locationId ?? null,
        provider: c.provider,
        encryptedCredentials: c.encryptedCredentials,
        status: c.status,
        createdAt: new Date(c.createdAt),
      },
    });
  }
}

let singleton: Store | null = null;

export function getPrismaStore(): Store {
  if (!singleton) singleton = new PrismaStore();
  return singleton;
}
