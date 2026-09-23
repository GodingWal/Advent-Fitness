import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../auth/middleware';
import { getStore } from '../db/store';
import {
  addComment, attendeeCount, createActivity, createConversation, createMeetup, createPost,
  deleteActivity, getActivity, getConversation, getMeetup, isAttending, joinMeetup,
  leaveMeetup, listActivities, listComments, listConversations, listMeetups, listMessages,
  listPosts, newId, nowIso, sendMessage, toggleReaction,
} from '../social/store';

async function displayName(userId: string): Promise<string> {
  const u = await getStore().getUserById(userId);
  return u?.name ?? 'Member';
}

export async function registerSocialRoutes(app: FastifyInstance): Promise<void> {
  // ----- Activities -----
  const activityInput = z.object({
    type: z.string().min(1).max(40),
    title: z.string().min(1).max(120),
    startedAt: z.string().min(1),
    durationMin: z.number().int().min(1).max(1440),
    distanceKm: z.number().min(0).max(1000).nullable().optional(),
    calories: z.number().min(0).max(20000).nullable().optional(),
    elevationM: z.number().min(0).max(20000).nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
  });

  app.get('/v1/activities', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const q = req.query as Record<string, string>;
    const rows = await listActivities(user.id, { type: q.type, from: q.from, to: q.to, search: q.search });
    reply.send({ activities: rows });
  });

  app.post('/v1/activities', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const parsed = activityInput.safeParse(req.body);
    if (!parsed.success) { reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues }); return; }
    const d = parsed.data;
    const distKm = d.distanceKm ?? null;
    const pace = distKm && distKm > 0 ? (d.durationMin * 60) / distKm : null;
    const a = {
      id: newId('act'), userId: user.id, type: d.type, title: d.title,
      startedAt: new Date(d.startedAt).toISOString(), durationMin: d.durationMin,
      distanceKm: distKm, calories: d.calories ?? null, elevationM: d.elevationM ?? null,
      avgPaceSecPerKm: pace, notes: d.notes ?? null, createdAt: nowIso(),
    };
    await createActivity(a);
    reply.code(201).send({ activity: a });
  });

  app.get('/v1/activities/:id', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const { id } = req.params as { id: string };
    const a = await getActivity(id);
    if (!a || a.userId !== user.id) { reply.code(404).send({ message: 'Activity not found' }); return; }
    reply.send({ activity: a });
  });

  app.put('/v1/activities/:id', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const { id } = req.params as { id: string };
    const a = await getActivity(id);
    if (!a || a.userId !== user.id) { reply.code(404).send({ message: 'Activity not found' }); return; }
    const parsed = activityInput.partial().safeParse(req.body ?? {});
    if (!parsed.success) { reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues }); return; }
    const next = await updateActivitySafe(id, parsed.data);
    reply.send({ activity: next });
  });

  app.delete('/v1/activities/:id', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const { id } = req.params as { id: string };
    const a = await getActivity(id);
    if (!a || a.userId !== user.id) { reply.code(404).send({ message: 'Activity not found' }); return; }
    await deleteActivity(id);
    reply.send({ success: true });
  });

  // ----- Feed -----
  app.get('/v1/feed', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const rows = await listPosts(user.id);
    const out = await Promise.all(rows.map(async (p) => ({ ...p, authorName: await displayName(p.userId) })));
    reply.send({ posts: out });
  });

  app.post('/v1/feed', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const parsed = z.object({ body: z.string().min(1).max(2000), activityId: z.string().nullable().optional() }).safeParse(req.body);
    if (!parsed.success) { reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues }); return; }
    const p = { id: newId('post'), userId: user.id, body: parsed.data.body, activityId: parsed.data.activityId ?? null, createdAt: nowIso() };
    await createPost(p);
    reply.code(201).send({ post: { ...p, authorName: user.name, likeCount: 0, commentCount: 0, likedByMe: false } });
  });

  app.post('/v1/feed/:id/reactions', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const { id } = req.params as { id: string };
    reply.send(await toggleReaction(id, user.id));
  });

  app.get('/v1/feed/:id/comments', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const rows = await listComments(id);
    const out = await Promise.all(rows.map(async (c) => ({ ...c, authorName: await displayName(c.userId) })));
    reply.send({ comments: out });
  });

  app.post('/v1/feed/:id/comments', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const { id } = req.params as { id: string };
    const parsed = z.object({ body: z.string().min(1).max(1000) }).safeParse(req.body);
    if (!parsed.success) { reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues }); return; }
    const c = { id: newId('cmt'), postId: id, userId: user.id, body: parsed.data.body, createdAt: nowIso() };
    await addComment(c);
    reply.code(201).send({ comment: { ...c, authorName: user.name } });
  });

  // ----- Meetups -----
  const meetupInput = z.object({
    title: z.string().min(1).max(120),
    activityType: z.string().min(1).max(40),
    location: z.string().min(1).max(200),
    startsAt: z.string().min(1),
    capacity: z.number().int().min(2).max(500),
    description: z.string().max(2000).optional(),
  });

  app.get('/v1/meetups', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const q = req.query as Record<string, string>;
    const rows = await listMeetups({ activity: q.activity, search: q.search });
    const out = await Promise.all(rows.map(async (m) => ({
      ...m,
      attendeeCount: await attendeeCount(m.id),
      joined: await isAttending(m.id, user.id),
      organizerName: await displayName(m.organizerId),
    })));
    reply.send({ meetups: out });
  });

  app.post('/v1/meetups', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const parsed = meetupInput.safeParse(req.body);
    if (!parsed.success) { reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues }); return; }
    const d = parsed.data;
    const m = {
      id: newId('meet'), organizerId: user.id, title: d.title, activityType: d.activityType,
      location: d.location, startsAt: new Date(d.startsAt).toISOString(), capacity: d.capacity,
      description: d.description ?? '', createdAt: nowIso(),
    };
    await createMeetup(m);
    reply.code(201).send({ meetup: { ...m, attendeeCount: 1, joined: true, organizerName: user.name } });
  });

  app.get('/v1/meetups/:id', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const { id } = req.params as { id: string };
    const m = await getMeetup(id);
    if (!m) { reply.code(404).send({ message: 'Meetup not found' }); return; }
    reply.send({
      meetup: {
        ...m, attendeeCount: await attendeeCount(m.id),
        joined: await isAttending(m.id, user.id), organizerName: await displayName(m.organizerId),
      },
    });
  });

  app.post('/v1/meetups/:id/join', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const { id } = req.params as { id: string };
    const m = await getMeetup(id);
    if (!m) { reply.code(404).send({ message: 'Meetup not found' }); return; }
    await joinMeetup(id, user.id);
    reply.send({ joined: true, attendeeCount: await attendeeCount(id) });
  });

  app.post('/v1/meetups/:id/leave', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const { id } = req.params as { id: string };
    await leaveMeetup(id, user.id);
    reply.send({ joined: false, attendeeCount: await attendeeCount(id) });
  });

  // ----- Messaging -----
  app.get('/v1/conversations', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const rows = await listConversations(user.id);
    const out = await Promise.all(rows.map(async (c) => {
      const other = c.memberIds.find((x) => x !== user.id);
      return {
        id: c.id, peerName: other ? await displayName(other) : 'Group',
        lastMessage: c.lastMessage, unread: 0, updatedAt: c.createdAt,
      };
    }));
    reply.send({ conversations: out });
  });

  app.post('/v1/conversations', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const parsed = z.object({ memberIds: z.array(z.string()).min(1).max(10) }).safeParse(req.body);
    if (!parsed.success) { reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues }); return; }
    const members = [...new Set([user.id, ...parsed.data.memberIds])];
    const c = await createConversation(members);
    reply.code(201).send({ conversation: c });
  });

  app.get('/v1/conversations/:id/messages', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const { id } = req.params as { id: string };
    const c = await getConversation(id);
    if (!c || !c.memberIds.includes(user.id)) { reply.code(404).send({ message: 'Conversation not found' }); return; }
    const rows = await listMessages(id);
    reply.send({
      messages: rows.map((m) => ({
        id: m.id, conversationId: m.conversationId,
        sender: m.senderId === user.id ? 'Me' : 'Member',
        body: m.body, createdAt: m.createdAt,
      })),
    });
  });

  app.post('/v1/conversations/:id/messages', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!;
    const { id } = req.params as { id: string };
    const c = await getConversation(id);
    if (!c || !c.memberIds.includes(user.id)) { reply.code(404).send({ message: 'Conversation not found' }); return; }
    const parsed = z.object({ body: z.string().min(1).max(2000) }).safeParse(req.body);
    if (!parsed.success) { reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues }); return; }
    const m = { id: newId('msg'), conversationId: id, senderId: user.id, body: parsed.data.body, createdAt: nowIso() };
    await sendMessage(m);
    reply.code(201).send({ message: { id: m.id, conversationId: id, sender: 'Me', body: m.body, createdAt: m.createdAt } });
  });
}

async function updateActivitySafe(id: string, patch: Record<string, unknown>) {
  const { getActivity, updateActivity } = await import('../social/store');
  const cur = await getActivity(id);
  if (!cur) return undefined;
  return updateActivity(id, patch as never);
}
