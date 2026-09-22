import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { newId, nowIso } from '../db/memoryStore';
import { getStore } from '../db/store';
import { hashPassword, verifyPassword } from '../auth/password';
import { publicUser, requireAuth } from '../auth/middleware';
import {
  createRefreshToken,
  isRefreshTokenKnown,
  lookupRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken,
} from '../auth/tokens';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  app.post('/auth/register', async (req, reply) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues });
      return;
    }
    const store = getStore();
    const existing = await store.getUserByEmail(parsed.data.email);
    if (existing) {
      reply.code(409).send({ message: 'Email already registered' });
      return;
    }
    const passwordHash = await hashPassword(parsed.data.password);
    const id = newId('user');
    const user = {
      id,
      email: parsed.data.email,
      passwordHash,
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
      status: 'ACTIVE' as const,
      createdAt: nowIso(),
    };
    await store.createUser(user);
    const accessToken = signAccessToken(id);
    const refresh = await createRefreshToken(id);
    reply.code(201).send({
      accessToken,
      refreshToken: refresh.token,
      user: publicUser(user),
    });
  });

  app.post('/auth/login', async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues });
      return;
    }
    const user = await getStore().getUserByEmail(parsed.data.email);
    if (!user) {
      reply.code(401).send({ message: 'Invalid credentials' });
      return;
    }
    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) {
      reply.code(401).send({ message: 'Invalid credentials' });
      return;
    }
    const accessToken = signAccessToken(user.id);
    const refresh = await createRefreshToken(user.id);
    reply.code(200).send({
      accessToken,
      refreshToken: refresh.token,
      user: publicUser(user),
    });
  });

  app.post('/auth/refresh', async (req, reply) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues });
      return;
    }
    const rotated = await rotateRefreshToken(parsed.data.refreshToken);
    if (!rotated) {
      reply.code(401).send({ message: 'Invalid refresh token' });
      return;
    }
    reply.code(200).send(rotated);
  });

  app.post('/auth/logout', async (req, reply) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues });
      return;
    }
    if (await isRefreshTokenKnown(parsed.data.refreshToken)) {
      await revokeRefreshToken(parsed.data.refreshToken);
    } else {
      const found = await lookupRefreshToken(parsed.data.refreshToken);
      if (!found) {
        void 0;
      }
    }
    reply.code(200).send({ success: true });
  });

  app.get('/auth/me', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser;
    if (!user) {
      reply.code(401).send({ message: 'Unauthorized' });
      return;
    }
    reply.code(200).send({ user: publicUser(user) });
  });
}
