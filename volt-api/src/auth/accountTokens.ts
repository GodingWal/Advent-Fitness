import { randomBytes } from 'node:crypto';
import { sha256Hex } from './tokens';

export const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
export const RESET_TTL_MS = 60 * 60 * 1000;

export interface AccountTokenRecord {
  userId: string;
  expiresAt: number;
  createdAt: number;
}

/** SHA-256 hash -> record. Exported for tests (expiry manipulation) and resets. */
export const verifyTokens = new Map<string, AccountTokenRecord>();
export const resetTokens = new Map<string, AccountTokenRecord>();

/** Live read so tests/dev/prod behavior never depends on import-time env capture. */
export function isProd(): boolean {
  return (process.env.NODE_ENV ?? 'development') === 'production';
}

function issue(into: Map<string, AccountTokenRecord>, userId: string, ttlMs: number, now: number): {
  token: string;
  expiresAt: number;
} {
  const token = randomBytes(32).toString('hex');
  const expiresAt = now + ttlMs;
  into.set(sha256Hex(token), { userId, expiresAt, createdAt: now });
  return { token, expiresAt };
}

function peek(into: Map<string, AccountTokenRecord>, token: string, now: number): {
  status: 'valid' | 'invalid' | 'expired';
  userId?: string;
} {
  const rec = into.get(sha256Hex(token));
  if (!rec) return { status: 'invalid' };
  if (rec.expiresAt < now) {
    into.delete(sha256Hex(token));
    return { status: 'expired' };
  }
  return { status: 'valid', userId: rec.userId };
}

export function issueVerifyToken(userId: string, now = Date.now()): {
  token: string;
  expiresAt: number;
} {
  return issue(verifyTokens, userId, VERIFY_TTL_MS, now);
}

export function consumeVerifyToken(token: string, now = Date.now()): {
  status: 'valid' | 'invalid' | 'expired';
  userId?: string;
} {
  const res = peek(verifyTokens, token, now);
  if (res.status !== 'invalid') verifyTokens.delete(sha256Hex(token));
  return res;
}

export function issueResetToken(userId: string, now = Date.now()): {
  token: string;
  expiresAt: number;
} {
  return issue(resetTokens, userId, RESET_TTL_MS, now);
}

export function peekResetToken(token: string, now = Date.now()): {
  status: 'valid' | 'invalid' | 'expired';
  userId?: string;
} {
  return peek(resetTokens, token, now);
}

export function consumeResetToken(token: string): void {
  resetTokens.delete(sha256Hex(token));
}

export function resetAccountTokens(): void {
  verifyTokens.clear();
  resetTokens.clear();
}
