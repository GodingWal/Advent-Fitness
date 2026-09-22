import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { getStore } from '../db/store';

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

export async function createRefreshToken(
  userId: string
): Promise<{ token: string; expiresAt: number }> {
  const token = randomBytes(32).toString('hex');
  const hash = sha256Hex(token);
  const expiresAt = Date.now() + REFRESH_TTL_MS;
  await getStore().saveRefreshRecord({ hash, userId, expiresAt, revoked: false, createdAt: Date.now() });
  return { token, expiresAt };
}

export async function lookupRefreshToken(token: string): Promise<{ userId: string } | null> {
  const hash = sha256Hex(token);
  const rec = await getStore().getRefreshRecord(hash);
  if (!rec) return null;
  if (rec.revoked) return null;
  if (rec.expiresAt < Date.now()) {
    await getStore().deleteRefreshRecord(hash);
    return null;
  }
  return { userId: rec.userId };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const hash = sha256Hex(token);
  const rec = await getStore().getRefreshRecord(hash);
  if (rec) {
    rec.revoked = true;
    await getStore().saveRefreshRecord(rec);
  }
}

export async function isRefreshTokenKnown(token: string): Promise<boolean> {
  return getStore().hasRefreshRecord(sha256Hex(token));
}

export async function rotateRefreshToken(
  oldToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  const found = await lookupRefreshToken(oldToken);
  if (!found) return null;
  await revokeRefreshToken(oldToken);
  const accessToken = signAccessToken(found.userId);
  const created = await createRefreshToken(found.userId);
  return { accessToken, refreshToken: created.token };
}
