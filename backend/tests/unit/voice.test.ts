import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TurnStatus } from '@shared/types';
import type { TurnState } from '@shared/types';
import { TURN_DURATION_SECONDS } from '@shared/constants';

// ── Hoisted mocks ──────────────────────────────────────────────────
const { mockRedis } = vi.hoisted(() => ({
  mockRedis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

vi.mock('../../src/lib/redis', () => ({
  getRedis: () => mockRedis,
  default: () => mockRedis,
}));

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
  initializeTurnState,
  getTurnState,
  requestTurn,
  releaseTurn,
  removeParticipantFromTurn,
  cleanupAllTimers,
} from '../../src/services/voice';

describe('Voice / Turn Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanupAllTimers();
    vi.useRealTimers();
  });

  // ── initializeTurnState ────────────────────────────────────────

  describe('initializeTurnState', () => {
    it('should create an idle turn state with empty queue', async () => {
      const state = await initializeTurnState('room-1');

      expect(state.roomId).toBe('room-1');
      expect(state.currentSpeakerId).toBeNull();
      expect(state.status).toBe(TurnStatus.IDLE);
      expect(state.startedAt).toBeNull();
      expect(state.endsAt).toBeNull();
      expect(state.queue).toEqual([]);
    });

    it('should persist state to Redis with 24h TTL', async () => {
      await initializeTurnState('room-2');

      expect(mockRedis.set).toHaveBeenCalledWith(
        'coffee:room:room-2:turn',
        expect.any(String),
        'EX',
        86400,
      );
    });
  });

  // ── getTurnState ───────────────────────────────────────────────

  describe('getTurnState', () => {
    it('should return cached state from Redis', async () => {
      const cachedState: TurnState = {
        roomId: 'room-1',
        currentSpeakerId: 'part-1',
        status: TurnStatus.ACTIVE,
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 60000).toISOString(),
        queue: ['part-2'],
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedState));

      const state = await getTurnState('room-1');

      expect(state.currentSpeakerId).toBe('part-1');
      expect(state.status).toBe(TurnStatus.ACTIVE);
      expect(state.queue).toEqual(['part-2']);
    });

    it('should initialize new state when no cache exists', async () => {
      mockRedis.get.mockResolvedValue(null);

      const state = await getTurnState('room-new');

      expect(state.roomId).toBe('room-new');
      expect(state.status).toBe(TurnStatus.IDLE);
      expect(state.currentSpeakerId).toBeNull();
    });
  });

  // ── requestTurn ────────────────────────────────────────────────

  describe('requestTurn', () => {
    it('should start turn immediately when no one is speaking', async () => {
      const idleState: TurnState = {
        roomId: 'room-1',
        currentSpeakerId: null,
        status: TurnStatus.IDLE,
        startedAt: null,
        endsAt: null,
        queue: [],
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(idleState));

      const state = await requestTurn('room-1', 'part-1');

      expect(state.currentSpeakerId).toBe('part-1');
      expect(state.status).toBe(TurnStatus.ACTIVE);
      expect(state.startedAt).not.toBeNull();
      expect(state.endsAt).not.toBeNull();
    });

    it('should add to queue when someone is already speaking', async () => {
      const activeState: TurnState = {
        roomId: 'room-1',
        currentSpeakerId: 'part-1',
        status: TurnStatus.ACTIVE,
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + TURN_DURATION_SECONDS * 1000).toISOString(),
        queue: [],
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(activeState));

      const state = await requestTurn('room-1', 'part-2');

      expect(state.currentSpeakerId).toBe('part-1');
      expect(state.queue).toContain('part-2');
    });

    it('should not duplicate a participant already in queue', async () => {
      const activeState: TurnState = {
        roomId: 'room-1',
        currentSpeakerId: 'part-1',
        status: TurnStatus.ACTIVE,
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + TURN_DURATION_SECONDS * 1000).toISOString(),
        queue: ['part-2'],
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(activeState));

      const state = await requestTurn('room-1', 'part-2');

      expect(state.queue.filter((id) => id === 'part-2')).toHaveLength(1);
    });

    it('should not re-add the current speaker', async () => {
      const activeState: TurnState = {
        roomId: 'room-1',
        currentSpeakerId: 'part-1',
        status: TurnStatus.ACTIVE,
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + TURN_DURATION_SECONDS * 1000).toISOString(),
        queue: [],
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(activeState));

      const state = await requestTurn('room-1', 'part-1');

      expect(state.queue).not.toContain('part-1');
      expect(state.currentSpeakerId).toBe('part-1');
    });

    it('should set endsAt to TURN_DURATION_SECONDS from now', async () => {
      const idleState: TurnState = {
        roomId: 'room-1',
        currentSpeakerId: null,
        status: TurnStatus.IDLE,
        startedAt: null,
        endsAt: null,
        queue: [],
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(idleState));

      const before = Date.now();
      const state = await requestTurn('room-1', 'part-1');
      const after = Date.now();

      const endsAt = new Date(state.endsAt!).getTime();
      const expectedMin = before + TURN_DURATION_SECONDS * 1000;
      const expectedMax = after + TURN_DURATION_SECONDS * 1000;
      expect(endsAt).toBeGreaterThanOrEqual(expectedMin);
      expect(endsAt).toBeLessThanOrEqual(expectedMax);
    });

    it('should maintain queue ordering (FIFO)', async () => {
      const state1: TurnState = {
        roomId: 'room-1',
        currentSpeakerId: 'part-1',
        status: TurnStatus.ACTIVE,
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + TURN_DURATION_SECONDS * 1000).toISOString(),
        queue: ['part-2'],
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(state1));

      const state = await requestTurn('room-1', 'part-3');

      expect(state.queue).toEqual(['part-2', 'part-3']);
    });
  });

  // ── releaseTurn ────────────────────────────────────────────────

  describe('releaseTurn', () => {
    it('should end turn and start next speaker from queue', async () => {
      const activeState: TurnState = {
        roomId: 'room-1',
        currentSpeakerId: 'part-1',
        status: TurnStatus.ACTIVE,
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + TURN_DURATION_SECONDS * 1000).toISOString(),
        queue: ['part-2'],
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(activeState));

      const resultPromise = releaseTurn('room-1', 'part-1');
      await vi.advanceTimersByTimeAsync(1100);
      const state = await resultPromise;

      expect(state.currentSpeakerId).toBe('part-2');
      expect(state.status).toBe(TurnStatus.ACTIVE);
    });

    it('should go to IDLE when queue is empty after release', async () => {
      const activeState: TurnState = {
        roomId: 'room-1',
        currentSpeakerId: 'part-1',
        status: TurnStatus.ACTIVE,
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + TURN_DURATION_SECONDS * 1000).toISOString(),
        queue: [],
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(activeState));

      const resultPromise = releaseTurn('room-1', 'part-1');
      await vi.advanceTimersByTimeAsync(1100);
      const state = await resultPromise;

      expect(state.currentSpeakerId).toBeNull();
      expect(state.status).toBe(TurnStatus.IDLE);
    });

    it('should remove a queued participant without affecting current speaker', async () => {
      const activeState: TurnState = {
        roomId: 'room-1',
        currentSpeakerId: 'part-1',
        status: TurnStatus.ACTIVE,
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + TURN_DURATION_SECONDS * 1000).toISOString(),
        queue: ['part-2', 'part-3'],
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(activeState));

      const state = await releaseTurn('room-1', 'part-2');

      expect(state.currentSpeakerId).toBe('part-1');
      expect(state.queue).toEqual(['part-3']);
    });
  });

  // ── removeParticipantFromTurn ──────────────────────────────────

  describe('removeParticipantFromTurn', () => {
    it('should remove participant from queue', async () => {
      const state: TurnState = {
        roomId: 'room-1',
        currentSpeakerId: 'part-1',
        status: TurnStatus.ACTIVE,
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + TURN_DURATION_SECONDS * 1000).toISOString(),
        queue: ['part-2', 'part-3'],
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(state));

      const result = await removeParticipantFromTurn('room-1', 'part-3');

      expect(result.queue).toEqual(['part-2']);
      expect(result.currentSpeakerId).toBe('part-1');
    });

    it('should end current turn if removed participant is the current speaker', async () => {
      const state: TurnState = {
        roomId: 'room-1',
        currentSpeakerId: 'part-1',
        status: TurnStatus.ACTIVE,
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + TURN_DURATION_SECONDS * 1000).toISOString(),
        queue: ['part-2'],
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(state));

      const resultPromise = removeParticipantFromTurn('room-1', 'part-1');
      await vi.advanceTimersByTimeAsync(1100);
      const result = await resultPromise;

      expect(result.currentSpeakerId).toBe('part-2');
    });

    it('should go to IDLE if current speaker removed and queue is empty', async () => {
      const state: TurnState = {
        roomId: 'room-1',
        currentSpeakerId: 'part-1',
        status: TurnStatus.ACTIVE,
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + TURN_DURATION_SECONDS * 1000).toISOString(),
        queue: [],
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(state));

      const resultPromise = removeParticipantFromTurn('room-1', 'part-1');
      await vi.advanceTimersByTimeAsync(1100);
      const result = await resultPromise;

      expect(result.currentSpeakerId).toBeNull();
      expect(result.status).toBe(TurnStatus.IDLE);
    });
  });
});
