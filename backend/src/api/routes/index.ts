import { Router, Request, Response, NextFunction } from 'express';
import { createSession, validateSessionToken, verifyToken } from '../../services/auth';
import { createRoom, getRoom, getRoomParticipants, addParticipant, getRoomByInviteCode, activateRoom } from '../../services/room';
import { getTurnState } from '../../services/voice';
import { addToQueue, removeFromAllQueues, getQueuePosition } from '../../services/matching';
import { isAIAvailable } from '../../services/ai';
import {
  createSessionSchema,
  joinQueueSchema,
  createPrivateRoomSchema,
  joinPrivateRoomSchema,
} from '../../lib/validation';
import { sessionLimiter, queueLimiter, roomCreationLimiter } from '../../lib/rate-limit';
import { getIceServers } from '../../services/voice/ice-servers';
import { RoomType, RoomStatus, ParticipantRole, DrinkType } from '../../../../shared/types';
import type { GuestSession, MatchingEntry } from '../../../../shared/types';
import { PRIVATE_ROOM_MAX_PARTICIPANTS } from '../../../../shared/constants';

const router = Router();

// Middleware to extract session from JWT
async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  const session = await validateSessionToken(token);
  if (!session) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }

  (req as Request & { session: GuestSession }).session = session;
  next();
}

// Health check
router.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiAvailable: isAIAvailable(),
  });
});

// ICE servers for WebRTC
router.get('/api/ice-servers', requireAuth, (_req: Request, res: Response) => {
  res.json({ iceServers: getIceServers() });
});

// Create guest session
router.post('/api/sessions', sessionLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = createSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const result = await createSession(parsed.data.nickname);
    res.status(201).json(result);
  } catch (err) {
    console.error('[API] Create session error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get current session
router.get('/api/sessions/me', requireAuth, (req: Request, res: Response) => {
  const session = (req as Request & { session: GuestSession }).session;
  res.json({ session });
});

// Join matching queue
router.post('/api/queue/join', queueLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const parsed = joinQueueSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const session = (req as Request & { session: GuestSession }).session;
    const entry: MatchingEntry = {
      sessionId: session.id,
      nickname: session.nickname,
      drinkType: parsed.data.drinkType as DrinkType,
      topic: parsed.data.topic,
      joinedQueueAt: new Date().toISOString(),
    };

    const position = await addToQueue(entry);
    res.json({ position, estimatedWait: position * 10 });
  } catch (err) {
    console.error('[API] Join queue error:', err);
    res.status(500).json({ error: 'Failed to join queue' });
  }
});

// Leave matching queue
router.post('/api/queue/leave', requireAuth, async (req: Request, res: Response) => {
  try {
    const session = (req as Request & { session: GuestSession }).session;
    await removeFromAllQueues(session.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[API] Leave queue error:', err);
    res.status(500).json({ error: 'Failed to leave queue' });
  }
});

// Create private room
router.post('/api/rooms/private', roomCreationLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const parsed = createPrivateRoomSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const session = (req as Request & { session: GuestSession }).session;

    const room = await createRoom({
      type: RoomType.PRIVATE,
      drinkType: parsed.data.drinkType as DrinkType,
      topic: parsed.data.topic,
      maxParticipants: parsed.data.maxParticipants ?? PRIVATE_ROOM_MAX_PARTICIPANTS,
    });

    // Add creator as host
    await addParticipant({
      roomId: room.id,
      sessionId: session.id,
      nickname: session.nickname,
      avatarColor: session.avatarColor,
      role: ParticipantRole.HOST,
    });

    res.status(201).json({ room, inviteCode: room.inviteCode });
  } catch (err) {
    console.error('[API] Create private room error:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Join private room by invite code
router.post('/api/rooms/join', requireAuth, async (req: Request, res: Response) => {
  try {
    const parsed = joinPrivateRoomSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const room = await getRoomByInviteCode(parsed.data.inviteCode);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (room.status === RoomStatus.CLOSED || room.status === RoomStatus.CLOSING) {
      res.status(410).json({ error: 'Room is no longer available' });
      return;
    }

    const session = (req as Request & { session: GuestSession }).session;

    const participants = await getRoomParticipants(room.id);
    if (participants.length >= room.maxParticipants) {
      res.status(409).json({ error: 'Room is full' });
      return;
    }

    await addParticipant({
      roomId: room.id,
      sessionId: session.id,
      nickname: session.nickname,
      avatarColor: session.avatarColor,
      role: ParticipantRole.GUEST,
    });

    // Activate room if it was waiting
    if (room.status === RoomStatus.WAITING) {
      await activateRoom(room.id);
      room.status = RoomStatus.ACTIVE;
    }

    res.json({ room });
  } catch (err) {
    console.error('[API] Join room error:', err);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Get room details
router.get('/api/rooms/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const room = await getRoom(req.params.id as string);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    res.json({ room });
  } catch (err) {
    console.error('[API] Get room error:', err);
    res.status(500).json({ error: 'Failed to get room' });
  }
});

// Get full room state
router.get('/api/rooms/:id/state', requireAuth, async (req: Request, res: Response) => {
  try {
    const room = await getRoom(req.params.id as string);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const [participants, turnState] = await Promise.all([
      getRoomParticipants(room.id),
      getTurnState(room.id),
    ]);

    res.json({ room, participants, turnState, suggestions: [] });
  } catch (err) {
    console.error('[API] Get room state error:', err);
    res.status(500).json({ error: 'Failed to get room state' });
  }
});

export default router;
