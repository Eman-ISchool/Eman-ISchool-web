// Shared constants for Online Coffee Gathering

import { DrinkType } from '../types';

// ─── Room Limits ─────────────────────────────────────────────────

export const PUBLIC_ROOM_MIN_PARTICIPANTS = 3;
export const PUBLIC_ROOM_MAX_PARTICIPANTS = 6;
export const PRIVATE_ROOM_MIN_PARTICIPANTS = 2;
export const PRIVATE_ROOM_MAX_PARTICIPANTS = 12;
export const SFU_THRESHOLD = 4; // Switch from P2P to SFU above this

// ─── Timer / Turn ────────────────────────────────────────────────

export const TURN_DURATION_SECONDS = 60;
export const TURN_WARNING_SECONDS = 10;
export const TURN_TRANSITION_MS = 1000;
export const TIMER_TICK_INTERVAL_MS = 1000;

// ─── Matching ────────────────────────────────────────────────────

export const MATCHING_INTERVAL_MS = 3000;
export const MATCHING_MAX_WAIT_SECONDS = 120;
export const MATCHING_QUEUE_KEY = 'coffee:matching:queue';

// ─── Session ─────────────────────────────────────────────────────

export const SESSION_DURATION_HOURS = 24;
export const SESSION_TOKEN_PREFIX = 'coffee:session:';
export const RECONNECT_GRACE_PERIOD_MS = 30000;
export const HEARTBEAT_INTERVAL_MS = 15000;
export const HEARTBEAT_TIMEOUT_MS = 45000;

// ─── AI / STT ────────────────────────────────────────────────────

export const AI_SUGGESTION_INTERVAL_MS = 45000;
export const AI_SUGGESTION_TIMEOUT_MS = 5000;
export const AI_MODERATION_TIMEOUT_MS = 3000;
export const STT_MAX_AUDIO_DURATION_MS = 30000;
export const STT_TIMEOUT_MS = 5000;
export const AI_MAX_RETRIES = 2;

// ─── Drink Options ───────────────────────────────────────────────

export const DRINK_OPTIONS: { value: DrinkType; label: string; emoji: string }[] = [
  { value: DrinkType.COFFEE, label: 'Coffee', emoji: '☕' },
  { value: DrinkType.TEA, label: 'Tea', emoji: '🍵' },
  { value: DrinkType.OTHER, label: 'Other', emoji: '🥤' },
];

// ─── Default Topics ──────────────────────────────────────────────

export const DEFAULT_TOPICS = [
  'Technology & Innovation',
  'Travel & Culture',
  'Books & Learning',
  'Food & Cooking',
  'Music & Arts',
  'Science & Nature',
  'Sports & Fitness',
  'Movies & Entertainment',
  'Business & Startups',
  'Philosophy & Life',
  'Gaming',
  'Random Chat',
] as const;

// ─── Socket Event Names ─────────────────────────────────────────

export const SocketEvents = {
  // Client → Server
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',
  MUTE_TOGGLE: 'room:mute-toggle',
  REQUEST_TURN: 'turn:request',
  RELEASE_TURN: 'turn:release',
  SEND_AUDIO: 'audio:send',
  WEBRTC_SIGNAL: 'webrtc:signal',
  JOIN_QUEUE: 'queue:join',
  LEAVE_QUEUE: 'queue:leave',
  HEARTBEAT: 'heartbeat',

  // Server → Client
  ROOM_JOINED: 'room:joined',
  PARTICIPANT_JOINED: 'room:participant-joined',
  PARTICIPANT_LEFT: 'room:participant-left',
  PARTICIPANT_UPDATED: 'room:participant-updated',
  TURN_CHANGED: 'turn:changed',
  TIMER_TICK: 'turn:timer-tick',
  AI_SUGGESTION: 'ai:suggestion',
  AI_STATUS: 'ai:status',
  MODERATION_WARNING: 'moderation:warning',
  ROOM_CLOSING: 'room:closing',
  ROOM_CLOSED: 'room:closed',
  MATCH_FOUND: 'queue:match-found',
  QUEUE_UPDATE: 'queue:update',
  ERROR: 'error',
  WEBRTC_SIGNAL_RELAY: 'webrtc:signal-relay',
} as const;

// ─── Redis Keys ──────────────────────────────────────────────────

export const RedisKeys = {
  room: (id: string) => `coffee:room:${id}`,
  roomParticipants: (id: string) => `coffee:room:${id}:participants`,
  roomTurn: (id: string) => `coffee:room:${id}:turn`,
  session: (id: string) => `coffee:session:${id}`,
  matchingQueue: (drink: string, topic: string) => `coffee:queue:${drink}:${topic}`,
  matchingQueueAll: () => 'coffee:queue:*',
  activeRooms: () => 'coffee:rooms:active',
} as const;

// ─── API Routes ──────────────────────────────────────────────────

export const ApiRoutes = {
  CREATE_SESSION: '/api/sessions',
  GET_SESSION: '/api/sessions/me',
  JOIN_QUEUE: '/api/queue/join',
  LEAVE_QUEUE: '/api/queue/leave',
  CREATE_PRIVATE_ROOM: '/api/rooms/private',
  JOIN_PRIVATE_ROOM: '/api/rooms/join',
  GET_ROOM: '/api/rooms/:id',
  GET_ROOM_STATE: '/api/rooms/:id/state',
  HEALTH: '/api/health',
} as const;

// ─── Invite Code ─────────────────────────────────────────────────

export const INVITE_CODE_LENGTH = 8;
export const INVITE_CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars

// ─── Validation ──────────────────────────────────────────────────

export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 20;
export const TOPIC_MIN_LENGTH = 2;
export const TOPIC_MAX_LENGTH = 100;
