import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { validateSessionToken, verifyToken } from '../../services/auth';
import {
  getRoom,
  addParticipant,
  removeParticipant,
  getRoomParticipants,
  updateParticipant,
  getParticipantBySession,
  closeRoom,
} from '../../services/room';
import {
  getTurnState,
  requestTurn,
  releaseTurn,
  removeParticipantFromTurn,
  initializeTurnState,
  setTurnCallbacks,
  cleanupRoomTimers,
} from '../../services/voice';
import { generateSuggestion, moderateContent, isAIAvailable } from '../../services/ai';
import { queueAudioChunk, clearAudioBuffer } from '../../services/stt';
import { addToQueue, removeFromAllQueues, setMatchCallback } from '../../services/matching';
import { joinRoomSocketSchema, muteToggleSchema, roomIdSchema } from '../../lib/validation';
import { SocketEvents, RECONNECT_GRACE_PERIOD_MS, AI_SUGGESTION_INTERVAL_MS, HEARTBEAT_TIMEOUT_MS } from '../../../../shared/constants';
import { RoomStatus, ParticipantRole, ParticipantStatus, DrinkType } from '../../../../shared/types';
import type { GuestSession, TurnState, Participant, MatchingEntry } from '../../../../shared/types';
import { checkSocketRateLimit } from '../../lib/rate-limit';
import { trackSocketConnection, trackSocketDisconnection, trackRoomJoin, trackRoomLeave } from '../../lib/metrics';

interface AuthenticatedSocket extends Socket {
  session?: GuestSession;
  currentRoomId?: string;
  currentParticipantId?: string;
  heartbeatTimer?: ReturnType<typeof setTimeout>;
}

// Track disconnected users for reconnect grace period
const disconnectedUsers = new Map<string, { roomId: string; participantId: string; timeout: ReturnType<typeof setTimeout> }>();

// AI suggestion intervals per room
const aiIntervals = new Map<string, ReturnType<typeof setInterval>>();

export function setupSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  // Turn state callbacks
  setTurnCallbacks(
    // On tick
    (roomId, remainingSeconds) => {
      io.to(roomId).emit(SocketEvents.TIMER_TICK, { roomId, remainingSeconds });
    },
    // On turn changed
    (roomId, turnState) => {
      io.to(roomId).emit(SocketEvents.TURN_CHANGED, { turnState });
    },
  );

  // Match callback
  setMatchCallback((entries: MatchingEntry[], room) => {
    for (const entry of entries) {
      // Find socket for this session
      const sockets = io.sockets.sockets;
      for (const [, socket] of sockets) {
        const authSocket = socket as AuthenticatedSocket;
        if (authSocket.session?.id === entry.sessionId) {
          authSocket.emit(SocketEvents.MATCH_FOUND, { roomId: room.id });
          break;
        }
      }
    }
  });

  // Rate limit middleware
  io.use((socket: Socket, next) => {
    const ip = socket.handshake.address;
    if (!checkSocketRateLimit(ip)) {
      return next(new Error('Too many connections, please try again later'));
    }
    next();
  });

  // Authentication middleware
  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const session = await validateSessionToken(token);
    if (!session) {
      return next(new Error('Invalid or expired session'));
    }

    (socket as AuthenticatedSocket).session = session;
    next();
  });

  io.on('connection', (rawSocket: Socket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const session = socket.session!;

    console.log(`[Socket] Connected: ${session.nickname} (${session.id})`);
    trackSocketConnection();

    // Check if this is a reconnect
    const disconnectInfo = disconnectedUsers.get(session.id);
    if (disconnectInfo) {
      clearTimeout(disconnectInfo.timeout);
      disconnectedUsers.delete(session.id);
      console.log(`[Socket] Reconnected: ${session.nickname} to room ${disconnectInfo.roomId}`);

      // Auto-rejoin room
      handleJoinRoom(io, socket, {
        roomId: disconnectInfo.roomId,
        sessionToken: socket.handshake.auth.token,
      });
    }

    // Setup heartbeat
    resetHeartbeat(socket);

    socket.on(SocketEvents.HEARTBEAT, () => {
      resetHeartbeat(socket);
    });

    // Join room
    socket.on(SocketEvents.JOIN_ROOM, (payload: unknown) => {
      const parsed = joinRoomSocketSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit(SocketEvents.ERROR, { code: 'INVALID_PAYLOAD', message: parsed.error.errors[0].message });
        return;
      }
      handleJoinRoom(io, socket, parsed.data);
    });

    // Leave room
    socket.on(SocketEvents.LEAVE_ROOM, (payload: unknown) => {
      const parsed = roomIdSchema.safeParse(payload);
      if (!parsed.success) return;
      handleLeaveRoom(io, socket, parsed.data.roomId);
    });

    // Mute toggle
    socket.on(SocketEvents.MUTE_TOGGLE, async (payload: unknown) => {
      const parsed = muteToggleSchema.safeParse(payload);
      if (!parsed.success) return;

      if (socket.currentParticipantId && socket.currentRoomId) {
        await updateParticipant(parsed.data.roomId, socket.currentParticipantId, {
          isMuted: parsed.data.isMuted,
        });
        io.to(parsed.data.roomId).emit(SocketEvents.PARTICIPANT_UPDATED, {
          participantId: socket.currentParticipantId,
          updates: { isMuted: parsed.data.isMuted },
        });
      }
    });

    // Request turn
    socket.on(SocketEvents.REQUEST_TURN, async (payload: unknown) => {
      const parsed = roomIdSchema.safeParse(payload);
      if (!parsed.success) return;

      if (socket.currentParticipantId) {
        const turnState = await requestTurn(parsed.data.roomId, socket.currentParticipantId);
        io.to(parsed.data.roomId).emit(SocketEvents.TURN_CHANGED, { turnState });
      }
    });

    // Release turn
    socket.on(SocketEvents.RELEASE_TURN, async (payload: unknown) => {
      const parsed = roomIdSchema.safeParse(payload);
      if (!parsed.success) return;

      if (socket.currentParticipantId) {
        const turnState = await releaseTurn(parsed.data.roomId, socket.currentParticipantId);
        io.to(parsed.data.roomId).emit(SocketEvents.TURN_CHANGED, { turnState });
      }
    });

    // WebRTC signaling
    socket.on(SocketEvents.WEBRTC_SIGNAL, (payload: { roomId: string; targetPeerId: string; signal: unknown }) => {
      if (!payload.roomId || !payload.targetPeerId || !payload.signal) return;

      // Find target socket and relay
      const sockets = io.sockets.sockets;
      for (const [, s] of sockets) {
        const targetSocket = s as AuthenticatedSocket;
        if (targetSocket.currentParticipantId === payload.targetPeerId) {
          targetSocket.emit(SocketEvents.WEBRTC_SIGNAL_RELAY, {
            fromPeerId: socket.currentParticipantId,
            signal: payload.signal,
          });
          break;
        }
      }
    });

    // Audio for STT
    socket.on(SocketEvents.SEND_AUDIO, (payload: { roomId: string; audioData: ArrayBuffer; sampleRate: number }) => {
      if (!socket.currentParticipantId || !socket.currentRoomId) return;

      const buffer = Buffer.from(payload.audioData);
      queueAudioChunk(
        payload.roomId,
        socket.currentParticipantId,
        buffer,
        async (text) => {
          // Moderate the transcribed text
          const modResult = await moderateContent(text);
          if (modResult.flagged) {
            socket.emit(SocketEvents.MODERATION_WARNING, {
              participantId: socket.currentParticipantId,
              message: modResult.reason,
              severity: modResult.severity,
            });
          }
        },
      );
    });

    // Queue events
    socket.on(SocketEvents.JOIN_QUEUE, async (payload: { drinkType: string; topic: string }) => {
      if (!session) return;
      try {
        const entry: MatchingEntry = {
          sessionId: session.id,
          nickname: session.nickname,
          drinkType: payload.drinkType as DrinkType,
          topic: payload.topic,
          joinedQueueAt: new Date().toISOString(),
        };
        const position = await addToQueue(entry);
        socket.emit(SocketEvents.QUEUE_UPDATE, { position, estimatedWait: position * 10 });
      } catch (err) {
        socket.emit(SocketEvents.ERROR, { code: 'QUEUE_ERROR', message: 'Failed to join queue' });
      }
    });

    socket.on(SocketEvents.LEAVE_QUEUE, async () => {
      if (!session) return;
      await removeFromAllQueues(session.id);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${session.nickname}`);
      trackSocketDisconnection();
      clearHeartbeatTimer(socket);

      if (socket.currentRoomId && socket.currentParticipantId) {
        const roomId = socket.currentRoomId;
        const participantId = socket.currentParticipantId;

        // Mark as disconnected but give grace period
        updateParticipant(roomId, participantId, {
          status: ParticipantStatus.RECONNECTING,
        }).then(() => {
          io.to(roomId).emit(SocketEvents.PARTICIPANT_UPDATED, {
            participantId,
            updates: { status: ParticipantStatus.RECONNECTING },
          });
        });

        const timeout = setTimeout(async () => {
          disconnectedUsers.delete(session.id);
          await handleLeaveRoom(io, socket, roomId);
        }, RECONNECT_GRACE_PERIOD_MS);

        disconnectedUsers.set(session.id, { roomId, participantId, timeout });
      }
    });
  });

  return io;
}

async function handleJoinRoom(
  io: SocketServer,
  socket: AuthenticatedSocket,
  data: { roomId: string; sessionToken: string },
): Promise<void> {
  const session = socket.session!;

  try {
    const room = await getRoom(data.roomId);
    if (!room) {
      socket.emit(SocketEvents.ERROR, { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
      return;
    }

    if (room.status === RoomStatus.CLOSED) {
      socket.emit(SocketEvents.ERROR, { code: 'ROOM_CLOSED', message: 'Room is closed' });
      return;
    }

    // Add or re-add participant
    let participant: Participant;
    const existing = await getParticipantBySession(room.id, session.id);
    if (existing) {
      participant = existing;
      await updateParticipant(room.id, existing.id, { status: ParticipantStatus.CONNECTED });
    } else {
      participant = await addParticipant({
        roomId: room.id,
        sessionId: session.id,
        nickname: session.nickname,
        avatarColor: session.avatarColor,
        role: ParticipantRole.GUEST,
      });
    }

    socket.currentRoomId = room.id;
    socket.currentParticipantId = participant.id;
    socket.join(room.id);

    const [participants, turnState] = await Promise.all([
      getRoomParticipants(room.id),
      getTurnState(room.id),
    ]);

    // Send full state to joining user
    socket.emit(SocketEvents.ROOM_JOINED, {
      room,
      participants,
      turnState,
      suggestions: [],
    });

    // Notify others
    socket.to(room.id).emit(SocketEvents.PARTICIPANT_JOINED, { participant });

    // Send AI status
    socket.emit(SocketEvents.AI_STATUS, { available: isAIAvailable() });

    // Start AI suggestion loop if not already running
    startAISuggestionLoop(io, room.id, room.topic);
  } catch (err) {
    console.error('[Socket] Join room error:', err);
    socket.emit(SocketEvents.ERROR, { code: 'JOIN_ERROR', message: 'Failed to join room' });
  }
}

async function handleLeaveRoom(
  io: SocketServer,
  socket: AuthenticatedSocket,
  roomId: string,
): Promise<void> {
  if (!socket.currentParticipantId) return;

  try {
    const participantId = socket.currentParticipantId;
    const nickname = socket.session?.nickname || 'Unknown';

    // Clean up turn state
    await removeParticipantFromTurn(roomId, participantId);

    // Clean up STT buffer
    clearAudioBuffer(roomId, participantId);

    // Remove participant
    await removeParticipant(roomId, participantId);

    socket.leave(roomId);
    socket.currentRoomId = undefined;
    socket.currentParticipantId = undefined;

    io.to(roomId).emit(SocketEvents.PARTICIPANT_LEFT, { participantId, nickname });

    // Check if room is empty → clean up AI interval
    const remaining = await getRoomParticipants(roomId);
    if (remaining.length === 0) {
      stopAISuggestionLoop(roomId);
      cleanupRoomTimers(roomId);
    }
  } catch (err) {
    console.error('[Socket] Leave room error:', err);
  }
}

function startAISuggestionLoop(io: SocketServer, roomId: string, topic: string): void {
  if (aiIntervals.has(roomId)) return;

  const interval = setInterval(async () => {
    try {
      const suggestion = await generateSuggestion(topic, '', 0);
      if (suggestion) {
        suggestion.roomId = roomId;
        io.to(roomId).emit(SocketEvents.AI_SUGGESTION, { suggestion });
      }
    } catch (err) {
      console.error(`[AI] Suggestion error for room ${roomId}:`, err);
    }
  }, AI_SUGGESTION_INTERVAL_MS);

  aiIntervals.set(roomId, interval);
}

function stopAISuggestionLoop(roomId: string): void {
  const interval = aiIntervals.get(roomId);
  if (interval) {
    clearInterval(interval);
    aiIntervals.delete(roomId);
  }
}

function resetHeartbeat(socket: AuthenticatedSocket): void {
  clearHeartbeatTimer(socket);
  socket.heartbeatTimer = setTimeout(() => {
    console.log(`[Socket] Heartbeat timeout for ${socket.session?.nickname}`);
    socket.disconnect(true);
  }, HEARTBEAT_TIMEOUT_MS);
}

function clearHeartbeatTimer(socket: AuthenticatedSocket): void {
  if (socket.heartbeatTimer) {
    clearTimeout(socket.heartbeatTimer);
    socket.heartbeatTimer = undefined;
  }
}
