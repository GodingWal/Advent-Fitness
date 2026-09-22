import type { FastifyInstance } from 'fastify';
import { getStore } from '../db/store';
import { requireAuth } from '../auth/middleware';

export async function registerGymRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/memberships', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser;
    if (!user) {
      reply.code(401).send({ message: 'Unauthorized' });
      return;
    }
    const store = getStore();
    const mine = await store.listMembershipsByUser(user.id);
    const list = await Promise.all(
      mine.map(async (m) => {
        const gym = await store.getGym(m.gymId);
        return {
          id: m.id,
          userId: m.userId,
          gym: { id: m.gymId, name: gym ? gym.name : 'Unknown' },
          locationIds: m.locationIds,
          status: m.status,
          membershipType: m.membershipType,
          startsAt: m.startsAt,
          expiresAt: m.expiresAt,
          accessLevel: m.accessLevel,
        };
      })
    );
    reply.code(200).send({ memberships: list });
  });

  app.get('/v1/gyms/:gymId', { preHandler: requireAuth }, async (req, reply) => {
    const { gymId } = req.params as { gymId: string };
    const gym = await getStore().getGym(gymId);
    if (!gym) {
      reply.code(404).send({ message: 'Gym not found' });
      return;
    }
    reply.code(200).send({ gym: { id: gym.id, name: gym.name, status: gym.status } });
  });

  app.get('/v1/gyms/:gymId/locations', { preHandler: requireAuth }, async (req, reply) => {
    const { gymId } = req.params as { gymId: string };
    const store = getStore();
    const gym = await store.getGym(gymId);
    if (!gym) {
      reply.code(404).send({ message: 'Gym not found' });
      return;
    }
    const rows = await store.listLocationsByGym(gymId);
    const list = rows.map((l) => ({
      id: l.id,
      gymId: l.gymId,
      name: l.name,
      address: l.address,
      latitude: l.latitude,
      longitude: l.longitude,
      timezone: l.timezone,
      status: l.status,
    }));
    reply.code(200).send({ locations: list });
  });

  app.get('/v1/locations/:locationId/doors', { preHandler: requireAuth }, async (req, reply) => {
    const { locationId } = req.params as { locationId: string };
    const store = getStore();
    const location = await store.getLocation(locationId);
    if (!location) {
      reply.code(404).send({ message: 'Location not found' });
      return;
    }
    const rows = await store.listDoorsByLocation(locationId);
    const list = rows.map((d) => ({
      id: d.id,
      locationId: d.locationId,
      name: d.name,
      provider: d.provider,
      enabled: d.enabled,
      requiresProximity: d.requiresProximity,
      status: d.status,
      accessHours: d.accessHours,
    }));
    reply.code(200).send({ doors: list });
  });
}
