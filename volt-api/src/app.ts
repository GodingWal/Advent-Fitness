import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { registerAuthRoutes } from './routes/auth';
import { registerGymRoutes } from './routes/gyms';
import { registerAccessRoutes } from './routes/access';
import { registerKisiWebhook } from './webhooks/kisi';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  app.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (req: unknown, body: unknown, done: (err: Error | null, result?: unknown) => void) => {
      const raw = typeof body === 'string' ? body : '';
      ((req as Record<string, unknown>).rawBody as unknown) = raw;
      if (!raw) {
        done(null, {});
        return;
      }
      try {
        done(null, JSON.parse(raw));
      } catch (err) {
        done(err as Error);
      }
    }
  );

  app.get('/health', async () => ({ ok: true }));

  await registerAuthRoutes(app);
  await registerGymRoutes(app);
  await registerAccessRoutes(app);
  await registerKisiWebhook(app);

  return app;
}
