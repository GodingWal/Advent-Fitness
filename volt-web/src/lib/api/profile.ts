import { z } from 'zod';
import { apiFetch } from './client';

export const profileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  weeklyTargetH: z.number().default(3),
  goal: z.string().default(''),
  activities: z.array(z.string()).default([]),
  homeGymId: z.string().nullable().default(null),
  privacy: z.record(z.unknown()).default({}),
  units: z.string().default('mi'),
  experience: z.string().default('beginner'),
  notifications: z.record(z.unknown()).default({}),
  onboardingCompleted: z.boolean().default(false),
  updatedAt: z.string().optional(),
});
export type Profile = z.infer<typeof profileSchema>;

export async function getProfile(token: string) {
  const res = await apiFetch<unknown>('/v1/profile', { authToken: token });
  return z.object({ profile: profileSchema }).parse(res).profile;
}

export async function updateProfile(token: string, patch: Partial<Profile>) {
  const res = await apiFetch<unknown>('/v1/profile', {
    method: 'PUT',
    authToken: token,
    body: JSON.stringify(patch),
  });
  return z.object({ profile: profileSchema }).parse(res).profile;
}
