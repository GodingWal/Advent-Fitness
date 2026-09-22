import type { FastifyReply, FastifyRequest } from 'fastify';
import { users } from '../db/memoryStore';
import type { User } from '../db/types';
import { verifyAccessToken } from './tokens';

export interface AuthenticatedRequestUser {
  id: string;
  email: string;
  name: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: User;
  }
}

export function getBearerToken(req: FastifyRequest): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export function publicUser(u: User): {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  status: string;
  createdAt: string;
} {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone ?? null,
    status: u.status,
    createdAt: u.createdAt,
  };
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const token = getBearerToken(req);
  if (!token) {
    reply.code(401).send({ message: 'Unauthorized' });
    return;
  }
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    reply.code(401).send({ message: 'Unauthorized' });
    return;
  }
  const user = users.get(decoded.sub);
  if (!user) {
    reply.code(401).send({ message: 'Unauthorized' });
    return;
  }
  req.authUser = user;
}
