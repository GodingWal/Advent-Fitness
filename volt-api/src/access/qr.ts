import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { usedQrNonces } from '../db/memoryStore';

const QR_TTL_SECONDS = 60;

export interface QrVerifySuccess {
  valid: true;
  membershipId: string;
  userId: string;
}

export interface QrVerifyFailure {
  valid: false;
  code: 'QR_REPLAY' | 'QR_EXPIRED' | 'QR_INVALID';
}

export function createQrToken(input: { membershipId: string; userId: string }): {
  token: string;
  expiresAt: string;
} {
  const nonce = randomUUID();
  const token = jwt.sign(
    { sub: input.userId, membershipId: input.membershipId, nonce },
    config.qrSecret,
    { algorithm: 'HS256', expiresIn: QR_TTL_SECONDS }
  );
  const expiresAt = new Date(Date.now() + QR_TTL_SECONDS * 1000).toISOString();
  return { token, expiresAt };
}

export function verifyQrToken(token: string): QrVerifySuccess | QrVerifyFailure {
  let decoded: { sub?: string; membershipId?: string; nonce?: string };
  try {
    decoded = jwt.verify(token, config.qrSecret, { algorithms: ['HS256'] }) as {
      sub?: string;
      membershipId?: string;
      nonce?: string;
    };
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) return { valid: false, code: 'QR_EXPIRED' };
    return { valid: false, code: 'QR_INVALID' };
  }
  if (!decoded || typeof decoded.sub !== 'string' || typeof decoded.membershipId !== 'string' || typeof decoded.nonce !== 'string') {
    return { valid: false, code: 'QR_INVALID' };
  }
  if (usedQrNonces.has(decoded.nonce)) {
    return { valid: false, code: 'QR_REPLAY' };
  }
  usedQrNonces.add(decoded.nonce);
  return { valid: true, membershipId: decoded.membershipId, userId: decoded.sub };
}

export function resetQrNonces(): void {
  usedQrNonces.clear();
}
