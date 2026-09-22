import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { refreshTokens } from '../db/memoryStore';

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.authJwtSecret, {
    algorithm: 'HS256',
    expiresIn: ACCESS_TTL_SECONDS,
  });
}

export function verifyAccessToken(token: string): { sub: string } | null {
  try {
    const decoded = jwt.verify(token, config.authJwtSecret, { algorithms: ['HS256'] }) as {
      sub?: string;
    };
    if (!decoded || typeof decoded.sub !== 'string') return null;
    return { sub: decoded.sub };
  } catch {
    return null;
  }
}

export function createRefreshToken(userId: string): { token: string; expiresAt: number } {
  const token = randomBytes(32).toString('hex');
  const hash = sha256Hex(token);
  const expiresAt = Date.now() + REFRESH_TTL_MS;
  refreshTokens.set(hash, { hash, userId, expiresAt, revoked: false, createdAt: Date.now() });
  return { token, expiresAt };
}

export function lookupRefreshToken(token: string): { userId: string } | null {
  const hash = sha256Hex(token);
  const rec = refreshTokens.get(hash);
  if (!rec) return null;
  if (rec.revoked) return null;
  if (rec.expiresAt < Date.now()) {
    refreshTokens.delete(hash);
    return null;
  }
  return { userId: rec.userId };
}

export function revokeRefreshToken(token: string): void {
  const hash = sha256Hex(token);
  const rec = refreshTokens.get(hash);
  if (rec) rec.revoked = true;
}

export function isRefreshTokenKnown(token: string): boolean {
  return refreshTokens.has(sha256Hex(token));
}

export function rotateRefreshToken(oldToken: string): { accessToken: string; refreshToken: string } | null {
  const found = lookupRefreshToken(oldToken);
  if (!found) return null;
  revokeRefreshToken(oldToken);
  const accessToken = signAccessToken(found.userId);
  const created = createRefreshToken(found.userId);
  return { accessToken, refreshToken: created.token };
}
