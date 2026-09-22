import { randomUUID } from 'node:crypto';
import type {
  AccessEvent,
  AccessProviderConnection,
  AccessRule,
  Door,
  Gym,
  GymLocation,
  Membership,
  Profile,
  RefreshTokenRecord,
  User,
} from './types';

export const users = new Map<string, User>();
export const usersByEmail = new Map<string, string>();
export const profiles = new Map<string, Profile>();
export const gyms = new Map<string, Gym>();
export const locations = new Map<string, GymLocation>();
export const memberships = new Map<string, Membership>();
export const doors = new Map<string, Door>();
export const providerConnections = new Map<string, AccessProviderConnection>();
export const accessRules = new Map<string, AccessRule>();
export const accessEvents = new Map<string, AccessEvent>();
export const refreshTokens = new Map<string, RefreshTokenRecord>();
export const usedQrNonces = new Set<string>();
export const seenKisiEventIds = new Set<string>();

export function newId(prefix?: string): string {
  const id = randomUUID();
  return prefix ? `${prefix}_${id}` : id;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function defaultProfile(userId: string): Profile {
  return {
    id: newId('profile'),
    userId,
    weeklyTargetH: 3,
    goal: '',
    activities: [],
    homeGymId: null,
    privacy: {},
    units: 'mi',
    experience: 'beginner',
    notifications: {},
    onboardingCompleted: false,
    updatedAt: nowIso(),
  };
}

export function resetStore(): void {
  users.clear();
  usersByEmail.clear();
  profiles.clear();
  gyms.clear();
  locations.clear();
  memberships.clear();
  doors.clear();
  providerConnections.clear();
  accessRules.clear();
  accessEvents.clear();
  refreshTokens.clear();
  usedQrNonces.clear();
  seenKisiEventIds.clear();
}

export function findMembershipForGym(userId: string, gymId: string): Membership | undefined {
  for (const m of memberships.values()) {
    if (m.userId === userId && m.gymId === gymId) return m;
  }
  return undefined;
}

export function findDoorByProviderDoorId(providerDoorId: string): Door | undefined {
  for (const d of doors.values()) {
    if (d.providerDoorId === providerDoorId) return d;
  }
  return undefined;
}

export function listEventsForUser(userId: string): AccessEvent[] {
  return [...accessEvents.values()]
    .filter((e) => e.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
