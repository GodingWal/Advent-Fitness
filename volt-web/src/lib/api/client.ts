import { normalizeError, newRequestId, type ApiError } from './errors';

export function apiBaseUrl(): string {
  if (typeof window !== 'undefined') return '';
  return process.env.VOLT_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
}

export interface RequestOptions extends RequestInit {
  authToken?: string | null;
  timeoutMs?: number;
  idempotent?: boolean;
}

export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { authToken, timeoutMs = 12_000, idempotent, ...init } = opts;
  const base = apiBaseUrl();
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-Id': newRequestId(),
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers, signal: ctrl.signal, cache: 'no-store' });
  } catch {
    clearTimeout(timer);
    const err: ApiError = normalizeError(new Error('network'));
    throw Object.assign(new Error(err.message), err);
  } finally {
    clearTimeout(timer);
  }
  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;
  if (!res.ok) {
    const body = (data ?? {}) as { code?: string; message?: string };
    const err = normalizeError({ status: res.status, code: body.code, message: body.message });
    throw Object.assign(new Error(err.message), err);
  }
  return data as T;
}

export async function apiFetchWithRetry<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  // Retry only safe, idempotent GETs once on 0/429/5xx.
  const method = (opts.method ?? 'GET').toUpperCase();
  const safe = method === 'GET' || opts.idempotent === true;
  try {
    return await apiFetch<T>(path, opts);
  } catch (e) {
    const err = e as ApiError & Error;
    if (safe && (err as ApiError).retryable) {
      await new Promise((r) => setTimeout(r, 400));
      return apiFetch<T>(path, opts);
    }
    throw e;
  }
}
