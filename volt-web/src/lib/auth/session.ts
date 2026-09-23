import { cookies } from 'next/headers';

export const ACCESS_COOKIE = 'volt_at';
export const REFRESH_COOKIE = 'volt_rt';

const ACCESS_MAX_AGE = 60 * 15; // 15 min, mirrors volt-api access token TTL
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 d

export function apiBase(): string {
  return process.env.VOLT_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
}

export async function getAccessToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(REFRESH_COOKIE)?.value ?? null;
}

export async function setSession(accessToken: string, refreshToken?: string): Promise<void> {
  const c = await cookies();
  c.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: ACCESS_MAX_AGE,
  });
  if (refreshToken) {
    c.set(REFRESH_COOKIE, refreshToken, {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
      path: '/', maxAge: REFRESH_MAX_AGE,
    });
  }
}

export async function clearSession(): Promise<void> {
  const c = await cookies();
  c.delete(ACCESS_COOKIE);
  c.delete(REFRESH_COOKIE);
}

export async function fetchMe(accessToken: string): Promise<{ id: string; email: string; name: string } | null> {
  try {
    const res = await fetch(`${apiBase()}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user: { id: string; email: string; name: string } };
    return data.user;
  } catch {
    return null;
  }
}

export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // same-origin form posts / server calls
  try {
    const o = new URL(origin);
    const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '';
    return o.host === host;
  } catch {
    return false;
  }
}
