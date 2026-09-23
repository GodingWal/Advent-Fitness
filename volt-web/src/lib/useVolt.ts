'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

async function json(path: string, init?: RequestInit) {
  const res = await fetch(`/api/volt/${path}`, {
    ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error((data?.message ?? 'VOLT cannot reach the server.') as string) as Error & { status: number; code?: string };
    err.status = res.status; err.code = data?.code;
    throw err;
  }
  return data;
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await json('v1/profile')) as { profile: Record<string, unknown> },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Record<string, unknown>) =>
      (await json('v1/profile', { method: 'PUT', body: JSON.stringify(patch) })) as { profile: Record<string, unknown> },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });
}

export function useMemberships() {
  return useQuery({ queryKey: ['memberships'], queryFn: async () => (await json('v1/memberships')) as { memberships: unknown[] } });
}
export function useAccessHistory() {
  return useQuery({ queryKey: ['access-history'], queryFn: async () => (await json('v1/access/history')) as { events: unknown[] } });
}
export function useActivities(q = '') {
  return useQuery({ queryKey: ['activities', q], queryFn: async () => (await json(`v1/activities${q}`)) as { activities: unknown[] } });
}
export function usePosts() {
  return useQuery({ queryKey: ['posts'], queryFn: async () => (await json('v1/feed')) as { posts: unknown[] } });
}
export function useMeetups(q = '') {
  return useQuery({ queryKey: ['meetups', q], queryFn: async () => (await json(`v1/meetups${q}`)) as { meetups: unknown[] } });
}
export function useConversations() {
  return useQuery({ queryKey: ['conversations'], queryFn: async () => (await json('v1/conversations')) as { conversations: unknown[] } });
}
