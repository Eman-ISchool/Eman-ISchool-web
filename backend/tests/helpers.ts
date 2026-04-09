import express from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import type { Router } from 'express';
import type { GuestSession, Room, Participant, TurnState } from '@shared/types';
import { RoomType, RoomStatus, DrinkType, ParticipantRole, ParticipantStatus, TurnStatus } from '@shared/types';

// ─── Constants ──────────────────────────────────────────────────────

export const TEST_JWT_SECRET = 'test-secret-key-for-integration-tests';

// ─── App Factory ────────────────────────────────────────────────────

/**
 * Creates a minimal Express app with JSON parsing and the given routes.
 * The caller must import the routes (after vi.mock hoisting takes effect)
 * and pass them in.
 */
export function createTestApp(routes: Router): express.Express {
  const app = express();
  app.use(express.json());
  app.use(routes);
  return app;
}

// ─── Lightweight Request Helper ─────────────────────────────────────

interface TestResponse {
  status: number;
  body: any;
  headers: Record<string, string | string[] | undefined>;
}

/**
 * Sends a request through Express without opening a network socket.
 * Uses Node's http.IncomingMessage / http.ServerResponse wired directly
 * to the Express app's request handler.
 */
export function testRequest(app: express.Express) {
  async function send(
    method: string,
    url: string,
    options: { body?: any; headers?: Record<string, string> } = {},
  ): Promise<TestResponse> {
    return new Promise((resolve, reject) => {
      // Build the raw request body
      const bodyStr = options.body ? JSON.stringify(options.body) : '';

      // Create a minimal socket-like duplex stream
      const { PassThrough } = require('stream');
      const reqStream = new PassThrough();
      const resStream = new PassThrough();

      // Create an IncomingMessage manually
      const req = new http.IncomingMessage(reqStream as any);
      req.method = method.toUpperCase();
      req.url = url;
      req.headers = {
        'content-type': 'application/json',
        'content-length': String(Buffer.byteLength(bodyStr)),
        ...(options.headers || {}),
      };
      // Normalize header keys to lowercase
      for (const key of Object.keys(req.headers)) {
        const lower = key.toLowerCase();
        if (lower !== key) {
          req.headers[lower] = req.headers[key];
          delete req.headers[key];
        }
      }

      // Create a ServerResponse
      const res = new http.ServerResponse(req);
      // Capture the response body
      const chunks: Buffer[] = [];

      // Override write and end to capture output
      const origWrite = res.write.bind(res);
      const origEnd = res.end.bind(res);

      res.write = function (chunk: any, ...args: any[]): boolean {
        if (chunk) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        return true;
      } as any;

      res.end = function (chunk?: any, ...args: any[]): any {
        if (chunk) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const body = Buffer.concat(chunks).toString();
        let parsed: any;
        try {
          parsed = JSON.parse(body);
        } catch {
          parsed = body;
        }
        resolve({
          status: res.statusCode,
          body: parsed,
          headers: res.getHeaders() as Record<string, string | string[] | undefined>,
        });
        return res;
      } as any;

      // Let Express handle the request
      (app as any).handle(req, res);

      // Push the body data and signal end of request
      if (bodyStr) {
        req.push(bodyStr);
      }
      req.push(null);
    });
  }

  return {
    get(url: string, headers?: Record<string, string>) {
      return send('GET', url, { headers });
    },
    post(url: string, body?: any, headers?: Record<string, string>) {
      return send('POST', url, { body, headers });
    },
    put(url: string, body?: any, headers?: Record<string, string>) {
      return send('PUT', url, { body, headers });
    },
    delete(url: string, headers?: Record<string, string>) {
      return send('DELETE', url, { headers });
    },
  };
}

// ─── Token Factory ──────────────────────────────────────────────────

/**
 * Generates a valid JWT token matching the backend's expected format.
 */
export function generateTestToken(sessionId: string, nickname: string): string {
  return jwt.sign(
    { sessionId, nickname },
    TEST_JWT_SECRET,
    { expiresIn: '24h' },
  );
}

// ─── Mock Data Factories ────────────────────────────────────────────

let sessionCounter = 0;

export function mockSession(overrides: Partial<GuestSession> = {}): GuestSession {
  sessionCounter++;
  const id = overrides.id ?? `session-${sessionCounter}`;
  return {
    id,
    nickname: `TestUser${sessionCounter}`,
    avatarColor: '#FF6B6B',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

let roomCounter = 0;

export function mockRoom(overrides: Partial<Room> = {}): Room {
  roomCounter++;
  const id = overrides.id ?? `room-${roomCounter}`;
  return {
    id,
    type: RoomType.PRIVATE,
    status: RoomStatus.WAITING,
    drinkType: DrinkType.COFFEE,
    topic: 'Technology',
    inviteCode: `ABCD${String(roomCounter).padStart(4, '0')}`,
    maxParticipants: 6,
    createdAt: new Date().toISOString(),
    closedAt: null,
    ...overrides,
  };
}

let participantCounter = 0;

export function mockParticipant(overrides: Partial<Participant> = {}): Participant {
  participantCounter++;
  return {
    id: `participant-${participantCounter}`,
    sessionId: `session-${participantCounter}`,
    roomId: `room-1`,
    nickname: `User${participantCounter}`,
    avatarColor: '#4ECDC4',
    role: ParticipantRole.GUEST,
    status: ParticipantStatus.CONNECTED,
    isMuted: false,
    isSpeaking: false,
    joinedAt: new Date().toISOString(),
    leftAt: null,
    ...overrides,
  };
}

export function mockTurnState(roomId: string, overrides: Partial<TurnState> = {}): TurnState {
  return {
    roomId,
    currentSpeakerId: null,
    status: TurnStatus.IDLE,
    startedAt: null,
    endsAt: null,
    queue: [],
    ...overrides,
  };
}

// ─── Reset Counters ─────────────────────────────────────────────────

export function resetFactories(): void {
  sessionCounter = 0;
  roomCounter = 0;
  participantCounter = 0;
}
