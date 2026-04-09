import { describe, it, expect } from 'vitest';
import {
  NICKNAME_MIN_LENGTH,
  NICKNAME_MAX_LENGTH,
  TOPIC_MIN_LENGTH,
  TOPIC_MAX_LENGTH,
  PRIVATE_ROOM_MIN_PARTICIPANTS,
  PRIVATE_ROOM_MAX_PARTICIPANTS,
  INVITE_CODE_LENGTH,
} from '@shared/constants';
import {
  nicknameSchema,
  drinkTypeSchema,
  topicSchema,
  createSessionSchema,
  joinQueueSchema,
  createPrivateRoomSchema,
  joinPrivateRoomSchema,
  joinRoomSocketSchema,
  muteToggleSchema,
  roomIdSchema,
} from '../../src/lib/validation';

describe('Validation Schemas', () => {
  // ── nicknameSchema ─────────────────────────────────────────────

  describe('nicknameSchema', () => {
    it('should accept a valid nickname', () => {
      const result = nicknameSchema.safeParse('Alice');
      expect(result.success).toBe(true);
    });

    it('should accept nickname with spaces, hyphens, underscores', () => {
      expect(nicknameSchema.safeParse('Cool User-1_2').success).toBe(true);
    });

    it('should reject nickname shorter than minimum length', () => {
      const short = 'A'.repeat(NICKNAME_MIN_LENGTH - 1);
      const result = nicknameSchema.safeParse(short);
      expect(result.success).toBe(false);
    });

    it('should reject nickname longer than maximum length', () => {
      const long = 'A'.repeat(NICKNAME_MAX_LENGTH + 1);
      const result = nicknameSchema.safeParse(long);
      expect(result.success).toBe(false);
    });

    it('should reject nickname with special characters', () => {
      expect(nicknameSchema.safeParse('User@#$').success).toBe(false);
      expect(nicknameSchema.safeParse('User!').success).toBe(false);
      expect(nicknameSchema.safeParse('<script>').success).toBe(false);
    });

    it('should trim whitespace', () => {
      const result = nicknameSchema.safeParse('  Alice  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('Alice');
      }
    });

    it('should accept nickname at exact min and max lengths', () => {
      const min = 'Ab';
      const max = 'A'.repeat(NICKNAME_MAX_LENGTH);
      expect(nicknameSchema.safeParse(min).success).toBe(true);
      expect(nicknameSchema.safeParse(max).success).toBe(true);
    });
  });

  // ── drinkTypeSchema ────────────────────────────────────────────

  describe('drinkTypeSchema', () => {
    it('should accept valid drink types', () => {
      expect(drinkTypeSchema.safeParse('coffee').success).toBe(true);
      expect(drinkTypeSchema.safeParse('tea').success).toBe(true);
      expect(drinkTypeSchema.safeParse('other').success).toBe(true);
    });

    it('should reject invalid drink types', () => {
      expect(drinkTypeSchema.safeParse('water').success).toBe(false);
      expect(drinkTypeSchema.safeParse('juice').success).toBe(false);
      expect(drinkTypeSchema.safeParse('').success).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(drinkTypeSchema.safeParse('Coffee').success).toBe(false);
      expect(drinkTypeSchema.safeParse('COFFEE').success).toBe(false);
    });
  });

  // ── topicSchema ────────────────────────────────────────────────

  describe('topicSchema', () => {
    it('should accept a valid topic', () => {
      expect(topicSchema.safeParse('Technology & Innovation').success).toBe(true);
    });

    it('should reject topic shorter than minimum', () => {
      const short = 'A'.repeat(TOPIC_MIN_LENGTH - 1);
      expect(topicSchema.safeParse(short).success).toBe(false);
    });

    it('should reject topic longer than maximum', () => {
      const long = 'A'.repeat(TOPIC_MAX_LENGTH + 1);
      expect(topicSchema.safeParse(long).success).toBe(false);
    });

    it('should trim whitespace', () => {
      const result = topicSchema.safeParse('  Tech  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('Tech');
      }
    });
  });

  // ── createSessionSchema ────────────────────────────────────────

  describe('createSessionSchema', () => {
    it('should accept valid session data', () => {
      const result = createSessionSchema.safeParse({ nickname: 'Alice' });
      expect(result.success).toBe(true);
    });

    it('should reject missing nickname', () => {
      const result = createSessionSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject invalid nickname in session data', () => {
      const result = createSessionSchema.safeParse({ nickname: '@' });
      expect(result.success).toBe(false);
    });
  });

  // ── joinQueueSchema ────────────────────────────────────────────

  describe('joinQueueSchema', () => {
    it('should accept valid queue join data', () => {
      const result = joinQueueSchema.safeParse({
        drinkType: 'coffee',
        topic: 'Technology & Innovation',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid drink type', () => {
      const result = joinQueueSchema.safeParse({
        drinkType: 'soda',
        topic: 'Technology',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing topic', () => {
      const result = joinQueueSchema.safeParse({
        drinkType: 'coffee',
      });
      expect(result.success).toBe(false);
    });

    it('should reject too-short topic', () => {
      const result = joinQueueSchema.safeParse({
        drinkType: 'coffee',
        topic: 'A',
      });
      expect(result.success).toBe(false);
    });
  });

  // ── createPrivateRoomSchema ────────────────────────────────────

  describe('createPrivateRoomSchema', () => {
    it('should accept valid private room data', () => {
      const result = createPrivateRoomSchema.safeParse({
        drinkType: 'tea',
        topic: 'Book Club Discussion',
        maxParticipants: 4,
      });
      expect(result.success).toBe(true);
    });

    it('should use default maxParticipants when omitted', () => {
      const result = createPrivateRoomSchema.safeParse({
        drinkType: 'coffee',
        topic: 'Tech Chat',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.maxParticipants).toBe(PRIVATE_ROOM_MAX_PARTICIPANTS);
      }
    });

    it('should reject maxParticipants below minimum', () => {
      const result = createPrivateRoomSchema.safeParse({
        drinkType: 'coffee',
        topic: 'Small Chat',
        maxParticipants: PRIVATE_ROOM_MIN_PARTICIPANTS - 1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject maxParticipants above maximum', () => {
      const result = createPrivateRoomSchema.safeParse({
        drinkType: 'coffee',
        topic: 'Big Chat',
        maxParticipants: PRIVATE_ROOM_MAX_PARTICIPANTS + 1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer maxParticipants', () => {
      const result = createPrivateRoomSchema.safeParse({
        drinkType: 'coffee',
        topic: 'Fractional Chat',
        maxParticipants: 3.5,
      });
      expect(result.success).toBe(false);
    });

    it('should accept boundary values for maxParticipants', () => {
      const minResult = createPrivateRoomSchema.safeParse({
        drinkType: 'coffee',
        topic: 'Min Chat',
        maxParticipants: PRIVATE_ROOM_MIN_PARTICIPANTS,
      });
      const maxResult = createPrivateRoomSchema.safeParse({
        drinkType: 'coffee',
        topic: 'Max Chat',
        maxParticipants: PRIVATE_ROOM_MAX_PARTICIPANTS,
      });
      expect(minResult.success).toBe(true);
      expect(maxResult.success).toBe(true);
    });
  });

  // ── joinPrivateRoomSchema ──────────────────────────────────────

  describe('joinPrivateRoomSchema', () => {
    it('should accept a valid invite code', () => {
      const code = 'A'.repeat(INVITE_CODE_LENGTH);
      const result = joinPrivateRoomSchema.safeParse({ inviteCode: code });
      expect(result.success).toBe(true);
    });

    it('should reject invite code of wrong length', () => {
      const tooShort = 'A'.repeat(INVITE_CODE_LENGTH - 1);
      const tooLong = 'A'.repeat(INVITE_CODE_LENGTH + 1);
      expect(joinPrivateRoomSchema.safeParse({ inviteCode: tooShort }).success).toBe(false);
      expect(joinPrivateRoomSchema.safeParse({ inviteCode: tooLong }).success).toBe(false);
    });

    it('should reject empty invite code', () => {
      expect(joinPrivateRoomSchema.safeParse({ inviteCode: '' }).success).toBe(false);
    });
  });

  // ── joinRoomSocketSchema ───────────────────────────────────────

  describe('joinRoomSocketSchema', () => {
    it('should accept valid UUID roomId and non-empty token', () => {
      const result = joinRoomSocketSchema.safeParse({
        roomId: '550e8400-e29b-41d4-a716-446655440000',
        sessionToken: 'eyJhbGciOiJIUzI1NiJ9.test.token',
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-UUID roomId', () => {
      const result = joinRoomSocketSchema.safeParse({
        roomId: 'not-a-uuid',
        sessionToken: 'some-token',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty sessionToken', () => {
      const result = joinRoomSocketSchema.safeParse({
        roomId: '550e8400-e29b-41d4-a716-446655440000',
        sessionToken: '',
      });
      expect(result.success).toBe(false);
    });
  });

  // ── muteToggleSchema ──────────────────────────────────────────

  describe('muteToggleSchema', () => {
    it('should accept valid mute toggle data', () => {
      const result = muteToggleSchema.safeParse({
        roomId: '550e8400-e29b-41d4-a716-446655440000',
        isMuted: true,
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-boolean isMuted', () => {
      const result = muteToggleSchema.safeParse({
        roomId: '550e8400-e29b-41d4-a716-446655440000',
        isMuted: 'yes',
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-UUID roomId', () => {
      const result = muteToggleSchema.safeParse({
        roomId: 'invalid',
        isMuted: false,
      });
      expect(result.success).toBe(false);
    });
  });

  // ── roomIdSchema ──────────────────────────────────────────────

  describe('roomIdSchema', () => {
    it('should accept a valid UUID', () => {
      const result = roomIdSchema.safeParse({
        roomId: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-UUID string', () => {
      const result = roomIdSchema.safeParse({ roomId: 'room-123' });
      expect(result.success).toBe(false);
    });

    it('should reject missing roomId', () => {
      const result = roomIdSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
