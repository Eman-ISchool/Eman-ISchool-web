// Shared types for Online Coffee Gathering

// ─── Enums ───────────────────────────────────────────────────────

export enum DrinkType {
  COFFEE = 'coffee',
  TEA = 'tea',
  OTHER = 'other',
}

export enum RoomStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  CLOSING = 'closing',
  CLOSED = 'closed',
}

export enum RoomType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum ParticipantRole {
  HOST = 'host',
  GUEST = 'guest',
}

export enum ParticipantStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
}

export enum TurnStatus {
  IDLE = 'idle',
  ACTIVE = 'active',
  TRANSITIONING = 'transitioning',
}

export enum ModerationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ViolationType {
  PROFANITY = 'profanity',
  HATE_SPEECH = 'hate_speech',
  SPAM = 'spam',
  OFF_TOPIC = 'off_topic',
  HARASSMENT = 'harassment',
}

// ─── Core Models ─────────────────────────────────────────────────

export interface GuestSession {
  id: string;
  nickname: string;
  avatarColor: string;
  createdAt: string;
  expiresAt: string;
}

export interface Room {
  id: string;
  type: RoomType;
  status: RoomStatus;
  drinkType: DrinkType;
  topic: string;
  inviteCode: string | null;
  maxParticipants: number;
  createdAt: string;
  closedAt: string | null;
}

export interface Participant {
  id: string;
  sessionId: string;
  roomId: string;
  nickname: string;
  avatarColor: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  isMuted: boolean;
  isSpeaking: boolean;
  joinedAt: string;
  leftAt: string | null;
}

export interface TurnState {
  roomId: string;
  currentSpeakerId: string | null;
  status: TurnStatus;
  startedAt: string | null;
  endsAt: string | null;
  queue: string[]; // participant IDs in order
}

export interface ModerationEvent {
  id: string;
  roomId: string;
  participantId: string;
  type: ViolationType;
  severity: ModerationSeverity;
  content: string;
  aiConfidence: number;
  actionTaken: string;
  createdAt: string;
}

export interface AISuggestion {
  id: string;
  roomId: string;
  content: string;
  type: 'question' | 'topic_pivot' | 'fun_fact' | 'icebreaker';
  createdAt: string;
}

export interface MatchingEntry {
  sessionId: string;
  nickname: string;
  drinkType: DrinkType;
  topic: string;
  joinedQueueAt: string;
}

// ─── API Request/Response Types ──────────────────────────────────

export interface CreateSessionRequest {
  nickname: string;
}

export interface CreateSessionResponse {
  session: GuestSession;
  token: string;
}

export interface JoinQueueRequest {
  drinkType: DrinkType;
  topic: string;
}

export interface JoinQueueResponse {
  position: number;
  estimatedWait: number; // seconds
}

export interface CreatePrivateRoomRequest {
  drinkType: DrinkType;
  topic: string;
  maxParticipants?: number;
}

export interface CreatePrivateRoomResponse {
  room: Room;
  inviteCode: string;
}

export interface JoinPrivateRoomRequest {
  inviteCode: string;
}

export interface JoinPrivateRoomResponse {
  room: Room;
}

export interface RoomStateResponse {
  room: Room;
  participants: Participant[];
  turnState: TurnState;
  suggestions: AISuggestion[];
}

// ─── Socket Event Payloads ───────────────────────────────────────

export interface JoinRoomPayload {
  roomId: string;
  sessionToken: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

export interface MuteTogglePayload {
  roomId: string;
  isMuted: boolean;
}

export interface RequestTurnPayload {
  roomId: string;
}

export interface ReleaseTurnPayload {
  roomId: string;
}

export interface SendAudioPayload {
  roomId: string;
  audioData: ArrayBuffer;
  sampleRate: number;
}

export interface WebRTCSignalPayload {
  roomId: string;
  targetPeerId: string;
  signal: RTCOfferPayload | RTCAnswerPayload | RTCIceCandidatePayload;
}

export interface RTCOfferPayload {
  type: 'offer';
  sdp: string;
}

export interface RTCAnswerPayload {
  type: 'answer';
  sdp: string;
}

export interface RTCIceCandidatePayload {
  type: 'ice-candidate';
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
}

// ─── Socket Event Server → Client ───────────────────────────────

export interface RoomJoinedEvent {
  room: Room;
  participants: Participant[];
  turnState: TurnState;
  suggestions: AISuggestion[];
}

export interface ParticipantJoinedEvent {
  participant: Participant;
}

export interface ParticipantLeftEvent {
  participantId: string;
  nickname: string;
}

export interface ParticipantUpdatedEvent {
  participantId: string;
  updates: Partial<Pick<Participant, 'isMuted' | 'isSpeaking' | 'status'>>;
}

export interface TurnChangedEvent {
  turnState: TurnState;
}

export interface TimerTickEvent {
  roomId: string;
  remainingSeconds: number;
}

export interface AISuggestionEvent {
  suggestion: AISuggestion;
}

export interface ModerationWarningEvent {
  participantId: string;
  message: string;
  severity: ModerationSeverity;
}

export interface RoomClosingEvent {
  reason: string;
  closesAt: string;
}

export interface MatchFoundEvent {
  roomId: string;
}

export interface ErrorEvent {
  code: string;
  message: string;
}

export interface AIStatusEvent {
  available: boolean;
}
