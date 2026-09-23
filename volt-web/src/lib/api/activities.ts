import { z } from 'zod';
import { apiFetch } from './client';

export const activitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  title: z.string(),
  startedAt: z.string(),
  durationMin: z.number(),
  distanceKm: z.number().nullable().optional(),
  calories: z.number().nullable().optional(),
  elevationM: z.number().nullable().optional(),
  avgPaceSecPerKm: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type Activity = z.infer<typeof activitySchema>;

export const activityInput = z.object({
  type: z.string().min(1),
  title: z.string().min(1).max(120),
  startedAt: z.string().min(1),
  durationMin: z.number().int().min(1).max(24 * 60),
  distanceKm: z.number().min(0).max(1000).nullable().optional(),
  calories: z.number().min(0).max(20000).nullable().optional(),
  elevationM: z.number().min(0).max(20000).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});
export type ActivityInput = z.infer<typeof activityInput>;

export async function listActivities(token: string, q?: { type?: string; from?: string; to?: string; search?: string }) {
  const params = new URLSearchParams();
  if (q?.type) params.set('type', q.type);
  if (q?.from) params.set('from', q.from);
  if (q?.to) params.set('to', q.to);
  if (q?.search) params.set('search', q.search);
  const suffix = params.size ? `?${params}` : '';
  const res = await apiFetch<unknown>(`/v1/activities${suffix}`, { authToken: token });
  return z.object({ activities: z.array(activitySchema) }).parse(res).activities;
}

export async function getActivity(token: string, id: string) {
  const res = await apiFetch<unknown>(`/v1/activities/${id}`, { authToken: token });
  return z.object({ activity: activitySchema }).parse(res).activity;
}

export async function createActivity(token: string, input: ActivityInput) {
  const res = await apiFetch<unknown>('/v1/activities', {
    method: 'POST',
    authToken: token,
    body: JSON.stringify(input),
  });
  return z.object({ activity: activitySchema }).parse(res).activity;
}

export async function updateActivity(token: string, id: string, patch: Partial<ActivityInput>) {
  const res = await apiFetch<unknown>(`/v1/activities/${id}`, {
    method: 'PUT',
    authToken: token,
    body: JSON.stringify(patch),
  });
  return z.object({ activity: activitySchema }).parse(res).activity;
}

export async function deleteActivity(token: string, id: string) {
  return apiFetch<{ success: boolean }>(`/v1/activities/${id}`, { method: 'DELETE', authToken: token });
}
