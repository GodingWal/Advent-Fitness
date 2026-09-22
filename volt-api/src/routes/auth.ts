import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { defaultProfile, newId, nowIso } from '../db/memoryStore';
import { getStore } from '../db/store';
import { hashPassword, verifyPassword } from '../auth/password';
import { publicUser, requireAuth } from '../auth/middleware';
import {
  consumeResetToken,
  consumeVerifyToken,
  isProd,
  issueResetToken,
  issueVerifyToken,
  peekResetToken,
} from '../auth/accountTokens';
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

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

const resetRequestSchema = z.object({
  email: z.string().email(),
});

const resetConfirmSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
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
      reply.code(409).send({
        code: 'EMAIL_TAKEN',
        message: 'An account with this email already exists. Try logging in or reset your password.',
      });
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
      emailVerified: false,
      createdAt: nowIso(),
    };
    await store.createUser(user);
    await store.createProfile(defaultProfile(id));
    const { token: verifyToken } = issueVerifyToken(id);
    if (!isProd()) {
      console.log(`Verification token for ${parsed.data.email}: ${verifyToken}`);
    }
    const accessToken = signAccessToken(id);
    const refresh = await createRefreshToken(id);
    reply.code(201).send({
      accessToken,
      refreshToken: refresh.token,
      user: publicUser(user),
      ...(!isProd() ? { devVerificationToken: verifyToken } : {}),
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

  app.post('/auth/verify-email', async (req, reply) => {
    const parsed = verifyEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues });
      return;
    }
    const res = consumeVerifyToken(parsed.data.token);
    if (res.status === 'invalid') {
      reply.code(404).send({ code: 'INVALID_TOKEN', message: 'Invalid verification token.' });
      return;
    }
    if (res.status === 'expired') {
      reply.code(410).send({ code: 'INVALID_TOKEN', message: 'Verification token has expired.' });
      return;
    }
    const store = getStore();
    const user = await store.getUserById(res.userId as string);
    if (!user) {
      reply.code(404).send({ code: 'INVALID_TOKEN', message: 'Invalid verification token.' });
      return;
    }
    await store.updateUser(user.id, { emailVerified: true });
    reply.code(200).send({ verified: true });
  });

  app.post('/auth/password-reset/request', async (req, reply) => {
    const parsed = resetRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues });
      return;
    }
    // Always 200: never reveal whether the email belongs to an account.
    const user = await getStore().getUserByEmail(parsed.data.email);
    let devResetToken: string | undefined;
    if (user) {
      const issued = issueResetToken(user.id);
      devResetToken = issued.token;
      if (!isProd()) {
        console.log(`Password reset token for ${parsed.data.email}: ${devResetToken}`);
      }
    }
    reply.code(200).send({
      sent: true,
      ...(!isProd() && devResetToken ? { devResetToken } : {}),
    });
  });

  app.post('/auth/password-reset/confirm', async (req, reply) => {
    const parsed = resetConfirmSchema.safeParse(req.body);
    if (!parsed.success) {
      reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues });
      return;
    }
    const res = peekResetToken(parsed.data.token);
    if (res.status === 'invalid') {
      reply.code(404).send({ code: 'INVALID_TOKEN', message: 'Invalid password reset token.' });
      return;
    }
    if (res.status === 'expired') {
      reply.code(410).send({ code: 'INVALID_TOKEN', message: 'Password reset token has expired.' });
      return;
    }
    const store = getStore();
    const user = await store.getUserById(res.userId as string);
    if (!user) {
      consumeResetToken(parsed.data.token);
      reply.code(404).send({ code: 'INVALID_TOKEN', message: 'Invalid password reset token.' });
      return;
    }
    const passwordHash = await hashPassword(parsed.data.newPassword);
    await store.updateUser(user.id, { passwordHash });
    consumeResetToken(parsed.data.token);
    await store.revokeAllRefreshForUser(user.id);
    reply.code(200).send({ success: true });
  });
}
