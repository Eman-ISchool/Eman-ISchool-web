import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrinkType, RoomType, ParticipantRole } from '@shared/types';
import {
  PUBLIC_ROOM_MIN_PARTICIPANTS,
  PUBLIC_ROOM_MAX_PARTICIPANTS,
  MATCHING_MAX_WAIT_SECONDS,
} from '@shared/constants';

// ── Hoisted mocks ──────────────────────────────────────────────────
const { mockRedis, mockPrisma } = vi.hoisted(() => ({
  mockRedis: {
    lrange: vi.fn(),
    rpush: vi.fn(),
    expire: vi.fn(),
    lpop: vi.fn(),
    lrem: vi.fn(),
    keys: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    sadd: vi.fn(),
    srem: vi.fn(),
    del: vi.fn(),
    hset: vi.fn(),
    hget: vi.fn(),
    hgetall: vi.fn(),
    hdel: vi.fn(),
    pipeline: vi.fn(() => ({ hset: vi.fn(), exec: vi.fn() })),
  },
  mockPrisma: {
    room: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    roomParticipant: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    guestSession: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../../src/lib/redis', () => ({
  getRedis: () => mockRedis,
  default: () => mockRedis,
}));

vi.mock('../../src/lib/prisma', () => ({ default: mockPrisma, prisma: mockPrisma }));

vi.mock('../../src/config', () => ({
  config: {
    jwt: { secret: 'test-secret', expiresIn: '24h' },
    openai: { enabled: false, apiKey: '' },
    redis: { url: 'redis://localhost:6379' },
    database: { url: 'postgresql://localhost/test' },
    port: 3001,
    nodeEnv: 'test',
    isProduction: false,
    cors: { origin: 'http://localhost:3000' },
  },
}));

import {
  addToQueue,
  removeFromQueue,
  processMatchingQueue,
  getQueuePosition,
} from '../../src/services/matching';

describe('Matching Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── addToQueue ─────────────────────────────────────────────────

  describe('addToQueue', () => {
    it('should add a new entry to the queue and return new queue size', async () => {
      mockRedis.lrange.mockResolvedValue([]);
      mockRedis.rpush.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const entry = {
        sessionId: 'sess-1',
        nickname: 'Alice',
        drinkType: DrinkType.COFFEE,
        topic: 'Technology & Innovation',
        joinedQueueAt: new Date().toISOString(),
      };

      const position = await addToQueue(entry);

      expect(mockRedis.rpush).toHaveBeenCalledOnce();
      expect(mockRedis.expire).toHaveBeenCalledOnce();
      expect(position).toBe(1);
    });

    it('should prevent duplicate entries for the same session', async () => {
      const existingEntry = JSON.stringify({
        sessionId: 'sess-1',
        nickname: 'Alice',
        drinkType: DrinkType.COFFEE,
        topic: 'Tech',
        joinedQueueAt: new Date().toISOString(),
      });
      mockRedis.lrange.mockResolvedValue([existingEntry]);

      const entry = {
        sessionId: 'sess-1',
        nickname: 'Alice',
        drinkType: DrinkType.COFFEE,
        topic: 'Tech',
        joinedQueueAt: new Date().toISOString(),
      };

      const position = await addToQueue(entry);

      expect(mockRedis.rpush).not.toHaveBeenCalled();
      expect(position).toBe(1);
    });

    it('should allow different sessions to be in the same queue', async () => {
      const existingEntry = JSON.stringify({
        sessionId: 'sess-1',
        nickname: 'Alice',
        drinkType: DrinkType.COFFEE,
        topic: 'Tech',
        joinedQueueAt: new Date().toISOString(),
      });
      mockRedis.lrange.mockResolvedValue([existingEntry]);
      mockRedis.rpush.mockResolvedValue(2);
      mockRedis.expire.mockResolvedValue(1);

      const entry = {
        sessionId: 'sess-2',
        nickname: 'Bob',
        drinkType: DrinkType.COFFEE,
        topic: 'Tech',
        joinedQueueAt: new Date().toISOString(),
      };

      const position = await addToQueue(entry);

      expect(mockRedis.rpush).toHaveBeenCalledOnce();
      expect(position).toBe(2);
    });

    it('should set expiry on the queue key', async () => {
      mockRedis.lrange.mockResolvedValue([]);
      mockRedis.rpush.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const entry = {
        sessionId: 'sess-3',
        nickname: 'Charlie',
        drinkType: DrinkType.TEA,
        topic: 'Travel & Culture',
        joinedQueueAt: new Date().toISOString(),
      };

      await addToQueue(entry);

      expect(mockRedis.expire).toHaveBeenCalledWith(
        expect.any(String),
        MATCHING_MAX_WAIT_SECONDS * 2,
      );
    });
  });

  // ── removeFromQueue ────────────────────────────────────────────

  describe('removeFromQueue', () => {
    it('should remove a session from the queue', async () => {
      const entry = JSON.stringify({
        sessionId: 'sess-1',
        nickname: 'Alice',
        drinkType: 'coffee',
        topic: 'Tech',
        joinedQueueAt: new Date().toISOString(),
      });
      mockRedis.lrange.mockResolvedValue([entry]);
      mockRedis.lrem.mockResolvedValue(1);

      await removeFromQueue('sess-1', 'coffee', 'Tech');

      expect(mockRedis.lrem).toHaveBeenCalledWith(expect.any(String), 1, entry);
    });

    it('should do nothing if session is not in queue', async () => {
      mockRedis.lrange.mockResolvedValue([]);

      await removeFromQueue('sess-nonexistent', 'coffee', 'Tech');

      expect(mockRedis.lrem).not.toHaveBeenCalled();
    });
  });

  // ── getQueuePosition ──────────────────────────────────────────

  describe('getQueuePosition', () => {
    it('should return 1-based position for first entry', async () => {
      const entries = [
        JSON.stringify({ sessionId: 'sess-1', nickname: 'Alice', drinkType: 'coffee', topic: 'Tech', joinedQueueAt: new Date().toISOString() }),
        JSON.stringify({ sessionId: 'sess-2', nickname: 'Bob', drinkType: 'coffee', topic: 'Tech', joinedQueueAt: new Date().toISOString() }),
      ];
      mockRedis.lrange.mockResolvedValue(entries);

      const pos = await getQueuePosition('sess-1', 'coffee', 'Tech');
      expect(pos).toBe(1);
    });

    it('should return correct position for later entries', async () => {
      const entries = [
        JSON.stringify({ sessionId: 'sess-1', nickname: 'Alice', drinkType: 'coffee', topic: 'Tech', joinedQueueAt: new Date().toISOString() }),
        JSON.stringify({ sessionId: 'sess-2', nickname: 'Bob', drinkType: 'coffee', topic: 'Tech', joinedQueueAt: new Date().toISOString() }),
        JSON.stringify({ sessionId: 'sess-3', nickname: 'Charlie', drinkType: 'coffee', topic: 'Tech', joinedQueueAt: new Date().toISOString() }),
      ];
      mockRedis.lrange.mockResolvedValue(entries);

      const pos = await getQueuePosition('sess-3', 'coffee', 'Tech');
      expect(pos).toBe(3);
    });

    it('should return -1 when session is not in queue', async () => {
      mockRedis.lrange.mockResolvedValue([]);

      const pos = await getQueuePosition('sess-missing', 'coffee', 'Tech');
      expect(pos).toBe(-1);
    });
  });

  // ── processMatchingQueue ──────────────────────────────────────

  describe('processMatchingQueue', () => {
    it('should not match when fewer than minimum participants', async () => {
      const entries = [
        JSON.stringify({
          sessionId: 'sess-1',
          nickname: 'Alice',
          drinkType: 'coffee',
          topic: 'Tech',
          joinedQueueAt: new Date().toISOString(),
        }),
      ];
      mockRedis.keys.mockResolvedValue(['coffee:queue:coffee:Tech']);
      mockRedis.lrange.mockResolvedValue(entries);

      await processMatchingQueue();

      expect(mockPrisma.room.create).not.toHaveBeenCalled();
    });

    it('should create room and add participants when enough are in queue', async () => {
      const now = new Date().toISOString();
      const entries = [];
      for (let i = 0; i < PUBLIC_ROOM_MIN_PARTICIPANTS; i++) {
        entries.push(
          JSON.stringify({
            sessionId: `sess-${i}`,
            nickname: `User${i}`,
            drinkType: 'coffee',
            topic: 'Tech',
            joinedQueueAt: now,
          }),
        );
      }

      mockRedis.keys.mockResolvedValue(['coffee:queue:coffee:Tech']);
      mockRedis.lrange.mockResolvedValue(entries);

      let popIndex = 0;
      mockRedis.lpop.mockImplementation(() => {
        return Promise.resolve(entries[popIndex++] ?? null);
      });

      const fakeRoom = {
        id: 'room-1',
        type: 'PUBLIC',
        status: 'ACTIVE',
        drinkType: 'COFFEE',
        topic: 'Tech',
        inviteCode: null,
        maxParticipants: PUBLIC_ROOM_MAX_PARTICIPANTS,
        createdAt: new Date(),
        closedAt: null,
      };
      mockPrisma.room.create.mockResolvedValue(fakeRoom);

      mockPrisma.roomParticipant.findFirst.mockResolvedValue(null);
      mockPrisma.roomParticipant.count.mockResolvedValue(0);
      mockRedis.get.mockResolvedValue(JSON.stringify({
        id: 'room-1',
        type: 'public',
        status: 'active',
        drinkType: 'coffee',
        topic: 'Tech',
        inviteCode: null,
        maxParticipants: PUBLIC_ROOM_MAX_PARTICIPANTS,
        createdAt: new Date().toISOString(),
        closedAt: null,
      }));

      let participantCounter = 0;
      mockPrisma.roomParticipant.create.mockImplementation(({ data }: any) => {
        participantCounter++;
        return Promise.resolve({
          id: `participant-${participantCounter}`,
          sessionId: data.sessionId,
          roomId: data.roomId,
          nickname: data.nickname,
          avatarColor: data.avatarColor,
          role: data.role,
          isMuted: false,
          joinedAt: new Date(),
          leftAt: null,
        });
      });

      await processMatchingQueue();

      expect(mockPrisma.room.create).toHaveBeenCalledOnce();
      expect(mockPrisma.roomParticipant.create).toHaveBeenCalledTimes(PUBLIC_ROOM_MIN_PARTICIPANTS);
    });

    it('should skip stale entries that exceeded max wait time', async () => {
      const staleTime = new Date(Date.now() - (MATCHING_MAX_WAIT_SECONDS + 10) * 1000).toISOString();
      const freshTime = new Date().toISOString();

      const entries = [
        JSON.stringify({ sessionId: 'sess-stale', nickname: 'Stale', drinkType: 'coffee', topic: 'Tech', joinedQueueAt: staleTime }),
        JSON.stringify({ sessionId: 'sess-fresh-1', nickname: 'Fresh1', drinkType: 'coffee', topic: 'Tech', joinedQueueAt: freshTime }),
        JSON.stringify({ sessionId: 'sess-fresh-2', nickname: 'Fresh2', drinkType: 'coffee', topic: 'Tech', joinedQueueAt: freshTime }),
      ];

      mockRedis.keys.mockResolvedValue(['coffee:queue:coffee:Tech']);
      mockRedis.lrange.mockResolvedValue(entries);

      let popIndex = 0;
      mockRedis.lpop.mockImplementation(() => Promise.resolve(entries[popIndex++] ?? null));

      await processMatchingQueue();

      expect(mockPrisma.room.create).not.toHaveBeenCalled();
      expect(mockRedis.rpush).toHaveBeenCalled();
    });

    it('should cap batch at PUBLIC_ROOM_MAX_PARTICIPANTS', async () => {
      const now = new Date().toISOString();
      const entries = [];
      for (let i = 0; i < PUBLIC_ROOM_MAX_PARTICIPANTS + 3; i++) {
        entries.push(
          JSON.stringify({
            sessionId: `sess-${i}`,
            nickname: `User${i}`,
            drinkType: 'coffee',
            topic: 'Tech',
            joinedQueueAt: now,
          }),
        );
      }

      mockRedis.keys.mockResolvedValue(['coffee:queue:coffee:Tech']);
      mockRedis.lrange.mockResolvedValue(entries);

      let popIndex = 0;
      mockRedis.lpop.mockImplementation(() => Promise.resolve(entries[popIndex++] ?? null));

      const fakeRoom = {
        id: 'room-capped',
        type: 'PUBLIC',
        status: 'ACTIVE',
        drinkType: 'COFFEE',
        topic: 'Tech',
        inviteCode: null,
        maxParticipants: PUBLIC_ROOM_MAX_PARTICIPANTS,
        createdAt: new Date(),
        closedAt: null,
      };
      mockPrisma.room.create.mockResolvedValue(fakeRoom);
      mockPrisma.roomParticipant.findFirst.mockResolvedValue(null);
      mockPrisma.roomParticipant.count.mockResolvedValue(0);
      mockRedis.get.mockResolvedValue(JSON.stringify({
        id: 'room-capped',
        type: 'public',
        status: 'active',
        drinkType: 'coffee',
        topic: 'Tech',
        inviteCode: null,
        maxParticipants: PUBLIC_ROOM_MAX_PARTICIPANTS,
        createdAt: now,
        closedAt: null,
      }));

      let participantCounter = 0;
      mockPrisma.roomParticipant.create.mockImplementation(({ data }: any) => {
        participantCounter++;
        return Promise.resolve({
          id: `p-${participantCounter}`,
          sessionId: data.sessionId,
          roomId: data.roomId,
          nickname: data.nickname,
          avatarColor: data.avatarColor,
          role: data.role,
          isMuted: false,
          joinedAt: new Date(),
          leftAt: null,
        });
      });

      await processMatchingQueue();

      expect(mockPrisma.roomParticipant.create).toHaveBeenCalledTimes(PUBLIC_ROOM_MAX_PARTICIPANTS);
      expect(mockRedis.lpop).toHaveBeenCalledTimes(PUBLIC_ROOM_MAX_PARTICIPANTS);
    });

    it('should handle empty queue gracefully', async () => {
      mockRedis.keys.mockResolvedValue([]);

      await processMatchingQueue();

      expect(mockPrisma.room.create).not.toHaveBeenCalled();
    });
  });
});
