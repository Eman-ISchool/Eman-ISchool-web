import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Express } from 'express';

// ── Hoisted mocks (must be declared before any import that touches services) ──

const { mockPrisma, mockRedis } = vi.hoisted(() => ({
  mockPrisma: {
    guestSession: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
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
    lrange: vi.fn(),
    rpush: vi.fn(),
    lrem: vi.fn(),
    keys: vi.fn(),
    expire: vi.fn(),
    pipeline: vi.fn(() => ({ hset: vi.fn(), exec: vi.fn().mockResolvedValue([]) })),
  },
}));

vi.mock('../../src/lib/prisma', () => ({ default: mockPrisma, prisma: mockPrisma }));

vi.mock('../../src/lib/redis', () => ({
  getRedis: () => mockRedis,
  default: () => mockRedis,
}));

vi.mock('../../src/config', () => ({
  config: {
    jwt: { secret: 'test-secret-key-for-integration-tests', expiresIn: '24h' },
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
  createTestApp,
  testRequest,
  generateTestToken,
  mockSession,
  mockRoom,
  mockParticipant,
  mockTurnState,
  resetFactories,
} from '../helpers';
import routes from '../../src/api/routes';
import { RoomStatus, TurnStatus } from '@shared/types';

// ─── Setup ──────────────────────────────────────────────────────────

const app: Express = createTestApp(routes);
const api = testRequest(app);

beforeEach(() => {
  vi.clearAllMocks();
  resetFactories();
});

// ─── Auth Helpers ───────────────────────────────────────────────────

function setupAuth(id: string, nickname: string) {
  const session = mockSession({ id, nickname });
  mockPrisma.guestSession.findUnique.mockResolvedValue({
    id: session.id,
    nickname: session.nickname,
    avatarColor: session.avatarColor,
    createdAt: new Date(session.createdAt),
    expiresAt: new Date(session.expiresAt),
  });
  const token = generateTestToken(session.id, session.nickname);
  return { session, token, authHeader: { authorization: `Bearer ${token}` } };
}

// =====================================================================
// Health Check
// =====================================================================

describe('GET /api/health', () => {
  it('should return status ok and aiAvailable flag', async () => {
    const res = await api.get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(typeof res.body.aiAvailable).toBe('boolean');
  });
});

// =====================================================================
// Sessions
// =====================================================================

describe('POST /api/sessions', () => {
  it('should create a session with a valid nickname and return 201', async () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    mockPrisma.guestSession.create.mockResolvedValue({
      id: 'sess-new-1',
      nickname: 'Alice',
      avatarColor: '#FF6B6B',
      token: 'uuid-token',
      createdAt: now,
      expiresAt,
    });

    const res = await api.post('/api/sessions', { nickname: 'Alice' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('session');
    expect(res.body).toHaveProperty('token');
    expect(res.body.session.nickname).toBe('Alice');
    expect(res.body.session.id).toBe('sess-new-1');
    expect(typeof res.body.token).toBe('string');
  });

  it('should return 400 for an empty nickname', async () => {
    const res = await api.post('/api/sessions', { nickname: '' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for a nickname that is too short', async () => {
    const res = await api.post('/api/sessions', { nickname: 'A' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for a nickname with invalid characters', async () => {
    const res = await api.post('/api/sessions', { nickname: 'user@name!' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 when nickname field is missing', async () => {
    const res = await api.post('/api/sessions', {});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/sessions/me', () => {
  it('should return the session for a valid token', async () => {
    const { authHeader } = setupAuth('sess-me-1', 'Alice');

    const res = await api.get('/api/sessions/me', authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('session');
    expect(res.body.session.id).toBe('sess-me-1');
    expect(res.body.session.nickname).toBe('Alice');
  });

  it('should return 401 when no authorization header is present', async () => {
    const res = await api.get('/api/sessions/me');

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/authorization/i);
  });

  it('should return 401 for an invalid token', async () => {
    const res = await api.get('/api/sessions/me', {
      authorization: 'Bearer totally-invalid-token',
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 401 for a token with a non-existent session', async () => {
    mockPrisma.guestSession.findUnique.mockResolvedValue(null);
    const token = generateTestToken('nonexistent-session', 'Ghost');

    const res = await api.get('/api/sessions/me', {
      authorization: `Bearer ${token}`,
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

// =====================================================================
// Queue
// =====================================================================

describe('POST /api/queue/join', () => {
  it('should join the queue with valid data and return position', async () => {
    const { authHeader } = setupAuth('sess-queue-1', 'QueueUser');

    // addToQueue calls redis.lrange then redis.rpush
    mockRedis.lrange.mockResolvedValue([]);
    mockRedis.rpush.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);

    const res = await api.post(
      '/api/queue/join',
      { drinkType: 'coffee', topic: 'Technology and Innovation' },
      authHeader,
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('position');
    expect(res.body).toHaveProperty('estimatedWait');
    expect(typeof res.body.position).toBe('number');
    expect(res.body.position).toBe(1);
  });

  it('should return 401 without authentication', async () => {
    const res = await api.post('/api/queue/join', {
      drinkType: 'coffee',
      topic: 'Technology and Innovation',
    });

    expect(res.status).toBe(401);
  });

  it('should return 400 for invalid drink type', async () => {
    const { authHeader } = setupAuth('sess-queue-2', 'QueueUser2');

    const res = await api.post(
      '/api/queue/join',
      { drinkType: 'invalid', topic: 'Technology and Innovation' },
      authHeader,
    );

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 when topic is missing', async () => {
    const { authHeader } = setupAuth('sess-queue-3', 'QueueUser3');

    const res = await api.post(
      '/api/queue/join',
      { drinkType: 'coffee' },
      authHeader,
    );

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 when topic is too short', async () => {
    const { authHeader } = setupAuth('sess-queue-4', 'QueueUser4');

    const res = await api.post(
      '/api/queue/join',
      { drinkType: 'coffee', topic: 'X' },
      authHeader,
    );

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/queue/leave', () => {
  it('should leave the queue successfully', async () => {
    const { authHeader } = setupAuth('sess-leave-1', 'Leaver');

    // removeFromAllQueues calls redis.keys then iterates
    mockRedis.keys.mockResolvedValue([]);

    const res = await api.post('/api/queue/leave', undefined, authHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 without authentication', async () => {
    const res = await api.post('/api/queue/leave');

    expect(res.status).toBe(401);
  });
});

// =====================================================================
// Private Rooms - Create
// =====================================================================

describe('POST /api/rooms/private', () => {
  it('should create a private room and return room with invite code', async () => {
    const { session, authHeader } = setupAuth('sess-room-creator', 'RoomHost');

    const now = new Date();
    mockPrisma.room.create.mockResolvedValue({
      id: 'room-created-1',
      type: 'PRIVATE',
      status: 'WAITING',
      drinkType: 'COFFEE',
      topic: 'Tech Trends',
      inviteCode: 'ABCD1234',
      maxParticipants: 6,
      createdAt: now,
      closedAt: null,
    });

    // addParticipant flow
    mockPrisma.roomParticipant.findFirst.mockResolvedValue(null);
    mockPrisma.roomParticipant.count.mockResolvedValue(0);
    mockRedis.get.mockResolvedValue(JSON.stringify({
      id: 'room-created-1',
      type: 'private',
      status: 'waiting',
      drinkType: 'coffee',
      topic: 'Tech Trends',
      inviteCode: 'ABCD1234',
      maxParticipants: 6,
      createdAt: now.toISOString(),
      closedAt: null,
    }));
    mockPrisma.roomParticipant.create.mockResolvedValue({
      id: 'part-host-1',
      sessionId: session.id,
      roomId: 'room-created-1',
      nickname: session.nickname,
      avatarColor: session.avatarColor,
      role: 'HOST',
      isMuted: false,
      joinedAt: now,
      leftAt: null,
    });

    const res = await api.post(
      '/api/rooms/private',
      { drinkType: 'coffee', topic: 'Tech Trends' },
      authHeader,
    );

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('room');
    expect(res.body).toHaveProperty('inviteCode');
    expect(res.body.room.id).toBe('room-created-1');
    expect(res.body.room.type).toBe('private');
    expect(typeof res.body.inviteCode).toBe('string');
  });

  it('should return 400 for invalid data (missing drinkType)', async () => {
    const { authHeader } = setupAuth('sess-room-2', 'RoomHost2');

    const res = await api.post(
      '/api/rooms/private',
      { topic: 'Tech Trends' },
      authHeader,
    );

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for invalid data (missing topic)', async () => {
    const { authHeader } = setupAuth('sess-room-3', 'RoomHost3');

    const res = await api.post(
      '/api/rooms/private',
      { drinkType: 'coffee' },
      authHeader,
    );

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for invalid maxParticipants (too low)', async () => {
    const { authHeader } = setupAuth('sess-room-4', 'RoomHost4');

    const res = await api.post(
      '/api/rooms/private',
      { drinkType: 'coffee', topic: 'Tech Trends', maxParticipants: 1 },
      authHeader,
    );

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for invalid maxParticipants (too high)', async () => {
    const { authHeader } = setupAuth('sess-room-5', 'RoomHost5');

    const res = await api.post(
      '/api/rooms/private',
      { drinkType: 'coffee', topic: 'Tech Trends', maxParticipants: 100 },
      authHeader,
    );

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 401 without authentication', async () => {
    const res = await api.post('/api/rooms/private', {
      drinkType: 'coffee',
      topic: 'Tech Trends',
    });

    expect(res.status).toBe(401);
  });
});

// =====================================================================
// Private Rooms - Join
// =====================================================================

describe('POST /api/rooms/join', () => {
  it('should join a room with a valid invite code', async () => {
    const { session, authHeader } = setupAuth('sess-joiner', 'Joiner');

    const now = new Date();
    // getRoomByInviteCode via prisma
    mockPrisma.room.findUnique.mockResolvedValue({
      id: 'room-join-1',
      type: 'PRIVATE',
      status: 'WAITING',
      drinkType: 'TEA',
      topic: 'Books',
      inviteCode: 'JOIN1234',
      maxParticipants: 6,
      createdAt: now,
      closedAt: null,
    });

    // getRoomParticipants (to check capacity): return 1 existing participant
    mockRedis.hgetall.mockResolvedValue({
      'part-host': JSON.stringify(mockParticipant({ id: 'part-host' })),
    });

    // addParticipant flow
    mockPrisma.roomParticipant.findFirst.mockResolvedValue(null);
    mockPrisma.roomParticipant.count.mockResolvedValue(1);
    mockRedis.get.mockResolvedValue(JSON.stringify({
      id: 'room-join-1',
      type: 'private',
      status: 'waiting',
      drinkType: 'tea',
      topic: 'Books',
      inviteCode: 'JOIN1234',
      maxParticipants: 6,
      createdAt: now.toISOString(),
      closedAt: null,
    }));
    mockPrisma.roomParticipant.create.mockResolvedValue({
      id: 'part-joiner-1',
      sessionId: session.id,
      roomId: 'room-join-1',
      nickname: session.nickname,
      avatarColor: session.avatarColor,
      role: 'GUEST',
      isMuted: false,
      joinedAt: now,
      leftAt: null,
    });

    // activateRoom (called because status is WAITING)
    mockPrisma.room.update.mockResolvedValue({});

    const res = await api.post(
      '/api/rooms/join',
      { inviteCode: 'JOIN1234' },
      authHeader,
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('room');
    expect(res.body.room.id).toBe('room-join-1');
  });

  it('should return 404 for an invalid invite code', async () => {
    const { authHeader } = setupAuth('sess-joiner-2', 'Joiner2');

    mockPrisma.room.findUnique.mockResolvedValue(null);

    const res = await api.post(
      '/api/rooms/join',
      { inviteCode: 'INVALID1' },
      authHeader,
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('should return 410 for a closed room', async () => {
    const { authHeader } = setupAuth('sess-joiner-3', 'Joiner3');

    const now = new Date();
    mockPrisma.room.findUnique.mockResolvedValue({
      id: 'room-closed-1',
      type: 'PRIVATE',
      status: 'CLOSED',
      drinkType: 'COFFEE',
      topic: 'Done',
      inviteCode: 'CLOSED12',
      maxParticipants: 6,
      createdAt: now,
      closedAt: now,
    });

    const res = await api.post(
      '/api/rooms/join',
      { inviteCode: 'CLOSED12' },
      authHeader,
    );

    expect(res.status).toBe(410);
    expect(res.body.error).toMatch(/no longer available/i);
  });

  it('should return 410 for a closing room', async () => {
    const { authHeader } = setupAuth('sess-joiner-4', 'Joiner4');

    const now = new Date();
    mockPrisma.room.findUnique.mockResolvedValue({
      id: 'room-closing-1',
      type: 'PRIVATE',
      status: 'CLOSING',
      drinkType: 'COFFEE',
      topic: 'Ending',
      inviteCode: 'CLOSNG12',
      maxParticipants: 6,
      createdAt: now,
      closedAt: null,
    });

    const res = await api.post(
      '/api/rooms/join',
      { inviteCode: 'CLOSNG12' },
      authHeader,
    );

    expect(res.status).toBe(410);
    expect(res.body.error).toMatch(/no longer available/i);
  });

  it('should return 409 when room is full', async () => {
    const { authHeader } = setupAuth('sess-joiner-5', 'Joiner5');

    const now = new Date();
    mockPrisma.room.findUnique.mockResolvedValue({
      id: 'room-full-1',
      type: 'PRIVATE',
      status: 'ACTIVE',
      drinkType: 'COFFEE',
      topic: 'Full Room',
      inviteCode: 'FULLRM12',
      maxParticipants: 2,
      createdAt: now,
      closedAt: null,
    });

    // getRoomParticipants returns 2 participants (room is full, max is 2)
    mockRedis.hgetall.mockResolvedValue({
      'part-1': JSON.stringify(mockParticipant({ id: 'part-1' })),
      'part-2': JSON.stringify(mockParticipant({ id: 'part-2' })),
    });

    const res = await api.post(
      '/api/rooms/join',
      { inviteCode: 'FULLRM12' },
      authHeader,
    );

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/full/i);
  });

  it('should return 400 for a malformed invite code', async () => {
    const { authHeader } = setupAuth('sess-joiner-6', 'Joiner6');

    const res = await api.post(
      '/api/rooms/join',
      { inviteCode: 'AB' }, // Too short (needs 8 chars)
      authHeader,
    );

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 401 without authentication', async () => {
    const res = await api.post('/api/rooms/join', { inviteCode: 'ABCD1234' });

    expect(res.status).toBe(401);
  });
});

// =====================================================================
// Rooms - Get
// =====================================================================

describe('GET /api/rooms/:id', () => {
  it('should return room data for a valid room ID', async () => {
    const { authHeader } = setupAuth('sess-viewer', 'Viewer');

    const room = mockRoom({ id: 'room-get-1' });
    // getRoom checks Redis first
    mockRedis.get.mockResolvedValue(JSON.stringify(room));

    const res = await api.get('/api/rooms/room-get-1', authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('room');
    expect(res.body.room.id).toBe('room-get-1');
  });

  it('should return 404 for a nonexistent room', async () => {
    const { authHeader } = setupAuth('sess-viewer-2', 'Viewer2');

    mockRedis.get.mockResolvedValue(null);
    mockPrisma.room.findUnique.mockResolvedValue(null);

    const res = await api.get('/api/rooms/nonexistent-room-id', authHeader);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('should return 401 without authentication', async () => {
    const res = await api.get('/api/rooms/some-room-id');

    expect(res.status).toBe(401);
  });
});

// =====================================================================
// Rooms - Get State
// =====================================================================

describe('GET /api/rooms/:id/state', () => {
  it('should return full room state including participants and turn state', async () => {
    const { authHeader } = setupAuth('sess-state-viewer', 'StateViewer');

    const room = mockRoom({ id: 'room-state-1', status: RoomStatus.ACTIVE });
    const participant = mockParticipant({ roomId: 'room-state-1' });
    const turnState = mockTurnState('room-state-1');

    // getRoom reads from Redis
    mockRedis.get.mockImplementation(async (key: string) => {
      if (key.includes('room-state-1') && !key.includes('turn')) {
        return JSON.stringify(room);
      }
      if (key.includes('turn')) {
        return JSON.stringify(turnState);
      }
      return null;
    });

    // getRoomParticipants reads from Redis hash
    mockRedis.hgetall.mockResolvedValue({
      [participant.id]: JSON.stringify(participant),
    });

    const res = await api.get('/api/rooms/room-state-1/state', authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('room');
    expect(res.body).toHaveProperty('participants');
    expect(res.body).toHaveProperty('turnState');
    expect(res.body).toHaveProperty('suggestions');
    expect(res.body.room.id).toBe('room-state-1');
    expect(Array.isArray(res.body.participants)).toBe(true);
    expect(res.body.participants.length).toBeGreaterThanOrEqual(1);
    expect(res.body.turnState.roomId).toBe('room-state-1');
    expect(res.body.turnState.status).toBe(TurnStatus.IDLE);
    expect(Array.isArray(res.body.suggestions)).toBe(true);
  });

  it('should return 404 for a nonexistent room', async () => {
    const { authHeader } = setupAuth('sess-state-viewer-2', 'StateViewer2');

    mockRedis.get.mockResolvedValue(null);
    mockPrisma.room.findUnique.mockResolvedValue(null);

    const res = await api.get('/api/rooms/nonexistent-room/state', authHeader);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('should return 401 without authentication', async () => {
    const res = await api.get('/api/rooms/some-room-id/state');

    expect(res.status).toBe(401);
  });
});
