import { getRedis } from '../../lib/redis';
import { RedisKeys, TURN_DURATION_SECONDS, TIMER_TICK_INTERVAL_MS, TURN_TRANSITION_MS } from '../../../../shared/constants';
import { TurnStatus } from '../../../../shared/types';
import type { TurnState } from '../../../../shared/types';

const roomTimers = new Map<string, ReturnType<typeof setInterval>>();

export type TurnTickCallback = (roomId: string, remainingSeconds: number) => void;
export type TurnChangedCallback = (roomId: string, turnState: TurnState) => void;

let onTickCallback: TurnTickCallback | null = null;
let onTurnChangedCallback: TurnChangedCallback | null = null;

export function setTurnCallbacks(onTick: TurnTickCallback, onChanged: TurnChangedCallback): void {
  onTickCallback = onTick;
  onTurnChangedCallback = onChanged;
}

export async function initializeTurnState(roomId: string): Promise<TurnState> {
  const state: TurnState = {
    roomId,
    currentSpeakerId: null,
    status: TurnStatus.IDLE,
    startedAt: null,
    endsAt: null,
    queue: [],
  };

  const redis = getRedis();
  await redis.set(RedisKeys.roomTurn(roomId), JSON.stringify(state), 'EX', 86400);
  return state;
}

export async function getTurnState(roomId: string): Promise<TurnState> {
  const redis = getRedis();
  const cached = await redis.get(RedisKeys.roomTurn(roomId));
  if (cached) return JSON.parse(cached);

  return initializeTurnState(roomId);
}

export async function requestTurn(roomId: string, participantId: string): Promise<TurnState> {
  const state = await getTurnState(roomId);

  // Already in queue or speaking
  if (state.currentSpeakerId === participantId || state.queue.includes(participantId)) {
    return state;
  }

  state.queue.push(participantId);

  // If no one is speaking, start this participant's turn
  if (!state.currentSpeakerId) {
    return startNextTurn(roomId, state);
  }

  await saveTurnState(state);
  return state;
}

export async function releaseTurn(roomId: string, participantId: string): Promise<TurnState> {
  const state = await getTurnState(roomId);

  if (state.currentSpeakerId === participantId) {
    return endCurrentTurn(roomId, state);
  }

  // Remove from queue if queued
  state.queue = state.queue.filter((id) => id !== participantId);
  await saveTurnState(state);
  return state;
}

export async function removeParticipantFromTurn(roomId: string, participantId: string): Promise<TurnState> {
  const state = await getTurnState(roomId);

  state.queue = state.queue.filter((id) => id !== participantId);

  if (state.currentSpeakerId === participantId) {
    return endCurrentTurn(roomId, state);
  }

  await saveTurnState(state);
  return state;
}

async function startNextTurn(roomId: string, state: TurnState): Promise<TurnState> {
  stopRoomTimer(roomId);

  if (state.queue.length === 0) {
    state.currentSpeakerId = null;
    state.status = TurnStatus.IDLE;
    state.startedAt = null;
    state.endsAt = null;
    await saveTurnState(state);
    notifyTurnChanged(roomId, state);
    return state;
  }

  const nextSpeaker = state.queue.shift()!;
  state.currentSpeakerId = nextSpeaker;
  state.status = TurnStatus.ACTIVE;
  state.startedAt = new Date().toISOString();
  state.endsAt = new Date(Date.now() + TURN_DURATION_SECONDS * 1000).toISOString();

  await saveTurnState(state);
  startRoomTimer(roomId);
  notifyTurnChanged(roomId, state);

  return state;
}

async function endCurrentTurn(roomId: string, state: TurnState): Promise<TurnState> {
  stopRoomTimer(roomId);

  state.status = TurnStatus.TRANSITIONING;
  state.currentSpeakerId = null;
  await saveTurnState(state);
  notifyTurnChanged(roomId, state);

  // Brief transition period
  await new Promise((resolve) => setTimeout(resolve, TURN_TRANSITION_MS));

  return startNextTurn(roomId, state);
}

function startRoomTimer(roomId: string): void {
  stopRoomTimer(roomId);

  let remaining = TURN_DURATION_SECONDS;

  const timer = setInterval(async () => {
    remaining--;

    if (onTickCallback) {
      onTickCallback(roomId, remaining);
    }

    if (remaining <= 0) {
      stopRoomTimer(roomId);
      try {
        const state = await getTurnState(roomId);
        if (state.currentSpeakerId) {
          await endCurrentTurn(roomId, state);
        }
      } catch (err) {
        console.error(`[Turn] Error ending turn for room ${roomId}:`, err);
      }
    }
  }, TIMER_TICK_INTERVAL_MS);

  roomTimers.set(roomId, timer);
}

function stopRoomTimer(roomId: string): void {
  const timer = roomTimers.get(roomId);
  if (timer) {
    clearInterval(timer);
    roomTimers.delete(roomId);
  }
}

export function cleanupRoomTimers(roomId: string): void {
  stopRoomTimer(roomId);
}

export function cleanupAllTimers(): void {
  for (const [roomId] of roomTimers) {
    stopRoomTimer(roomId);
  }
}

async function saveTurnState(state: TurnState): Promise<void> {
  const redis = getRedis();
  await redis.set(RedisKeys.roomTurn(state.roomId), JSON.stringify(state), 'EX', 86400);
}

function notifyTurnChanged(roomId: string, state: TurnState): void {
  if (onTurnChangedCallback) {
    onTurnChangedCallback(roomId, state);
  }
}
