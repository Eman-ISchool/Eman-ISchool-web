import { io, type Socket } from 'socket.io-client';
import type {
  JoinRoomPayload,
  LeaveRoomPayload,
  MuteTogglePayload,
  RequestTurnPayload,
  ReleaseTurnPayload,
  WebRTCSignalPayload,
  SendAudioPayload,
  JoinQueueRequest,
  RoomJoinedEvent,
  ParticipantJoinedEvent,
  ParticipantLeftEvent,
  ParticipantUpdatedEvent,
  TurnChangedEvent,
  TimerTickEvent,
  AISuggestionEvent,
  AIStatusEvent,
  ModerationWarningEvent,
  RoomClosingEvent,
  MatchFoundEvent,
  ErrorEvent,
} from '../../../shared/types';
import type { DrinkType } from '../../../shared/types';
import { SocketEvents } from '../../../shared/constants';

// ─── Configuration ──────────────────────────────────────────────

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3001';

// ─── Server-to-Client Event Map ─────────────────────────────────

export interface ServerToClientEvents {
  [SocketEvents.ROOM_JOINED]: (data: RoomJoinedEvent) => void;
  [SocketEvents.PARTICIPANT_JOINED]: (data: ParticipantJoinedEvent) => void;
  [SocketEvents.PARTICIPANT_LEFT]: (data: ParticipantLeftEvent) => void;
  [SocketEvents.PARTICIPANT_UPDATED]: (data: ParticipantUpdatedEvent) => void;
  [SocketEvents.TURN_CHANGED]: (data: TurnChangedEvent) => void;
  [SocketEvents.TIMER_TICK]: (data: TimerTickEvent) => void;
  [SocketEvents.AI_SUGGESTION]: (data: AISuggestionEvent) => void;
  [SocketEvents.AI_STATUS]: (data: AIStatusEvent) => void;
  [SocketEvents.MODERATION_WARNING]: (data: ModerationWarningEvent) => void;
  [SocketEvents.ROOM_CLOSING]: (data: RoomClosingEvent) => void;
  [SocketEvents.ROOM_CLOSED]: () => void;
  [SocketEvents.MATCH_FOUND]: (data: MatchFoundEvent) => void;
  [SocketEvents.QUEUE_UPDATE]: (data: { position: number }) => void;
  [SocketEvents.ERROR]: (data: ErrorEvent) => void;
  [SocketEvents.WEBRTC_SIGNAL_RELAY]: (data: WebRTCSignalPayload) => void;
}

// ─── Singleton Socket Manager ───────────────────────────────────

let socketInstance: Socket | null = null;

export function getSocket(): Socket | null {
  return socketInstance;
}

export function connect(token: string): Socket {
  if (socketInstance?.connected) {
    return socketInstance;
  }

  // Disconnect previous instance if any
  if (socketInstance) {
    socketInstance.disconnect();
  }

  socketInstance = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socketInstance;
}

export function disconnect(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

// ─── Client → Server Emitters ───────────────────────────────────

export function joinRoom(roomId: string, token: string): void {
  const payload: JoinRoomPayload = { roomId, sessionToken: token };
  socketInstance?.emit(SocketEvents.JOIN_ROOM, payload);
}

export function leaveRoom(roomId: string): void {
  const payload: LeaveRoomPayload = { roomId };
  socketInstance?.emit(SocketEvents.LEAVE_ROOM, payload);
}

export function toggleMute(roomId: string, isMuted: boolean): void {
  const payload: MuteTogglePayload = { roomId, isMuted };
  socketInstance?.emit(SocketEvents.MUTE_TOGGLE, payload);
}

export function requestTurn(roomId: string): void {
  const payload: RequestTurnPayload = { roomId };
  socketInstance?.emit(SocketEvents.REQUEST_TURN, payload);
}

export function releaseTurn(roomId: string): void {
  const payload: ReleaseTurnPayload = { roomId };
  socketInstance?.emit(SocketEvents.RELEASE_TURN, payload);
}

export function sendWebRTCSignal(
  roomId: string,
  targetPeerId: string,
  signal: WebRTCSignalPayload['signal'],
): void {
  const payload: WebRTCSignalPayload = { roomId, targetPeerId, signal };
  socketInstance?.emit(SocketEvents.WEBRTC_SIGNAL, payload);
}

export function sendAudio(
  roomId: string,
  audioData: ArrayBuffer,
  sampleRate: number,
): void {
  const payload: SendAudioPayload = { roomId, audioData, sampleRate };
  socketInstance?.emit(SocketEvents.SEND_AUDIO, payload);
}

export function joinQueue(drinkType: DrinkType, topic: string): void {
  const payload: JoinQueueRequest = { drinkType, topic };
  socketInstance?.emit(SocketEvents.JOIN_QUEUE, payload);
}

export function leaveQueue(): void {
  socketInstance?.emit(SocketEvents.LEAVE_QUEUE);
}

// ─── Event Helpers ──────────────────────────────────────────────

export function onEvent<K extends keyof ServerToClientEvents>(
  event: K,
  handler: ServerToClientEvents[K],
): void {
  socketInstance?.on(event as string, handler as (...args: unknown[]) => void);
}

export function offEvent<K extends keyof ServerToClientEvents>(
  event: K,
  handler?: ServerToClientEvents[K],
): void {
  if (handler) {
    socketInstance?.off(event as string, handler as (...args: unknown[]) => void);
  } else {
    socketInstance?.off(event as string);
  }
}
