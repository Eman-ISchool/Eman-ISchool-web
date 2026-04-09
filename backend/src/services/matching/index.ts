import { getRedis } from '../../lib/redis';
import { createRoom, addParticipant } from '../room';
import {
  RedisKeys,
  PUBLIC_ROOM_MIN_PARTICIPANTS,
  PUBLIC_ROOM_MAX_PARTICIPANTS,
  MATCHING_INTERVAL_MS,
  MATCHING_MAX_WAIT_SECONDS,
} from '../../../../shared/constants';
import { RoomType, DrinkType, ParticipantRole } from '../../../../shared/types';
import type { MatchingEntry, Room } from '../../../../shared/types';

let matchingInterval: ReturnType<typeof setInterval> | null = null;

export type MatchCallback = (entries: MatchingEntry[], room: Room) => void;
let onMatchCallback: MatchCallback | null = null;

export function setMatchCallback(cb: MatchCallback): void {
  onMatchCallback = cb;
}

export async function addToQueue(entry: MatchingEntry): Promise<number> {
  const redis = getRedis();
  const key = RedisKeys.matchingQueue(entry.drinkType, entry.topic);

  // Prevent duplicates
  const existing = await redis.lrange(key, 0, -1);
  const alreadyQueued = existing.some((e) => {
    const parsed: MatchingEntry = JSON.parse(e);
    return parsed.sessionId === entry.sessionId;
  });
  if (alreadyQueued) {
    return existing.length;
  }

  await redis.rpush(key, JSON.stringify(entry));
  await redis.expire(key, MATCHING_MAX_WAIT_SECONDS * 2);

  return existing.length + 1;
}

export async function removeFromQueue(sessionId: string, drinkType: string, topic: string): Promise<void> {
  const redis = getRedis();
  const key = RedisKeys.matchingQueue(drinkType, topic);
  const entries = await redis.lrange(key, 0, -1);

  for (const entry of entries) {
    const parsed: MatchingEntry = JSON.parse(entry);
    if (parsed.sessionId === sessionId) {
      await redis.lrem(key, 1, entry);
      break;
    }
  }
}

export async function removeFromAllQueues(sessionId: string): Promise<void> {
  const redis = getRedis();
  const keys = await redis.keys(RedisKeys.matchingQueueAll());

  for (const key of keys) {
    const entries = await redis.lrange(key, 0, -1);
    for (const entry of entries) {
      const parsed: MatchingEntry = JSON.parse(entry);
      if (parsed.sessionId === sessionId) {
        await redis.lrem(key, 1, entry);
      }
    }
  }
}

export async function getQueuePosition(sessionId: string, drinkType: string, topic: string): Promise<number> {
  const redis = getRedis();
  const key = RedisKeys.matchingQueue(drinkType, topic);
  const entries = await redis.lrange(key, 0, -1);

  for (let i = 0; i < entries.length; i++) {
    const parsed: MatchingEntry = JSON.parse(entries[i]);
    if (parsed.sessionId === sessionId) {
      return i + 1;
    }
  }
  return -1;
}

export async function processMatchingQueue(): Promise<void> {
  const redis = getRedis();
  const keys = await redis.keys(RedisKeys.matchingQueueAll());

  for (const key of keys) {
    const entries = await redis.lrange(key, 0, -1);
    if (entries.length < PUBLIC_ROOM_MIN_PARTICIPANTS) continue;

    // Take up to max participants
    const batchSize = Math.min(entries.length, PUBLIC_ROOM_MAX_PARTICIPANTS);
    const batch: MatchingEntry[] = [];

    for (let i = 0; i < batchSize; i++) {
      const raw = await redis.lpop(key);
      if (!raw) break;

      const entry: MatchingEntry = JSON.parse(raw);

      // Check for stale entries
      const waitTime = (Date.now() - new Date(entry.joinedQueueAt).getTime()) / 1000;
      if (waitTime > MATCHING_MAX_WAIT_SECONDS) continue;

      batch.push(entry);
    }

    if (batch.length < PUBLIC_ROOM_MIN_PARTICIPANTS) {
      // Put entries back
      for (const entry of batch) {
        await redis.rpush(key, JSON.stringify(entry));
      }
      continue;
    }

    // Create room for this batch
    const firstEntry = batch[0];
    const room = await createRoom({
      type: RoomType.PUBLIC,
      drinkType: firstEntry.drinkType as DrinkType,
      topic: firstEntry.topic,
      maxParticipants: PUBLIC_ROOM_MAX_PARTICIPANTS,
    });

    // Add all participants
    for (let i = 0; i < batch.length; i++) {
      const entry = batch[i];
      await addParticipant({
        roomId: room.id,
        sessionId: entry.sessionId,
        nickname: entry.nickname,
        avatarColor: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
        role: i === 0 ? ParticipantRole.HOST : ParticipantRole.GUEST,
      });
    }

    if (onMatchCallback) {
      onMatchCallback(batch, room);
    }
  }
}

export function startMatchingLoop(): void {
  if (matchingInterval) return;
  matchingInterval = setInterval(() => {
    processMatchingQueue().catch((err) => {
      console.error('[Matching] Error processing queue:', err);
    });
  }, MATCHING_INTERVAL_MS);
  console.log('[Matching] Loop started');
}

export function stopMatchingLoop(): void {
  if (matchingInterval) {
    clearInterval(matchingInterval);
    matchingInterval = null;
    console.log('[Matching] Loop stopped');
  }
}
