import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { accessEvents, doors, listEventsForUser, memberships, newId, nowIso } from '../db/memoryStore';
import { requireAuth } from '../auth/middleware';
import { AuthorizeError, authorizeDoorAccess } from '../access/authorize';
import { recordDoorAccessFailure } from '../access/rateLimit';
import { createQrToken, verifyQrToken } from '../access/qr';
import type { AccessEvent } from '../db/types';

const unlockSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  accuracyMeters: z.number().optional(),
});

const qrTokenSchema = z.object({
  membershipId: z.string().min(1),
});

function writeAccessEvent(input: {
  userId: string;
  doorId: string;
  gymId: string;
  result: 'GRANTED' | 'DENIED' | 'ERROR';
  reason: string | null;
  provider: string;
  providerEventId: string | null;
  ip: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): AccessEvent {
  const id = newId('evt');
  const evt: AccessEvent = {
    id,
    userId: input.userId,
    doorId: input.doorId,
    gymId: input.gymId,
    action: 'UNLOCK',
    result: input.result,
    reason: input.reason,
    provider: input.provider,
    providerEventId: input.providerEventId,
    deviceId: null,
    ip: input.ip,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    createdAt: nowIso(),
  };
  accessEvents.set(id, evt);
  return evt;
}

export async function registerAccessRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/access/history', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser;
    if (!user) {
      reply.code(401).send({ message: 'Unauthorized' });
      return;
    }
    const events = listEventsForUser(user.id).map((e) => {
      const door = doors.get(e.doorId);
      return {
        id: e.id,
        doorId: e.doorId,
        doorName: door ? door.name : 'Unknown',
        result: e.result,
        reason: e.reason,
        createdAt: e.createdAt,
      };
    });
    reply.code(200).send({ events });
  });

  app.post('/v1/access/doors/:doorId/unlock', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser;
    if (!user) {
      reply.code(401).send({ message: 'Unauthorized' });
      return;
    }
    const { doorId } = req.params as { doorId: string };
    const parsed = unlockSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues });
      return;
    }
    const door = doors.get(doorId);
    if (!door) {
      reply.code(404).send({ message: 'Door not found' });
      return;
    }
    const ip = req.ip ?? null;
    try {
      const result = await authorizeDoorAccess(user.id, doorId, {
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        accuracyMeters: parsed.data.accuracyMeters,
      });
      const evt = writeAccessEvent({
        userId: user.id,
        doorId: door.id,
        gymId: door.gymId,
        result: 'GRANTED',
        reason: null,
        provider: door.provider,
        providerEventId: result.providerEventId,
        ip,
        latitude: parsed.data.latitude ?? null,
        longitude: parsed.data.longitude ?? null,
      });
      reply.code(200).send({
        success: true,
        eventId: evt.id,
        door: { id: door.id, name: door.name },
        unlockedAt: evt.createdAt,
      });
    } catch (err) {
      if (err instanceof AuthorizeError) {
        if (err.code !== 'DOOR_NOT_FOUND') {
          recordDoorAccessFailure(user.id);
          const evt = writeAccessEvent({
            userId: user.id,
            doorId: door.id,
            gymId: door.gymId,
            result: 'DENIED',
            reason: err.code,
            provider: door.provider,
            providerEventId: null,
            ip,
            latitude: parsed.data.latitude ?? null,
            longitude: parsed.data.longitude ?? null,
          });
          void evt;
        }
        if (err.code === 'DOOR_NOT_FOUND') {
          reply.code(404).send({ message: err.message });
          return;
        }
        if (err.code === 'RATE_LIMITED') {
          reply.code(429).send({ success: false, code: err.code, message: err.message });
          return;
        }
        reply.code(200).send({ success: false, code: err.code, message: err.message });
        return;
      }
      recordDoorAccessFailure(user.id);
      writeAccessEvent({
        userId: user.id,
        doorId: door.id,
        gymId: door.gymId,
        result: 'ERROR',
        reason: 'PROVIDER_ERROR',
        provider: door.provider,
        providerEventId: null,
        ip,
        latitude: parsed.data.latitude ?? null,
        longitude: parsed.data.longitude ?? null,
      });
      reply.code(200).send({ success: false, code: 'PROVIDER_ERROR', message: 'Access provider error.' });
    }
  });

  app.post('/v1/access/qr-token', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser;
    if (!user) {
      reply.code(401).send({ message: 'Unauthorized' });
      return;
    }
    const parsed = qrTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues });
      return;
    }
    const membership = memberships.get(parsed.data.membershipId);
    if (!membership || membership.userId !== user.id) {
      reply.code(404).send({ message: 'Membership not found' });
      return;
    }
    const { token, expiresAt } = createQrToken({ membershipId: membership.id, userId: user.id });
    reply.code(200).send({ token, expiresAt });
  });

  app.get('/v1/access/qr-verify', async (req, reply) => {
    const { token } = req.query as { token?: string };
    if (!token) {
      reply.code(400).send({ valid: false, code: 'QR_INVALID' });
      return;
    }
    const result = verifyQrToken(token);
    if (!result.valid) {
      reply.code(200).send({ valid: false, code: result.code });
      return;
    }
    reply.code(200).send({ valid: true, membershipId: result.membershipId, userId: result.userId });
  });
}
