import { z } from 'zod';
import {
  NICKNAME_MIN_LENGTH,
  NICKNAME_MAX_LENGTH,
  TOPIC_MIN_LENGTH,
  TOPIC_MAX_LENGTH,
  PRIVATE_ROOM_MIN_PARTICIPANTS,
  PRIVATE_ROOM_MAX_PARTICIPANTS,
  INVITE_CODE_LENGTH,
} from '../../../shared/constants';

export const nicknameSchema = z
  .string()
  .trim()
  .min(NICKNAME_MIN_LENGTH, `Nickname must be at least ${NICKNAME_MIN_LENGTH} characters`)
  .max(NICKNAME_MAX_LENGTH, `Nickname must be at most ${NICKNAME_MAX_LENGTH} characters`)
  .regex(/^[a-zA-Z0-9\s_-]+$/, 'Nickname can only contain letters, numbers, spaces, hyphens, and underscores');

export const drinkTypeSchema = z.enum(['coffee', 'tea', 'other']);

export const topicSchema = z
  .string()
  .trim()
  .min(TOPIC_MIN_LENGTH, `Topic must be at least ${TOPIC_MIN_LENGTH} characters`)
  .max(TOPIC_MAX_LENGTH, `Topic must be at most ${TOPIC_MAX_LENGTH} characters`);

export const createSessionSchema = z.object({
  nickname: nicknameSchema,
});

export const joinQueueSchema = z.object({
  drinkType: drinkTypeSchema,
  topic: topicSchema,
});

export const createPrivateRoomSchema = z.object({
  drinkType: drinkTypeSchema,
  topic: topicSchema,
  maxParticipants: z
    .number()
    .int()
    .min(PRIVATE_ROOM_MIN_PARTICIPANTS)
    .max(PRIVATE_ROOM_MAX_PARTICIPANTS)
    .optional()
    .default(PRIVATE_ROOM_MAX_PARTICIPANTS),
});

export const joinPrivateRoomSchema = z.object({
  inviteCode: z.string().length(INVITE_CODE_LENGTH),
});

export const joinRoomSocketSchema = z.object({
  roomId: z.string().uuid(),
  sessionToken: z.string().min(1),
});

export const muteToggleSchema = z.object({
  roomId: z.string().uuid(),
  isMuted: z.boolean(),
});

export const roomIdSchema = z.object({
  roomId: z.string().uuid(),
});
