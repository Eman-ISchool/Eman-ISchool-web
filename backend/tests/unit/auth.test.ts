import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

// ── Hoisted mocks (accessible inside vi.mock factories) ──────────
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    guestSession: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../../src/lib/prisma', () => ({ default: mockPrisma, prisma: mockPrisma }));

vi.mock('../../src/config', () => ({
  config: {
    jwt: { secret: 'test-secret-key-for-unit-tests', expiresIn: '24h' },
    openai: { enabled: false, apiKey: '' },
    redis: { url: 'redis://localhost:6379' },
    database: { url: 'postgresql://localhost/test' },
    port: 3001,
    nodeEnv: 'test',
    isProduction: false,
    cors: { origin: 'http://localhost:3000' },
  },
}));

vi.mock('uuid', () => ({ v4: () => 'mock-uuid-1234' }));

import { createSession, verifyToken, getSession, validateSessionToken } from '../../src/services/auth';

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── createSession ──────────────────────────────────────────────

  describe('createSession', () => {
    it('should create a session and return a JWT token', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      mockPrisma.guestSession.create.mockResolvedValue({
        id: 'session-id-1',
        nickname: 'Alice',
        avatarColor: '#FF6B6B',
        token: 'mock-uuid-1234',
        createdAt: now,
        expiresAt,
      });

      const result = await createSession('Alice');

      expect(mockPrisma.guestSession.create).toHaveBeenCalledOnce();
      expect(result.session.nickname).toBe('Alice');
      expect(result.session.id).toBe('session-id-1');
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');

      // Verify the JWT can be decoded
      const decoded = jwt.verify(result.token, 'test-secret-key-for-unit-tests') as { sessionId: string; nickname: string };
      expect(decoded.sessionId).toBe('session-id-1');
      expect(decoded.nickname).toBe('Alice');
    });

    it('should set expiresAt to 24 hours from now', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      mockPrisma.guestSession.create.mockResolvedValue({
        id: 'session-id-2',
        nickname: 'Bob',
        avatarColor: '#4ECDC4',
        token: 'mock-uuid-1234',
        createdAt: now,
        expiresAt,
      });

      await createSession('Bob');

      const createData = mockPrisma.guestSession.create.mock.calls[0][0].data;
      const actualExpires = new Date(createData.expiresAt).getTime();
      const expectedExpires = Date.now() + 24 * 60 * 60 * 1000;
      expect(Math.abs(actualExpires - expectedExpires)).toBeLessThan(5000);
    });

    it('should return ISO string dates in session', async () => {
      const now = new Date('2026-01-15T10:00:00Z');
      const expiresAt = new Date('2026-01-16T10:00:00Z');

      mockPrisma.guestSession.create.mockResolvedValue({
        id: 'session-id-3',
        nickname: 'Charlie',
        avatarColor: '#45B7D1',
        token: 'mock-uuid-1234',
        createdAt: now,
        expiresAt,
      });

      const result = await createSession('Charlie');

      expect(result.session.createdAt).toBe('2026-01-15T10:00:00.000Z');
      expect(result.session.expiresAt).toBe('2026-01-16T10:00:00.000Z');
    });

    it('should propagate Prisma errors', async () => {
      mockPrisma.guestSession.create.mockRejectedValue(new Error('DB connection failed'));

      await expect(createSession('FailUser')).rejects.toThrow('DB connection failed');
    });
  });

  // ── verifyToken ────────────────────────────────────────────────

  describe('verifyToken', () => {
    it('should verify a valid JWT token', () => {
      const token = jwt.sign(
        { sessionId: 'sess-1', nickname: 'TestUser' },
        'test-secret-key-for-unit-tests',
        { expiresIn: '24h' },
      );

      const payload = verifyToken(token);
      expect(payload.sessionId).toBe('sess-1');
      expect(payload.nickname).toBe('TestUser');
    });

    it('should throw on invalid token', () => {
      expect(() => verifyToken('invalid-token-string')).toThrow();
    });

    it('should throw on token signed with wrong secret', () => {
      const token = jwt.sign(
        { sessionId: 'sess-1', nickname: 'TestUser' },
        'wrong-secret',
        { expiresIn: '24h' },
      );

      expect(() => verifyToken(token)).toThrow();
    });

    it('should throw on expired token', () => {
      const token = jwt.sign(
        { sessionId: 'sess-1', nickname: 'TestUser' },
        'test-secret-key-for-unit-tests',
        { expiresIn: '0s' },
      );

      expect(() => verifyToken(token)).toThrow();
    });
  });

  // ── getSession ─────────────────────────────────────────────────

  describe('getSession', () => {
    it('should return session when found and not expired', async () => {
      const future = new Date(Date.now() + 60 * 60 * 1000);
      mockPrisma.guestSession.findUnique.mockResolvedValue({
        id: 'sess-1',
        nickname: 'Alice',
        avatarColor: '#FF6B6B',
        createdAt: new Date(),
        expiresAt: future,
      });

      const session = await getSession('sess-1');
      expect(session).not.toBeNull();
      expect(session!.nickname).toBe('Alice');
    });

    it('should return null when session not found', async () => {
      mockPrisma.guestSession.findUnique.mockResolvedValue(null);

      const session = await getSession('nonexistent-id');
      expect(session).toBeNull();
    });

    it('should return null when session is expired', async () => {
      const past = new Date(Date.now() - 60 * 60 * 1000);
      mockPrisma.guestSession.findUnique.mockResolvedValue({
        id: 'sess-expired',
        nickname: 'Expired',
        avatarColor: '#FF6B6B',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        expiresAt: past,
      });

      const session = await getSession('sess-expired');
      expect(session).toBeNull();
    });
  });

  // ── validateSessionToken ───────────────────────────────────────

  describe('validateSessionToken', () => {
    it('should return session for a valid token with active session', async () => {
      const future = new Date(Date.now() + 60 * 60 * 1000);
      mockPrisma.guestSession.findUnique.mockResolvedValue({
        id: 'sess-valid',
        nickname: 'Valid',
        avatarColor: '#96CEB4',
        createdAt: new Date(),
        expiresAt: future,
      });

      const token = jwt.sign(
        { sessionId: 'sess-valid', nickname: 'Valid' },
        'test-secret-key-for-unit-tests',
        { expiresIn: '24h' },
      );

      const session = await validateSessionToken(token);
      expect(session).not.toBeNull();
      expect(session!.id).toBe('sess-valid');
    });

    it('should return null for an invalid token', async () => {
      const session = await validateSessionToken('totally-invalid-token');
      expect(session).toBeNull();
    });

    it('should return null for a valid token but expired session', async () => {
      const past = new Date(Date.now() - 60 * 60 * 1000);
      mockPrisma.guestSession.findUnique.mockResolvedValue({
        id: 'sess-expired',
        nickname: 'Expired',
        avatarColor: '#FF6B6B',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        expiresAt: past,
      });

      const token = jwt.sign(
        { sessionId: 'sess-expired', nickname: 'Expired' },
        'test-secret-key-for-unit-tests',
        { expiresIn: '24h' },
      );

      const session = await validateSessionToken(token);
      expect(session).toBeNull();
    });

    it('should return null for a valid token but deleted session', async () => {
      mockPrisma.guestSession.findUnique.mockResolvedValue(null);

      const token = jwt.sign(
        { sessionId: 'deleted-session', nickname: 'Ghost' },
        'test-secret-key-for-unit-tests',
        { expiresIn: '24h' },
      );

      const session = await validateSessionToken(token);
      expect(session).toBeNull();
    });
  });
});
