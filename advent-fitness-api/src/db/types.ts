export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
export type MembershipStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'EXPIRED' | 'CANCELLED';
export type GymStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type LocationStatus = 'ACTIVE' | 'INACTIVE';
export type DoorStatus = 'ONLINE' | 'OFFLINE' | 'UNKNOWN' | 'DISABLED' | 'MAINTENANCE';
export type ProviderName = 'MOCK' | 'KISI';
export type AccessEventResult = 'GRANTED' | 'DENIED' | 'ERROR';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string | null;
  status: UserStatus;
  createdAt: string;
}

export interface Gym {
  id: string;
  name: string;
  status: GymStatus;
  createdAt: string;
}

export interface GymLocation {
  id: string;
  gymId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timezone: string;
  status: LocationStatus;
  createdAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  gymId: string;
  locationIds: string[];
  status: MembershipStatus;
  membershipType: string;
  startsAt: string;
  expiresAt: string;
  accessLevel: string;
  createdAt: string;
}

export interface DoorAccessHours {
  start: string;
  end: string;
  days: number[];
}

export interface Door {
  id: string;
  locationId: string;
  gymId: string;
  name: string;
  provider: ProviderName;
  providerDoorId: string;
  enabled: boolean;
  requiresProximity: boolean;
  radiusMeters: number;
  status: DoorStatus;
  accessHours: DoorAccessHours | null;
  createdAt: string;
}

export interface AccessProviderConnection {
  id: string;
  gymId?: string | null;
  locationId?: string | null;
  provider: ProviderName;
  encryptedCredentials: string;
  status: string;
  createdAt: string;
}

export interface AccessEvent {
  id: string;
  userId: string;
  doorId: string;
  gymId: string;
  action: string;
  result: AccessEventResult;
  reason: string | null;
  provider: string;
  providerEventId: string | null;
  deviceId?: string | null;
  ip: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
}

export interface AccessRule {
  id: string;
  doorId: string;
  gymId: string;
  locationId?: string | null;
  membershipType?: string | null;
  accessLevel?: string | null;
  accessHours: DoorAccessHours | null;
  requiresProximity: boolean;
  radiusMeters: number;
  enabled: boolean;
  createdAt: string;
}

export interface RefreshTokenRecord {
  hash: string;
  userId: string;
  expiresAt: number;
  revoked: boolean;
  createdAt: number;
}
