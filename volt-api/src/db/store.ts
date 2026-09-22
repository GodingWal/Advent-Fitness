import type {
  AccessEvent,
  AccessProviderConnection,
  Door,
  Gym,
  GymLocation,
  Membership,
  RefreshTokenRecord,
  User,
} from './types';
import {
  accessEvents,
  doors,
  findDoorByProviderDoorId as findDoorByProviderDoorIdMem,
  findMembershipForGym as findMembershipForGymMem,
  gyms,
  listEventsForUser as listEventsForUserMem,
  locations,
  memberships,
  refreshTokens,
  seenKisiEventIds,
  users,
  usersByEmail,
} from './memoryStore';

export interface Store {
  kind: 'memory' | 'prisma';
  reset(): Promise<void>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(u: User): Promise<void>;
  getGym(id: string): Promise<Gym | undefined>;
  createGym(g: Gym): Promise<void>;
  getLocation(id: string): Promise<GymLocation | undefined>;
  listLocationsByGym(gymId: string): Promise<GymLocation[]>;
  createLocation(l: GymLocation): Promise<void>;
  getMembership(id: string): Promise<Membership | undefined>;
  listMembershipsByUser(userId: string): Promise<Membership[]>;
  findMembershipForGym(userId: string, gymId: string): Promise<Membership | undefined>;
  createMembership(m: Membership): Promise<void>;
  getDoor(id: string): Promise<Door | undefined>;
  listDoorsByLocation(locationId: string): Promise<Door[]>;
  findDoorByProviderDoorId(providerDoorId: string): Promise<Door | undefined>;
  createDoor(d: Door): Promise<void>;
  listEventsForUser(userId: string): Promise<AccessEvent[]>;
  createAccessEvent(e: AccessEvent): Promise<void>;
  getRefreshRecord(hash: string): Promise<RefreshTokenRecord | undefined>;
  saveRefreshRecord(rec: RefreshTokenRecord): Promise<void>;
  deleteRefreshRecord(hash: string): Promise<void>;
  hasRefreshRecord(hash: string): Promise<boolean>;
  hasSeenKisiEvent(id: string): Promise<boolean>;
  addSeenKisiEvent(id: string): Promise<void>;
  createProviderConnection(c: AccessProviderConnection): Promise<void>;
}

class MemoryStore implements Store {
  kind = 'memory' as const;

  async reset(): Promise<void> {
    users.clear();
    usersByEmail.clear();
    gyms.clear();
    locations.clear();
    memberships.clear();
    doors.clear();
    accessEvents.clear();
    refreshTokens.clear();
    seenKisiEventIds.clear();
    const { providerConnections, accessRules } = await import('./memoryStore');
    providerConnections.clear();
    accessRules.clear();
  }

  async getUserById(id: string): Promise<User | undefined> {
    return users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const id = usersByEmail.get(email.toLowerCase());
    return id ? users.get(id) : undefined;
  }

  async createUser(u: User): Promise<void> {
    users.set(u.id, u);
    usersByEmail.set(u.email.toLowerCase(), u.id);
  }

  async getGym(id: string): Promise<Gym | undefined> {
    return gyms.get(id);
  }

  async createGym(g: Gym): Promise<void> {
    gyms.set(g.id, g);
  }

  async getLocation(id: string): Promise<GymLocation | undefined> {
    return locations.get(id);
  }

  async listLocationsByGym(gymId: string): Promise<GymLocation[]> {
    return [...locations.values()].filter((l) => l.gymId === gymId);
  }

  async createLocation(l: GymLocation): Promise<void> {
    locations.set(l.id, l);
  }

  async getMembership(id: string): Promise<Membership | undefined> {
    return memberships.get(id);
  }

  async listMembershipsByUser(userId: string): Promise<Membership[]> {
    return [...memberships.values()].filter((m) => m.userId === userId);
  }

  async findMembershipForGym(userId: string, gymId: string): Promise<Membership | undefined> {
    return findMembershipForGymMem(userId, gymId);
  }

  async createMembership(m: Membership): Promise<void> {
    memberships.set(m.id, m);
  }

  async getDoor(id: string): Promise<Door | undefined> {
    return doors.get(id);
  }

  async listDoorsByLocation(locationId: string): Promise<Door[]> {
    return [...doors.values()].filter((d) => d.locationId === locationId);
  }

  async findDoorByProviderDoorId(providerDoorId: string): Promise<Door | undefined> {
    return findDoorByProviderDoorIdMem(providerDoorId);
  }

  async createDoor(d: Door): Promise<void> {
    doors.set(d.id, d);
  }

  async listEventsForUser(userId: string): Promise<AccessEvent[]> {
    return listEventsForUserMem(userId);
  }

  async createAccessEvent(e: AccessEvent): Promise<void> {
    accessEvents.set(e.id, e);
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
    const { providerConnections } = await import('./memoryStore');
    providerConnections.set(c.id, c);
  }
}

const memoryStore = new MemoryStore();

// Lazily loaded so `prisma`/`@prisma/client` are only required when DATABASE_URL is set.
let prismaStore: Store | null = null;

export function getStoreKind(): 'memory' | 'prisma' {
  return process.env.DATABASE_URL ? 'prisma' : 'memory';
}

export function getStore(): Store {
  if (getStoreKind() === 'prisma') {
    if (!prismaStore) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getPrismaStore } = require('./prismaStore') as { getPrismaStore: () => Store };
      prismaStore = getPrismaStore();
    }
    return prismaStore;
  }
  return memoryStore;
}

/** Test-only: drop the cached Prisma singleton so env changes take effect. */
export function __resetStoreCache(): void {
  prismaStore = null;
}
