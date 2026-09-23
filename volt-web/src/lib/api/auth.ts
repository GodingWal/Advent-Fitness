import { z } from 'zod';
import { apiFetch } from './client';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  status: z.string().optional(),
  emailVerified: z.boolean().optional(),
  createdAt: z.string().optional(),
});
export type User = z.infer<typeof userSchema>;

const sessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  user: userSchema,
});

export async function loginRequest(input: { email: string; password: string }) {
  const res = await apiFetch<unknown>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return sessionSchema.parse(res);
}

export async function registerRequest(input: { email: string; password: string; name: string }) {
  const res = await apiFetch<unknown>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return sessionSchema.extend({ devVerificationToken: z.string().optional() }).parse(res);
}

export async function refreshRequest(refreshToken: string) {
  const res = await apiFetch<unknown>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
  return z.object({ accessToken: z.string(), refreshToken: z.string() }).parse(res);
}

export async function meRequest(accessToken: string) {
  const res = await apiFetch<unknown>('/auth/me', { authToken: accessToken });
  return z.object({ user: userSchema }).parse(res);
}

export async function verifyEmailRequest(token: string) {
  return apiFetch<{ verified: boolean }>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function passwordResetRequest(email: string) {
  return apiFetch<{ sent: boolean }>('/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function passwordResetConfirm(token: string, newPassword: string) {
  return apiFetch<{ success: boolean }>('/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}
