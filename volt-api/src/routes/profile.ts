import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { defaultProfile } from '../db/memoryStore';
import { getStore } from '../db/store';
import type { Profile } from '../db/types';
import { requireAuth } from '../auth/middleware';

// All fields optional; unknown top-level fields are stripped by Zod's default behavior.
const profileUpdateSchema = z.object({
  weeklyTargetH: z.number().int().optional(),
  goal: z.string().optional(),
  activities: z.array(z.string()).optional(),
  homeGymId: z.string().nullable().optional(),
  privacy: z.record(z.unknown()).optional(),
  units: z.string().optional(),
  experience: z.string().optional(),
  notifications: z.record(z.unknown()).optional(),
  onboardingCompleted: z.boolean().optional(),
});

export function serializeProfile(p: Profile): {
  id: string;
  userId: string;
  weeklyTargetH: number;
  goal: string;
  activities: string[];
  homeGymId: string | null;
  privacy: Record<string, unknown>;
  units: string;
  experience: string;
  notifications: Record<string, unknown>;
  onboardingCompleted: boolean;
  updatedAt: string;
} {
  return {
    id: p.id,
    userId: p.userId,
    weeklyTargetH: p.weeklyTargetH,
    goal: p.goal,
    activities: p.activities,
    homeGymId: p.homeGymId,
    privacy: p.privacy,
    units: p.units,
    experience: p.experience,
    notifications: p.notifications,
    onboardingCompleted: p.onboardingCompleted,
    updatedAt: p.updatedAt,
  };
}

async function ensureProfile(userId: string): Promise<Profile> {
  const store = getStore();
  const existing = await store.getProfileByUserId(userId);
  if (existing) return existing;
  const created = defaultProfile(userId);
  try {
    await store.createProfile(created);
  } catch {
    // Lost a create race (e.g. concurrent first GETs): re-read instead of failing.
    const refetch = await store.getProfileByUserId(userId);
    if (refetch) return refetch;
    throw new Error('Failed to create profile');
  }
  return created;
}

export async function registerProfileRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/profile', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser;
    if (!user) {
      reply.code(401).send({ message: 'Unauthorized' });
      return;
    }
    const profile = await ensureProfile(user.id);
    reply.code(200).send({ profile: serializeProfile(profile) });
  });

  app.put('/v1/profile', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser;
    if (!user) {
      reply.code(401).send({ message: 'Unauthorized' });
      return;
    }
    const parsed = profileUpdateSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues });
      return;
    }
    await ensureProfile(user.id);
    const profile = await getStore().updateProfile(user.id, {
      ...parsed.data,
      privacy: parsed.data.privacy as Record<string, unknown> | undefined,
      notifications: parsed.data.notifications as Record<string, unknown> | undefined,
    });
    if (!profile) {
      reply.code(500).send({ message: 'Failed to update profile' });
      return;
    }
    reply.code(200).send({ profile: serializeProfile(profile) });
  });
}
