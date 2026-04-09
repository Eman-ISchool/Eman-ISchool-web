import { v4 as uuidv4 } from 'uuid';
import prisma from '../../lib/prisma';
import { getRedis } from '../../lib/redis';
import { RedisKeys, INVITE_CODE_CHARSET, INVITE_CODE_LENGTH, PUBLIC_ROOM_MAX_PARTICIPANTS } from '../../../../shared/constants';
import { RoomStatus, RoomType, ParticipantRole, ParticipantStatus, DrinkType } from '../../../../shared/types';
import type { Room, Participant, TurnState } from '../../../../shared/types';

function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_CHARSET[Math.floor(Math.random() * INVITE_CODE_CHARSET.length)];
  }
  return code;
}

export async function createRoom(params: {
  type: RoomType;
  drinkType: DrinkType;
  topic: string;
  maxParticipants: number;
}): Promise<Room> {
  const inviteCode = params.type === RoomType.PRIVATE ? generateInviteCode() : null;

  const room = await prisma.room.create({
    data: {
      type: params.type.toUpperCase() as 'PUBLIC' | 'PRIVATE',
      status: params.type === RoomType.PRIVATE ? 'WAITING' : 'ACTIVE',
      drinkType: params.drinkType.toUpperCase() as 'COFFEE' | 'TEA' | 'OTHER',
      topic: params.topic,
      inviteCode,
      maxParticipants: params.maxParticipants,
    },
  });

  const redis = getRedis();
  const roomData: Room = mapRoom(room);
  await redis.set(RedisKeys.room(room.id), JSON.stringify(roomData), 'EX', 86400);
  await redis.sadd(RedisKeys.activeRooms(), room.id);

  return roomData;
}

export async function getRoom(roomId: string): Promise<Room | null> {
  const redis = getRedis();
  const cached = await redis.get(RedisKeys.room(roomId));
  if (cached) return JSON.parse(cached);

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return null;

  const mapped = mapRoom(room);
  await redis.set(RedisKeys.room(roomId), JSON.stringify(mapped), 'EX', 86400);
  return mapped;
}

export async function getRoomByInviteCode(inviteCode: string): Promise<Room | null> {
  const room = await prisma.room.findUnique({
    where: { inviteCode },
  });
  if (!room) return null;
  return mapRoom(room);
}

export async function addParticipant(params: {
  roomId: string;
  sessionId: string;
  nickname: string;
  avatarColor: string;
  role: ParticipantRole;
}): Promise<Participant> {
  // Check if participant already exists (rejoin)
  const existing = await prisma.roomParticipant.findFirst({
    where: {
      roomId: params.roomId,
      sessionId: params.sessionId,
      leftAt: null,
    },
  });

  if (existing) {
    return mapParticipant(existing);
  }

  // Check room capacity
  const count = await prisma.roomParticipant.count({
    where: { roomId: params.roomId, leftAt: null },
  });

  const room = await getRoom(params.roomId);
  if (!room) throw new Error('Room not found');
  if (count >= room.maxParticipants) throw new Error('Room is full');

  const participant = await prisma.roomParticipant.create({
    data: {
      roomId: params.roomId,
      sessionId: params.sessionId,
      nickname: params.nickname,
      avatarColor: params.avatarColor,
      role: params.role.toUpperCase() as 'HOST' | 'GUEST',
    },
  });

  // Cache participant in Redis
  const redis = getRedis();
  const mapped = mapParticipant(participant);
  await redis.hset(
    RedisKeys.roomParticipants(params.roomId),
    participant.id,
    JSON.stringify(mapped),
  );

  return mapped;
}

export async function removeParticipant(roomId: string, participantId: string): Promise<void> {
  await prisma.roomParticipant.update({
    where: { id: participantId },
    data: { leftAt: new Date() },
  });

  const redis = getRedis();
  await redis.hdel(RedisKeys.roomParticipants(roomId), participantId);

  // Check remaining participants
  const remaining = await prisma.roomParticipant.count({
    where: { roomId, leftAt: null },
  });

  if (remaining === 0) {
    await closeRoom(roomId, 'All participants left');
  }
}

export async function getRoomParticipants(roomId: string): Promise<Participant[]> {
  const redis = getRedis();
  const cached = await redis.hgetall(RedisKeys.roomParticipants(roomId));

  if (cached && Object.keys(cached).length > 0) {
    return Object.values(cached).map((v) => JSON.parse(v));
  }

  const participants = await prisma.roomParticipant.findMany({
    where: { roomId, leftAt: null },
  });

  const mapped = participants.map(mapParticipant);

  // Re-cache
  if (mapped.length > 0) {
    const pipeline = redis.pipeline();
    for (const p of mapped) {
      pipeline.hset(RedisKeys.roomParticipants(roomId), p.id, JSON.stringify(p));
    }
    await pipeline.exec();
  }

  return mapped;
}

export async function updateParticipant(
  roomId: string,
  participantId: string,
  updates: Partial<Pick<Participant, 'isMuted' | 'isSpeaking' | 'status'>>,
): Promise<void> {
  const redis = getRedis();
  const cached = await redis.hget(RedisKeys.roomParticipants(roomId), participantId);
  if (cached) {
    const participant = JSON.parse(cached);
    Object.assign(participant, updates);
    await redis.hset(RedisKeys.roomParticipants(roomId), participantId, JSON.stringify(participant));
  }

  if (updates.isMuted !== undefined) {
    await prisma.roomParticipant.update({
      where: { id: participantId },
      data: { isMuted: updates.isMuted },
    });
  }
}

export async function closeRoom(roomId: string, reason: string): Promise<void> {
  await prisma.room.update({
    where: { id: roomId },
    data: { status: 'CLOSED', closedAt: new Date() },
  });

  // Mark all participants as left
  await prisma.roomParticipant.updateMany({
    where: { roomId, leftAt: null },
    data: { leftAt: new Date() },
  });

  const redis = getRedis();
  await redis.del(RedisKeys.room(roomId));
  await redis.del(RedisKeys.roomParticipants(roomId));
  await redis.del(RedisKeys.roomTurn(roomId));
  await redis.srem(RedisKeys.activeRooms(), roomId);

  await prisma.auditLog.create({
    data: { roomId, action: 'room_closed', details: { reason } },
  });
}

export async function activateRoom(roomId: string): Promise<void> {
  await prisma.room.update({
    where: { id: roomId },
    data: { status: 'ACTIVE' },
  });

  const redis = getRedis();
  const cached = await redis.get(RedisKeys.room(roomId));
  if (cached) {
    const room = JSON.parse(cached);
    room.status = RoomStatus.ACTIVE;
    await redis.set(RedisKeys.room(roomId), JSON.stringify(room), 'EX', 86400);
  }
}

export async function getParticipantBySession(roomId: string, sessionId: string): Promise<Participant | null> {
  const participant = await prisma.roomParticipant.findFirst({
    where: { roomId, sessionId, leftAt: null },
  });
  return participant ? mapParticipant(participant) : null;
}

function mapRoom(room: {
  id: string;
  type: string;
  status: string;
  drinkType: string;
  topic: string;
  inviteCode: string | null;
  maxParticipants: number;
  createdAt: Date;
  closedAt: Date | null;
}): Room {
  return {
    id: room.id,
    type: room.type.toLowerCase() as RoomType,
    status: room.status.toLowerCase() as RoomStatus,
    drinkType: room.drinkType.toLowerCase() as DrinkType,
    topic: room.topic,
    inviteCode: room.inviteCode,
    maxParticipants: room.maxParticipants,
    createdAt: room.createdAt.toISOString(),
    closedAt: room.closedAt?.toISOString() ?? null,
  };
}

function mapParticipant(p: {
  id: string;
  sessionId: string;
  roomId: string;
  nickname: string;
  avatarColor: string;
  role: string;
  isMuted: boolean;
  joinedAt: Date;
  leftAt: Date | null;
}): Participant {
  return {
    id: p.id,
    sessionId: p.sessionId,
    roomId: p.roomId,
    nickname: p.nickname,
    avatarColor: p.avatarColor,
    role: p.role.toLowerCase() as ParticipantRole,
    status: ParticipantStatus.CONNECTED,
    isMuted: p.isMuted,
    isSpeaking: false,
    joinedAt: p.joinedAt.toISOString(),
    leftAt: p.leftAt?.toISOString() ?? null,
  };
}
