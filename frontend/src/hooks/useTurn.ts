'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { SocketEvents } from '../../../shared/constants';
import type { TurnState, TimerTickEvent } from '../../../shared/types';
import * as socketService from '../services/socket';
import { useRoomStore } from './useRoom';
import { useSessionStore } from '../lib/store';

// ─── useTurn Hook ───────────────────────────────────────────────

export interface UseTurnReturn {
  currentTurn: TurnState | null;
  remainingSeconds: number;
  isMyTurn: boolean;
  myQueuePosition: number;
  requestTurn: () => void;
  releaseTurn: () => void;
}

export function useTurn(): UseTurnReturn {
  const turnState = useRoomStore((state) => state.turnState);
  const room = useRoomStore((state) => state.room);
  const participants = useRoomStore((state) => state.participants);
  const session = useSessionStore((state) => state.session);

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Find the current participant ID for this session
  const myParticipantId = useMemo(() => {
    if (!session || !participants.length) return null;
    const me = participants.find((p) => p.sessionId === session.id);
    return me?.id ?? null;
  }, [session, participants]);

  // Is it my turn?
  const isMyTurn = useMemo(() => {
    if (!turnState || !myParticipantId) return false;
    return turnState.currentSpeakerId === myParticipantId;
  }, [turnState, myParticipantId]);

  // My position in the queue (0-based, -1 if not in queue)
  const myQueuePosition = useMemo(() => {
    if (!turnState || !myParticipantId) return -1;
    return turnState.queue.indexOf(myParticipantId);
  }, [turnState, myParticipantId]);

  // Request turn
  const requestTurn = useCallback(() => {
    if (room) {
      socketService.requestTurn(room.id);
    }
  }, [room]);

  // Release turn
  const releaseTurn = useCallback(() => {
    if (room) {
      socketService.releaseTurn(room.id);
    }
  }, [room]);

  // Listen for timer tick events
  useEffect(() => {
    const handleTimerTick = (data: TimerTickEvent) => {
      // Only update if the tick is for our room
      if (room && data.roomId === room.id) {
        setRemainingSeconds(data.remainingSeconds);
      }
    };

    socketService.onEvent(SocketEvents.TIMER_TICK, handleTimerTick);

    return () => {
      socketService.offEvent(SocketEvents.TIMER_TICK, handleTimerTick);
    };
  }, [room]);

  // Reset remaining seconds when turn changes
  useEffect(() => {
    if (!turnState?.endsAt) {
      setRemainingSeconds(0);
      return;
    }

    const endsAt = new Date(turnState.endsAt).getTime();
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
    setRemainingSeconds(remaining);
  }, [turnState]);

  return {
    currentTurn: turnState,
    remainingSeconds,
    isMyTurn,
    myQueuePosition,
    requestTurn,
    releaseTurn,
  };
}
