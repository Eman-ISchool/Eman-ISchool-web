import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoomType, RoomStatus, DrinkType, ParticipantRole, ParticipantStatus } from '@shared/types';
import {
  PUBLIC_ROOM_MAX_PARTICIPANTS,
  INVITE_CODE_LENGTH,
  INVITE_CODE_CHARSET,
} from '@shared/constants';

// ── Hoisted mocks ──────────────────────────────────────────────────
const { mockRedis, mockPrisma } = vi.hoisted(() => ({
  mockRedis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    sadd: vi.fn(),
    srem: vi.fn(),
    hset: vi.fn(),
    hget: vi.fn(),
    hgetall: vi.fn(),
    hdel: vi.fn(),
    pipeline: vi.fn(() => ({ hset: vi.fn(), exec: vi.fn().mockResolvedValue([]) })),
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
  createRoom,
  getRoom,
  addParticipant,
  removeParticipant,
  getRoomParticipants,
  closeRoom,
  getRoomByInviteCode,
  activateRoom,
} from '../../src/services/room';

describe('Room Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── createRoom ─────────────────────────────────────────────────

  describe('createRoom', () => {
    it('should create a public room without invite code', async () => {
      const now = new Date();
      mockPrisma.room.create.mockResolvedValue({
        id: 'room-pub-1',
        type: 'PUBLIC',
        status: 'ACTIVE',
        drinkType: 'COFFEE',
        topic: 'Technology',
        inviteCode: null,
        maxParticipants: 6,
        createdAt: now,
        closedAt: null,
      });

      const room = await createRoom({
        type: RoomType.PUBLIC,
        drinkType: DrinkType.COFFEE,
        topic: 'Technology',
        maxParticipants: 6,
      });

      expect(room.type).toBe(RoomType.PUBLIC);
      expect(room.status).toBe(RoomStatus.ACTIVE);
      expect(room.inviteCode).toBeNull();
      expect(room.drinkType).toBe(DrinkType.COFFEE);
      expect(room.topic).toBe('Technology');
    });

    it('should create a private room with invite code and WAITING status', async () => {
      const now = new Date();
      mockPrisma.room.create.mockImplementation(async ({ data }: any) => ({
        id: 'room-priv-1',
        type: data.type,
        status: data.status,
        drinkType: data.drinkType,
        topic: data.topic,
        inviteCode: data.inviteCode,
        maxParticipants: data.maxParticipants,
        createdAt: now,
        closedAt: null,
      }));

      const room = await createRoom({
        type: RoomType.PRIVATE,
        drinkType: DrinkType.TEA,
        topic: 'Books',
        maxParticipants: 4,
      });

      const createArg = mockPrisma.room.create.mock.calls[0][0].data;
      expect(createArg.inviteCode).toBeDefined();
      expect(typeof createArg.inviteCode).toBe('string');
      expect(createArg.inviteCode!.length).toBe(INVITE_CODE_LENGTH);
      for (const char of createArg.inviteCode!) {
        expect(INVITE_CODE_CHARSET).toContain(char);
      }
      expect(createArg.status).toBe('WAITING');
    });

    it('should cache the room in Redis with 24h TTL', async () => {
      const now = new Date();
      mockPrisma.room.create.mockResolvedValue({
        id: 'room-cached',
        type: 'PUBLIC',
        status: 'ACTIVE',
        drinkType: 'COFFEE',
        topic: 'Tech',
        inviteCode: null,
        maxParticipants: 6,
        createdAt: now,
        closedAt: null,
      });

      await createRoom({
        type: RoomType.PUBLIC,
        drinkType: DrinkType.COFFEE,
        topic: 'Tech',
        maxParticipants: 6,
      });

      expect(mockRedis.set).toHaveBeenCalledWith(
        'coffee:room:room-cached',
        expect.any(String),
        'EX',
        86400,
      );
      expect(mockRedis.sadd).toHaveBeenCalledWith('coffee:rooms:active', 'room-cached');
    });
  });

  // ── getRoom ────────────────────────────────────────────────────

  describe('getRoom', () => {
    it('should return cached room from Redis', async () => {
      const cachedRoom = {
        id: 'room-1',
        type: 'public',
        status: 'active',
        drinkType: 'coffee',
        topic: 'Tech',
        inviteCode: null,
        maxParticipants: 6,
        createdAt: '2026-01-15T10:00:00.000Z',
        closedAt: null,
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedRoom));

      const room = await getRoom('room-1');

      expect(room).toEqual(cachedRoom);
      expect(mockPrisma.room.findUnique).not.toHaveBeenCalled();
    });

    it('should fall back to DB when not cached', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.room.findUnique.mockResolvedValue({
        id: 'room-db',
        type: 'PUBLIC',
        status: 'ACTIVE',
        drinkType: 'COFFEE',
        topic: 'Tech',
        inviteCode: null,
        maxParticipants: 6,
        createdAt: new Date('2026-01-15T10:00:00Z'),
        closedAt: null,
      });

      const room = await getRoom('room-db');

      expect(room).not.toBeNull();
      expect(room!.id).toBe('room-db');
      expect(room!.type).toBe('public');
      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should return null when room does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.room.findUnique.mockResolvedValue(null);

      const room = await getRoom('nonexistent');
      expect(room).toBeNull();
    });
  });

  // ── addParticipant ─────────────────────────────────────────────

  describe('addParticipant', () => {
    it('should add a new participant to a room', async () => {
      mockPrisma.roomParticipant.findFirst.mockResolvedValue(null);
      mockPrisma.roomParticipant.count.mockResolvedValue(0);

      mockRedis.get.mockResolvedValue(JSON.stringify({
        id: 'room-1',
        type: 'public',
        status: 'active',
        drinkType: 'coffee',
        topic: 'Tech',
        inviteCode: null,
        maxParticipants: 6,
        createdAt: '2026-01-15T10:00:00.000Z',
        closedAt: null,
      }));

      mockPrisma.roomParticipant.create.mockResolvedValue({
        id: 'part-1',
        sessionId: 'sess-1',
        roomId: 'room-1',
        nickname: 'Alice',
        avatarColor: '#FF6B6B',
        role: 'HOST',
        isMuted: false,
        joinedAt: new Date(),
        leftAt: null,
      });

      const participant = await addParticipant({
        roomId: 'room-1',
        sessionId: 'sess-1',
        nickname: 'Alice',
        avatarColor: '#FF6B6B',
        role: ParticipantRole.HOST,
      });

      expect(participant.id).toBe('part-1');
      expect(participant.nickname).toBe('Alice');
      expect(participant.role).toBe('host');
      expect(participant.status).toBe(ParticipantStatus.CONNECTED);
    });

    it('should return existing participant on rejoin', async () => {
      mockPrisma.roomParticipant.findFirst.mockResolvedValue({
        id: 'part-existing',
        sessionId: 'sess-1',
        roomId: 'room-1',
        nickname: 'Alice',
        avatarColor: '#FF6B6B',
        role: 'HOST',
        isMuted: false,
        joinedAt: new Date(),
        leftAt: null,
      });

      const participant = await addParticipant({
        roomId: 'room-1',
        sessionId: 'sess-1',
        nickname: 'Alice',
        avatarColor: '#FF6B6B',
        role: ParticipantRole.HOST,
      });

      expect(participant.id).toBe('part-existing');
      expect(mockPrisma.roomParticipant.create).not.toHaveBeenCalled();
    });

    it('should throw when room is full', async () => {
      mockPrisma.roomParticipant.findFirst.mockResolvedValue(null);
      mockPrisma.roomParticipant.count.mockResolvedValue(6);

      mockRedis.get.mockResolvedValue(JSON.stringify({
        id: 'room-full',
        type: 'public',
        status: 'active',
        drinkType: 'coffee',
        topic: 'Tech',
        inviteCode: null,
        maxParticipants: 6,
        createdAt: '2026-01-15T10:00:00.000Z',
        closedAt: null,
      }));

      await expect(
        addParticipant({
          roomId: 'room-full',
          sessionId: 'sess-7',
          nickname: 'Overflow',
          avatarColor: '#000000',
          role: ParticipantRole.GUEST,
        }),
      ).rejects.toThrow('Room is full');
    });

    it('should throw when room does not exist', async () => {
      mockPrisma.roomParticipant.findFirst.mockResolvedValue(null);
      mockPrisma.roomParticipant.count.mockResolvedValue(0);
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.room.findUnique.mockResolvedValue(null);

      await expect(
        addParticipant({
          roomId: 'nonexistent-room',
          sessionId: 'sess-1',
          nickname: 'Ghost',
          avatarColor: '#000000',
          role: ParticipantRole.GUEST,
        }),
      ).rejects.toThrow('Room not found');
    });
  });

  // ── removeParticipant ──────────────────────────────────────────

  describe('removeParticipant', () => {
    it('should mark participant as left and remove from Redis', async () => {
      mockPrisma.roomParticipant.update.mockResolvedValue({});
      mockPrisma.roomParticipant.count.mockResolvedValue(2);

      await removeParticipant('room-1', 'part-1');

      expect(mockPrisma.roomParticipant.update).toHaveBeenCalledWith({
        where: { id: 'part-1' },
        data: { leftAt: expect.any(Date) },
      });
      expect(mockRedis.hdel).toHaveBeenCalledWith('coffee:room:room-1:participants', 'part-1');
    });

    it('should close room when last participant leaves', async () => {
      mockPrisma.roomParticipant.update.mockResolvedValue({});
      mockPrisma.roomParticipant.count.mockResolvedValue(0);
      mockPrisma.room.update.mockResolvedValue({});
      mockPrisma.roomParticipant.updateMany.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      await removeParticipant('room-closing', 'part-last');

      expect(mockPrisma.room.update).toHaveBeenCalledWith({
        where: { id: 'room-closing' },
        data: { status: 'CLOSED', closedAt: expect.any(Date) },
      });
    });
  });

  // ── getRoomParticipants ────────────────────────────────────────

  describe('getRoomParticipants', () => {
    it('should return participants from Redis cache', async () => {
      const participants = {
        'part-1': JSON.stringify({ id: 'part-1', nickname: 'Alice', role: 'host' }),
        'part-2': JSON.stringify({ id: 'part-2', nickname: 'Bob', role: 'guest' }),
      };
      mockRedis.hgetall.mockResolvedValue(participants);

      const result = await getRoomParticipants('room-1');

      expect(result).toHaveLength(2);
      expect(mockPrisma.roomParticipant.findMany).not.toHaveBeenCalled();
    });

    it('should fall back to DB when Redis cache is empty', async () => {
      mockRedis.hgetall.mockResolvedValue({});
      mockPrisma.roomParticipant.findMany.mockResolvedValue([
        {
          id: 'part-1',
          sessionId: 'sess-1',
          roomId: 'room-1',
          nickname: 'Alice',
          avatarColor: '#FF6B6B',
          role: 'HOST',
          isMuted: false,
          joinedAt: new Date(),
          leftAt: null,
        },
      ]);

      const result = await getRoomParticipants('room-1');

      expect(result).toHaveLength(1);
      expect(result[0].nickname).toBe('Alice');
    });

    it('should return empty array when no participants exist', async () => {
      mockRedis.hgetall.mockResolvedValue({});
      mockPrisma.roomParticipant.findMany.mockResolvedValue([]);

      const result = await getRoomParticipants('room-empty');
      expect(result).toEqual([]);
    });
  });

  // ── closeRoom ──────────────────────────────────────────────────

  describe('closeRoom', () => {
    it('should mark room as closed, mark all participants as left, clean Redis', async () => {
      mockPrisma.room.update.mockResolvedValue({});
      mockPrisma.roomParticipant.updateMany.mockResolvedValue({ count: 3 });
      mockPrisma.auditLog.create.mockResolvedValue({});

      await closeRoom('room-1', 'Host ended session');

      expect(mockPrisma.room.update).toHaveBeenCalledWith({
        where: { id: 'room-1' },
        data: { status: 'CLOSED', closedAt: expect.any(Date) },
      });
      expect(mockPrisma.roomParticipant.updateMany).toHaveBeenCalledWith({
        where: { roomId: 'room-1', leftAt: null },
        data: { leftAt: expect.any(Date) },
      });
      expect(mockRedis.del).toHaveBeenCalledWith('coffee:room:room-1');
      expect(mockRedis.del).toHaveBeenCalledWith('coffee:room:room-1:participants');
      expect(mockRedis.del).toHaveBeenCalledWith('coffee:room:room-1:turn');
      expect(mockRedis.srem).toHaveBeenCalledWith('coffee:rooms:active', 'room-1');

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: { roomId: 'room-1', action: 'room_closed', details: { reason: 'Host ended session' } },
      });
    });
  });

  // ── getRoomByInviteCode ────────────────────────────────────────

  describe('getRoomByInviteCode', () => {
    it('should return room for a valid invite code', async () => {
      mockPrisma.room.findUnique.mockResolvedValue({
        id: 'room-priv-1',
        type: 'PRIVATE',
        status: 'WAITING',
        drinkType: 'TEA',
        topic: 'Books',
        inviteCode: 'ABC12345',
        maxParticipants: 4,
        createdAt: new Date(),
        closedAt: null,
      });

      const room = await getRoomByInviteCode('ABC12345');

      expect(room).not.toBeNull();
      expect(room!.inviteCode).toBe('ABC12345');
      expect(room!.type).toBe('private');
    });

    it('should return null for an invalid invite code', async () => {
      mockPrisma.room.findUnique.mockResolvedValue(null);

      const room = await getRoomByInviteCode('INVALID1');
      expect(room).toBeNull();
    });
  });

  // ── activateRoom ───────────────────────────────────────────────

  describe('activateRoom', () => {
    it('should update room status to ACTIVE in DB and Redis', async () => {
      mockPrisma.room.update.mockResolvedValue({});
      mockRedis.get.mockResolvedValue(JSON.stringify({
        id: 'room-priv-1',
        type: 'private',
        status: 'waiting',
        drinkType: 'tea',
        topic: 'Books',
        inviteCode: 'ABC12345',
        maxParticipants: 4,
        createdAt: '2026-01-15T10:00:00.000Z',
        closedAt: null,
      }));

      await activateRoom('room-priv-1');

      expect(mockPrisma.room.update).toHaveBeenCalledWith({
        where: { id: 'room-priv-1' },
        data: { status: 'ACTIVE' },
      });

      const setCall = mockRedis.set.mock.calls[0];
      const cachedRoom = JSON.parse(setCall[1]);
      expect(cachedRoom.status).toBe(RoomStatus.ACTIVE);
    });
  });
});
