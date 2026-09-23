import { z } from 'zod';

// Normalized API error used across volt-web. Never surfaces raw stack traces.
export interface ApiError {
  message: string;
  code?: string;
  status: number;
  requestId: string;
  retryable: boolean;
}

export function newRequestId(): string {
  return `web_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const FRIENDLY: Record<string, string> = {
  EMAIL_TAKEN: 'This email is already registered. Try logging in or reset your password.',
  INVALID_TOKEN: 'This link expired or is invalid. Request a new one.',
  Invalid_credentials: 'Incorrect email or password.',
};

export function toUserMessage(code: string | undefined, fallback: string): string {
  if (code && FRIENDLY[code]) return FRIENDLY[code];
  return fallback;
}

export function normalizeError(input: unknown, fallback = 'VOLT cannot reach the server. Check your connection and try again.'): ApiError {
  const requestId = newRequestId();
  if (typeof input === 'object' && input !== null && 'status' in input) {
    const e = input as { status?: number; code?: string; message?: string };
    const status = typeof e.status === 'number' ? e.status : 0;
    let message = fallback;
    if (status === 401) message = 'Your session expired. Log in again.';
    else if (status === 409 && e.code === 'EMAIL_TAKEN') message = FRIENDLY.EMAIL_TAKEN;
    else if (status === 404 || status === 410) message = toUserMessage(e.code, 'This link expired or is invalid. Request a new one.');
    else if (e.message && status >= 400 && status < 500) message = e.message;
    return {
      message,
      code: e.code,
      status,
      requestId,
      retryable: status === 0 || status === 408 || status === 429 || status >= 500,
    };
  }
  if (input instanceof Error) {
    return { message: fallback, status: 0, requestId, retryable: true };
  }
  return { message: fallback, status: 0, requestId, retryable: true };
}

// Shared zod schemas
export const emailSchema = z.string().email('Enter a valid email address.');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters.');
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.'),
});
export type LoginInput = z.infer<typeof loginSchema>;
export const registerSchema = z.object({
  name: z.string().min(1, 'Enter your name.').max(80),
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;
