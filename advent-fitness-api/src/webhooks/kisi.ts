import { createHmac, timingSafeEqual } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { config } from '../config';
import {
  accessEvents,
  findDoorByProviderDoorId,
  newId,
  nowIso,
  seenKisiEventIds,
} from '../db/memoryStore';

function signaturesMatch(rawBody: string, provided: string, secret: string): boolean {
  const expectedHex = createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expectedHex, 'utf8');
  const b = Buffer.from(provided, 'utf8');
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function registerKisiWebhook(app: FastifyInstance): Promise<void> {
  app.post('/v1/webhooks/kisi', async (req, reply) => {
    const signature = req.headers['x-kisi-signature'];
    const sigValue = Array.isArray(signature) ? signature[0] : signature;
    const rawBody =
      (req as unknown as { rawBody?: string }).rawBody ??
      (typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {}));

    if (!sigValue || !signaturesMatch(rawBody, sigValue, config.kisiWebhookSecret)) {
      reply.code(401).send({ message: 'Invalid signature' });
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const eventIdRaw = body.event_id ?? body.id;
    const eventId = typeof eventIdRaw === 'string' || typeof eventIdRaw === 'number' ? String(eventIdRaw) : null;
    if (!eventId) {
      reply.code(400).send({ message: 'Missing event_id' });
      return;
    }
    if (seenKisiEventIds.has(eventId)) {
      reply.code(200).send({ duplicate: true });
      return;
    }
    seenKisiEventIds.add(eventId);

    const providerDoorIdRaw =
      body.lock_id ?? body.door_id ?? body.provider_door_id ?? body.providerDoorId;
    const providerDoorId =
      typeof providerDoorIdRaw === 'string' || typeof providerDoorIdRaw === 'number'
        ? String(providerDoorIdRaw)
        : null;

    const door = providerDoorId ? findDoorByProviderDoorId(providerDoorId) : undefined;
    if (!door) {
      reply.code(200).send({ received: true, mapped: false });
      return;
    }

    const resultRaw = body.result;
    const result = resultRaw === 'fail' || resultRaw === 'FAILURE' ? 'DENIED' : 'GRANTED';
    const reasonRaw = body.reason;
    const reason = typeof reasonRaw === 'string' ? reasonRaw : null;
    const actorRaw = (body.actor as Record<string, unknown> | undefined)?.user_id ?? body.user_id;
    const userId = typeof actorRaw === 'string' ? actorRaw : 'unknown';

    const evtId = newId('evt');
    accessEvents.set(evtId, {
      id: evtId,
      userId,
      doorId: door.id,
      gymId: door.gymId,
      action: typeof body.action === 'string' ? body.action : 'UNLOCK',
      result,
      reason,
      provider: 'KISI',
      providerEventId: eventId,
      deviceId: null,
      ip: req.ip ?? null,
      latitude: null,
      longitude: null,
      createdAt: nowIso(),
    });

    reply.code(200).send({ received: true, mapped: true, duplicate: false });
  });
}
