import { AuthorizeError } from './errors';

const perDoorAttempts = new Map<string, number[]>();
const perUserAttempts = new Map<string, number[]>();
const perUserFailures = new Map<string, number[]>();

const DOOR_WINDOW_MS = 3000;
const USER_WINDOW_MS = 60 * 1000;
const FAILED_WINDOW_MS = 60 * 60 * 1000;
const USER_LIMIT = 10;
const FAILED_LIMIT = 30;

function prune(list: number[], windowMs: number, now: number): number[] {
  return list.filter((t) => now - t < windowMs);
}

export function checkDoorAccessRateLimit(userId: string, doorId: string, now = Date.now()): void {
  const doorKey = `${userId}:${doorId}`;
  const doorList = prune(perDoorAttempts.get(doorKey) ?? [], DOOR_WINDOW_MS, now);
  if (doorList.length >= 1) {
    throw new AuthorizeError('RATE_LIMITED', 'Too many requests. Slow down and try again.', 429);
  }
  const userList = prune(perUserAttempts.get(userId) ?? [], USER_WINDOW_MS, now);
  if (userList.length >= USER_LIMIT) {
    throw new AuthorizeError('RATE_LIMITED', 'Too many requests. Slow down and try again.', 429);
  }
  const failedList = prune(perUserFailures.get(userId) ?? [], FAILED_WINDOW_MS, now);
  if (failedList.length >= FAILED_LIMIT) {
    throw new AuthorizeError('RATE_LIMITED', 'Too many requests. Slow down and try again.', 429);
  }
  doorList.push(now);
  perDoorAttempts.set(doorKey, doorList);
  userList.push(now);
  perUserAttempts.set(userId, userList);
}

export function recordDoorAccessFailure(userId: string, now = Date.now()): void {
  const list = prune(perUserFailures.get(userId) ?? [], FAILED_WINDOW_MS, now);
  list.push(now);
  perUserFailures.set(userId, list);
}

export function resetRateLimits(): void {
  perDoorAttempts.clear();
  perUserAttempts.clear();
  perUserFailures.clear();
}
