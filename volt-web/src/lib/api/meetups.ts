import { z } from 'zod';
import { apiFetch } from './client';

export const meetupSchema = z.object({
  id: z.string(),
  title: z.string(),
  activityType: z.string(),
  location: z.string(),
  startsAt: z.string(),
  capacity: z.number(),
  attendeeCount: z.number(),
  joined: z.boolean().optional(),
  organizerName: z.string(),
  description: z.string().default(''),
});
export type Meetup = z.infer<typeof meetupSchema>;

export async function listMeetups(token: string, q?: { activity?: string; search?: string }) {
  const p = new URLSearchParams();
  if (q?.activity) p.set('activity', q.activity);
  if (q?.search) p.set('search', q.search);
  const s = p.size ? `?${p}` : '';
  const res = await apiFetch<unknown>(`/v1/meetups${s}`, { authToken: token });
  return z.object({ meetups: z.array(meetupSchema) }).parse(res).meetups;
}
export async function getMeetup(token: string, id: string) {
  const res = await apiFetch<unknown>(`/v1/meetups/${id}`, { authToken: token });
  return z.object({ meetup: meetupSchema }).parse(res).meetup;
}
export async function createMeetup(token: string, input: { title: string; activityType: string; location: string; startsAt: string; capacity: number; description?: string }) {
  const res = await apiFetch<unknown>('/v1/meetups', { method: 'POST', authToken: token, body: JSON.stringify(input) });
  return z.object({ meetup: meetupSchema }).parse(res).meetup;
}
export async function joinMeetup(token: string, id: string) {
  return apiFetch<{ joined: boolean; attendeeCount: number }>(`/v1/meetups/${id}/join`, { method: 'POST', authToken: token, body: '{}' });
}
export async function leaveMeetup(token: string, id: string) {
  return apiFetch<{ joined: boolean; attendeeCount: number }>(`/v1/meetups/${id}/leave`, { method: 'POST', authToken: token, body: '{}' });
}
