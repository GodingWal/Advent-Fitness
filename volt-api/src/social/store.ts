import { randomUUID } from 'node:crypto';
import type { Activity, ChatMessage, Conversation, Meetup, Post, PostComment } from './types';

// In-memory dev store. When DATABASE_URL is set the same API delegates to
// Prisma models (see schema.prisma + 0003_social). Production must configure
// DATABASE_URL so social data survives restarts.
const activities = new Map<string, Activity>();
const posts = new Map<string, Post>();
const comments = new Map<string, PostComment>();
const reactions = new Set<string>(); // `${postId}:${userId}`
const friendships = new Set<string>(); // sorted `a|b`
const meetups = new Map<string, Meetup>();
const attendees = new Set<string>(); // `${meetupId}:${userId}`
const conversations = new Map<string, Conversation>();
const messages = new Map<string, ChatMessage>();

function prismaEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function prisma(): any {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require('@prisma/client');
  if (!(global as any).__voltSocialPrisma) (global as any).__voltSocialPrisma = new PrismaClient();
  return (global as any).__voltSocialPrisma;
}

export function resetSocial(): void {
  activities.clear(); posts.clear(); comments.clear();
  reactions.clear(); friendships.clear(); meetups.clear();
  attendees.clear(); conversations.clear(); messages.clear();
}

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}
export function nowIso(): string {
  return new Date().toISOString();
}

// ---------- Activities ----------
export async function createActivity(a: Activity): Promise<void> {
  if (!prismaEnabled()) { activities.set(a.id, a); return; }
  const db = prisma();
  await db.activity.create({
    data: {
      id: a.id, userId: a.userId, type: a.type, title: a.title,
      startedAt: new Date(a.startedAt), durationMin: a.durationMin,
      distanceKm: a.distanceKm, calories: a.calories, elevationM: a.elevationM,
      avgPaceSecPerKm: a.avgPaceSecPerKm, notes: a.notes,
    },
  });
}

export async function listActivities(userId: string, q: { type?: string; from?: string; to?: string; search?: string }): Promise<Activity[]> {
  if (!prismaEnabled()) {
    return [...activities.values()]
      .filter((a) => a.userId === userId)
      .filter((a) => (!q.type || a.type === q.type))
      .filter((a) => (!q.from || a.startedAt >= q.from))
      .filter((a) => (!q.to || a.startedAt <= q.to))
      .filter((a) => (!q.search || (a.title + ' ' + (a.notes ?? '')).toLowerCase().includes(q.search.toLowerCase())))
      .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
  }
  const db = prisma();
  const rows = await db.activity.findMany({
    where: {
      userId,
      ...(q.type ? { type: q.type } : {}),
      ...(q.from || q.to ? { startedAt: { ...(q.from ? { gte: new Date(q.from) } : {}), ...(q.to ? { lte: new Date(q.to) } : {}) } } : {}),
      ...(q.search ? { title: { contains: q.search, mode: 'insensitive' } } : {}),
    },
    orderBy: { startedAt: 'desc' },
  });
  return rows.map(toActivity);
}

export async function getActivity(id: string): Promise<Activity | undefined> {
  if (!prismaEnabled()) return activities.get(id);
  const db = prisma();
  const r = await db.activity.findUnique({ where: { id } });
  return r ? toActivity(r) : undefined;
}

export async function updateActivity(id: string, patch: Partial<Activity>): Promise<Activity | undefined> {
  if (!prismaEnabled()) {
    const cur = activities.get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch, id: cur.id, userId: cur.userId };
    activities.set(id, next);
    return next;
  }
  const db = prisma();
  const r = await db.activity.update({
    where: { id },
    data: {
      ...(patch.type ? { type: patch.type } : {}),
      ...(patch.title ? { title: patch.title } : {}),
      ...(patch.startedAt ? { startedAt: new Date(patch.startedAt) } : {}),
      ...(patch.durationMin !== undefined ? { durationMin: patch.durationMin } : {}),
      ...(patch.distanceKm !== undefined ? { distanceKm: patch.distanceKm } : {}),
      ...(patch.calories !== undefined ? { calories: patch.calories } : {}),
      ...(patch.elevationM !== undefined ? { elevationM: patch.elevationM } : {}),
      ...(patch.avgPaceSecPerKm !== undefined ? { avgPaceSecPerKm: patch.avgPaceSecPerKm } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
    },
  });
  return toActivity(r);
}

export async function deleteActivity(id: string): Promise<void> {
  if (!prismaEnabled()) { activities.delete(id); return; }
  await prisma().activity.delete({ where: { id } });
}

function toActivity(r: any): Activity {
  return {
    id: r.id, userId: r.userId, type: r.type, title: r.title,
    startedAt: new Date(r.startedAt).toISOString(), durationMin: r.durationMin,
    distanceKm: r.distanceKm ?? null, calories: r.calories ?? null,
    elevationM: r.elevationM ?? null, avgPaceSecPerKm: r.avgPaceSecPerKm ?? null,
    notes: r.notes ?? null, createdAt: new Date(r.createdAt).toISOString(),
  };
}

// ---------- Feed ----------
export async function createPost(p: Post): Promise<void> {
  if (!prismaEnabled()) { posts.set(p.id, p); return; }
  await prisma().post.create({ data: { id: p.id, userId: p.userId, body: p.body, activityId: p.activityId } });
}

export async function listPosts(viewerId: string): Promise<(Post & { likeCount: number; commentCount: number; likedByMe: boolean })[]> {
  if (!prismaEnabled()) {
    return [...posts.values()]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 100)
      .map((p) => ({
        ...p,
        likeCount: [...reactions].filter((r) => r.startsWith(p.id + ':')).length,
        commentCount: [...comments.values()].filter((c) => c.postId === p.id).length,
        likedByMe: reactions.has(p.id + ':' + viewerId),
      }));
  }
  const db = prisma();
  const rows = await db.post.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { reactions: true, comments: true } });
  return rows.map((r: any) => ({
    id: r.id, userId: r.userId, body: r.body, activityId: r.activityId ?? null, createdAt: new Date(r.createdAt).toISOString(),
    likeCount: r.reactions.length, commentCount: r.comments.length,
    likedByMe: r.reactions.some((x: any) => x.userId === viewerId),
  }));
}

export async function toggleReaction(postId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
  if (!prismaEnabled()) {
    const key = postId + ':' + userId;
    const liked = !reactions.has(key);
    if (liked) reactions.add(key); else reactions.delete(key);
    return { liked, likeCount: [...reactions].filter((r) => r.startsWith(postId + ':')).length };
  }
  const db = prisma();
  const existing = await db.reaction.findUnique({ where: { postId_userId: { postId, userId } } }).catch(() => null);
  let liked = true;
  if (existing) { await db.reaction.delete({ where: { postId_userId: { postId, userId } } }); liked = false; }
  else { await db.reaction.create({ data: { id: newId('rxn'), postId, userId } }); }
  const likeCount = await db.reaction.count({ where: { postId } });
  return { liked, likeCount };
}

export async function listComments(postId: string): Promise<PostComment[]> {
  if (!prismaEnabled()) {
    return [...comments.values()].filter((c) => c.postId === postId).sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  }
  const rows = await prisma().comment.findMany({ where: { postId }, orderBy: { createdAt: 'asc' } });
  return rows.map((r: any) => ({ id: r.id, postId: r.postId, userId: r.userId, body: r.body, createdAt: new Date(r.createdAt).toISOString() }));
}

export async function addComment(c: PostComment): Promise<void> {
  if (!prismaEnabled()) { comments.set(c.id, c); return; }
  await prisma().comment.create({ data: { id: c.id, postId: c.postId, userId: c.userId, body: c.body } });
}

export function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

// ---------- Meetups ----------
export async function createMeetup(m: Meetup): Promise<void> {
  if (!prismaEnabled()) { meetups.set(m.id, m); attendees.add(m.id + ':' + m.organizerId); return; }
  const db = prisma();
  await db.meetup.create({
    data: {
      id: m.id, organizerId: m.organizerId, title: m.title, activityType: m.activityType,
      location: m.location, startsAt: new Date(m.startsAt), capacity: m.capacity, description: m.description,
      attendees: { create: { id: newId('att'), userId: m.organizerId } },
    },
  });
}

export async function listMeetups(q: { activity?: string; search?: string }): Promise<Meetup[]> {
  if (!prismaEnabled()) {
    return [...meetups.values()]
      .filter((m) => (!q.activity || m.activityType === q.activity))
      .filter((m) => (!q.search || (m.title + ' ' + m.location).toLowerCase().includes(q.search.toLowerCase())))
      .sort((a, b) => (a.startsAt < b.startsAt ? -1 : 1));
  }
  const rows = await prisma().meetup.findMany({
    where: { ...(q.activity ? { activityType: q.activity } : {}), ...(q.search ? { title: { contains: q.search, mode: 'insensitive' } } : {}) },
    orderBy: { startsAt: 'asc' },
  });
  return rows.map(toMeetup);
}

export async function getMeetup(id: string): Promise<Meetup | undefined> {
  if (!prismaEnabled()) return meetups.get(id);
  const r = await prisma().meetup.findUnique({ where: { id } });
  return r ? toMeetup(r) : undefined;
}

export async function attendeeCount(meetupId: string): Promise<number> {
  if (!prismaEnabled()) return [...attendees].filter((k) => k.startsWith(meetupId + ':')).length;
  return prisma().meetupAttendee.count({ where: { meetupId } });
}

export async function isAttending(meetupId: string, userId: string): Promise<boolean> {
  if (!prismaEnabled()) return attendees.has(meetupId + ':' + userId);
  const r = await prisma().meetupAttendee.findFirst({ where: { meetupId, userId } });
  return Boolean(r);
}

export async function joinMeetup(meetupId: string, userId: string): Promise<void> {
  if (!prismaEnabled()) { attendees.add(meetupId + ':' + userId); return; }
  await prisma().meetupAttendee.upsert({
    where: { meetupId_userId: { meetupId, userId } },
    update: {},
    create: { id: newId('att'), meetupId, userId },
  });
}

export async function leaveMeetup(meetupId: string, userId: string): Promise<void> {
  if (!prismaEnabled()) { attendees.delete(meetupId + ':' + userId); return; }
  await prisma().meetupAttendee.deleteMany({ where: { meetupId, userId } });
}

function toMeetup(r: any): Meetup {
  return {
    id: r.id, organizerId: r.organizerId, title: r.title, activityType: r.activityType,
    location: r.location, startsAt: new Date(r.startsAt).toISOString(), capacity: r.capacity,
    description: r.description ?? '', createdAt: new Date(r.createdAt).toISOString(),
  };
}

// ---------- Messaging (polling transport; WS/SSE later behind same service) ----------
export async function listConversations(userId: string): Promise<(Conversation & { lastMessage: string })[]> {
  if (!prismaEnabled()) {
    const mine = [...conversations.values()].filter((c) => c.memberIds.includes(userId));
    return mine.map((c) => {
      const ms = [...messages.values()].filter((m) => m.conversationId === c.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      return { ...c, lastMessage: ms[0]?.body ?? '' };
    });
  }
  const db = prisma();
  const rows = await db.conversation.findMany({ where: { members: { some: { userId } } }, include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } } });
  return rows.map((r: any) => ({ id: r.id, memberIds: [], createdAt: new Date(r.createdAt).toISOString(), lastMessage: r.messages[0]?.body ?? '' }));
}

export async function createConversation(memberIds: string[]): Promise<Conversation> {
  const c: Conversation = { id: newId('conv'), memberIds, createdAt: nowIso() };
  if (!prismaEnabled()) { conversations.set(c.id, c); return c; }
  const db = prisma();
  const r = await db.conversation.create({ data: { id: c.id, members: { create: memberIds.map((userId) => ({ id: newId('cm'), userId })) } } });
  return { id: r.id, memberIds, createdAt: new Date(r.createdAt).toISOString() };
}

export async function listMessages(conversationId: string): Promise<ChatMessage[]> {
  if (!prismaEnabled()) {
    return [...messages.values()].filter((m) => m.conversationId === conversationId).sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  }
  const rows = await prisma().chatMessage.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' } });
  return rows.map((r: any) => ({ id: r.id, conversationId: r.conversationId, senderId: r.senderId, body: r.body, createdAt: new Date(r.createdAt).toISOString() }));
}

export async function sendMessage(m: ChatMessage): Promise<void> {
  if (!prismaEnabled()) { messages.set(m.id, m); return; }
  await prisma().chatMessage.create({ data: { id: m.id, conversationId: m.conversationId, senderId: m.senderId, body: m.body } });
}

export async function getConversation(id: string): Promise<Conversation | undefined> {
  if (!prismaEnabled()) return conversations.get(id);
  const r = await prisma().conversation.findUnique({ where: { id }, include: { members: true } });
  return r ? { id: r.id, memberIds: r.members.map((x: any) => x.userId), createdAt: new Date(r.createdAt).toISOString() } : undefined;
}

export { friendships };
