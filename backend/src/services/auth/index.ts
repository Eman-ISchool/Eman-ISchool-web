import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../lib/prisma';
import { config } from '../../config';
import { SESSION_DURATION_HOURS } from '../../../../shared/constants';
import type { GuestSession } from '../../../../shared/types';

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#AED6F1', '#D7BDE2',
];

function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export interface TokenPayload {
  sessionId: string;
  nickname: string;
}

export async function createSession(nickname: string): Promise<{ session: GuestSession; token: string }> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);
  const tokenValue = uuidv4();

  const session = await prisma.guestSession.create({
    data: {
      nickname,
      avatarColor: randomColor(),
      token: tokenValue,
      expiresAt,
    },
  });

  const jwtToken = jwt.sign(
    { sessionId: session.id, nickname: session.nickname } satisfies TokenPayload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );

  return {
    session: {
      id: session.id,
      nickname: session.nickname,
      avatarColor: session.avatarColor,
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
    },
    token: jwtToken,
  };
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
}

export async function getSession(sessionId: string): Promise<GuestSession | null> {
  const session = await prisma.guestSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return {
    id: session.id,
    nickname: session.nickname,
    avatarColor: session.avatarColor,
    createdAt: session.createdAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
  };
}

export async function validateSessionToken(token: string): Promise<GuestSession | null> {
  try {
    const payload = verifyToken(token);
    return getSession(payload.sessionId);
  } catch {
    return null;
  }
}
