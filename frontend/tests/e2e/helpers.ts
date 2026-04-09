import { Page } from '@playwright/test';

// ─── Mock Data ───────────────────────────────────────────────────

export const MOCK_SESSION = {
  id: 'sess-001',
  nickname: 'TestUser',
  avatarColor: '#4ECDC4',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.test-token-mock';

export const MOCK_ROOM = {
  id: 'room-001',
  type: 'public',
  status: 'active',
  drinkType: 'coffee',
  topic: 'Technology & Innovation',
  inviteCode: null,
  maxParticipants: 6,
  createdAt: new Date().toISOString(),
  closedAt: null,
};

export const MOCK_PRIVATE_ROOM = {
  ...MOCK_ROOM,
  id: 'room-pvt-001',
  type: 'private',
  inviteCode: 'ABCD1234',
  maxParticipants: 12,
};

export const MOCK_PARTICIPANT = {
  id: 'part-001',
  sessionId: MOCK_SESSION.id,
  roomId: MOCK_ROOM.id,
  nickname: MOCK_SESSION.nickname,
  avatarColor: MOCK_SESSION.avatarColor,
  role: 'host',
  status: 'connected',
  isMuted: true,
  isSpeaking: false,
  joinedAt: new Date().toISOString(),
  leftAt: null,
};

export const MOCK_PARTICIPANT_2 = {
  ...MOCK_PARTICIPANT,
  id: 'part-002',
  sessionId: 'sess-002',
  nickname: 'OtherUser',
  avatarColor: '#FF6B6B',
  role: 'guest',
};

export const MOCK_TURN_STATE = {
  roomId: MOCK_ROOM.id,
  currentSpeakerId: null,
  status: 'idle',
  startedAt: null,
  endsAt: null,
  queue: [],
};

export const MOCK_AI_SUGGESTION = {
  id: 'sug-001',
  roomId: MOCK_ROOM.id,
  content: 'What tech trend are you most excited about?',
  type: 'question',
  createdAt: new Date().toISOString(),
};

export const MOCK_ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: ['turn:turn.example.com:3478'],
      username: 'testuser',
      credential: 'testpass',
    },
  ],
};

// ─── Session Injection ───────────────────────────────────────────

/**
 * Inject session state into localStorage before page loads.
 * This simulates a user who already has a session.
 */
export async function injectSession(page: Page): Promise<void> {
  await page.addInitScript(
    ({ token, session }) => {
      localStorage.setItem('coffee_session_token', token);
      // Zustand doesn't read from localStorage directly; the token triggers hydration
    },
    { token: MOCK_TOKEN, session: MOCK_SESSION },
  );
}

// ─── Backend API Mocking ─────────────────────────────────────────

const API_BASE = 'http://localhost:3001';

/**
 * Mock all backend API routes for a page. Call before navigating.
 */
export async function mockAllAPIs(page: Page): Promise<void> {
  // Health check
  await page.route(`${API_BASE}/api/health`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok', aiAvailable: true, timestamp: new Date().toISOString() }),
    }),
  );

  // Create session
  await page.route(`${API_BASE}/api/sessions`, (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ session: MOCK_SESSION, token: MOCK_TOKEN }),
      });
    }
    return route.continue();
  });

  // Get session
  await page.route(`${API_BASE}/api/sessions/me`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ session: MOCK_SESSION }),
    }),
  );

  // Join queue
  await page.route(`${API_BASE}/api/queue/join`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ position: 1, estimatedWait: 10 }),
    }),
  );

  // Leave queue
  await page.route(`${API_BASE}/api/queue/leave`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    }),
  );

  // Create private room
  await page.route(`${API_BASE}/api/rooms/private`, (route) =>
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ room: MOCK_PRIVATE_ROOM, inviteCode: MOCK_PRIVATE_ROOM.inviteCode }),
    }),
  );

  // Join private room
  await page.route(`${API_BASE}/api/rooms/join`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ room: MOCK_PRIVATE_ROOM }),
    }),
  );

  // Get room
  await page.route(`${API_BASE}/api/rooms/*/state`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        room: MOCK_ROOM,
        participants: [MOCK_PARTICIPANT, MOCK_PARTICIPANT_2],
        turnState: MOCK_TURN_STATE,
        suggestions: [MOCK_AI_SUGGESTION],
      }),
    }),
  );

  await page.route(`${API_BASE}/api/rooms/*`, (route) => {
    if (route.request().url().includes('/state')) return route.continue();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ room: MOCK_ROOM }),
    });
  });

  // ICE servers
  await page.route(`${API_BASE}/api/ice-servers`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_ICE_SERVERS),
    }),
  );

  // Metrics endpoint
  await page.route(`${API_BASE}/metrics`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: [
        '# HELP coffee_gathering_active_socket_connections Active connections',
        '# TYPE coffee_gathering_active_socket_connections gauge',
        'coffee_gathering_active_socket_connections 5',
        '# HELP coffee_gathering_active_rooms Active rooms',
        '# TYPE coffee_gathering_active_rooms gauge',
        'coffee_gathering_active_rooms{type="public"} 3',
        'coffee_gathering_active_rooms{type="private"} 2',
      ].join('\n'),
    }),
  );

  // Block actual Socket.IO connections (they'd fail without backend)
  await page.route(`${API_BASE}/socket.io/**`, (route) =>
    route.abort('connectionrefused'),
  );
}

/**
 * Mock API to return session creation failure
 */
export async function mockSessionCreationFailure(page: Page, status = 500): Promise<void> {
  await page.route(`${API_BASE}/api/sessions`, (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    }
    return route.continue();
  });
}

/**
 * Mock API to return rate limit response
 */
export async function mockRateLimited(page: Page, path: string): Promise<void> {
  await page.route(`${API_BASE}${path}`, (route) =>
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Too many requests, please try again later' }),
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 60),
      },
    }),
  );
}

/**
 * Mock room join that returns full state
 */
export async function mockRoomWithActiveTurn(page: Page): Promise<void> {
  const activeTurn = {
    ...MOCK_TURN_STATE,
    currentSpeakerId: MOCK_PARTICIPANT_2.id,
    status: 'active',
    startedAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 45 * 1000).toISOString(),
  };

  await page.route(`${API_BASE}/api/rooms/*/state`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        room: MOCK_ROOM,
        participants: [MOCK_PARTICIPANT, MOCK_PARTICIPANT_2],
        turnState: activeTurn,
        suggestions: [MOCK_AI_SUGGESTION],
      }),
    }),
  );
}

/**
 * Mock AI unavailable state
 */
export async function mockAIUnavailable(page: Page): Promise<void> {
  await page.route(`${API_BASE}/api/health`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok', aiAvailable: false }),
    }),
  );
}
