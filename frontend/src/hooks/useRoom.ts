'use client';

import { useEffect, useCallback } from 'react';
import { create } from 'zustand';
import type {
  Room,
  Participant,
  TurnState,
  AISuggestion,
} from '../../../shared/types';
import { SocketEvents } from '../../../shared/constants';
import * as socketService from '../services/socket';
import { getRoomState as fetchRoomState } from '../services/api';

// ─── Room Store ─────────────────────────────────────────────────

interface RoomState {
  room: Room | null;
  participants: Participant[];
  turnState: TurnState | null;
  suggestions: AISuggestion[];
  aiAvailable: boolean;
  isLoading: boolean;
  error: string | null;
}

interface RoomActions {
  setRoom: (room: Room | null) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string) => void;
  updateParticipant: (
    participantId: string,
    updates: Partial<Pick<Participant, 'isMuted' | 'isSpeaking' | 'status'>>,
  ) => void;
  setTurnState: (turnState: TurnState) => void;
  addSuggestion: (suggestion: AISuggestion) => void;
  setAIStatus: (available: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type RoomStore = RoomState & RoomActions;

const initialState: RoomState = {
  room: null,
  participants: [],
  turnState: null,
  suggestions: [],
  aiAvailable: false,
  isLoading: false,
  error: null,
};

export const useRoomStore = create<RoomStore>((set) => ({
  ...initialState,

  setRoom: (room) => set({ room }),

  addParticipant: (participant) =>
    set((state) => ({
      participants: [...state.participants, participant],
    })),

  removeParticipant: (participantId) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== participantId),
    })),

  updateParticipant: (participantId, updates) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === participantId ? { ...p, ...updates } : p,
      ),
    })),

  setTurnState: (turnState) => set({ turnState }),

  addSuggestion: (suggestion) =>
    set((state) => ({
      suggestions: [...state.suggestions, suggestion],
    })),

  setAIStatus: (available) => set({ aiAvailable: available }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

// ─── useRoom Hook ───────────────────────────────────────────────

export interface UseRoomReturn {
  room: Room | null;
  participants: Participant[];
  turnState: TurnState | null;
  suggestions: AISuggestion[];
  aiAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  joinRoom: (roomId: string, token: string) => Promise<void>;
  leaveRoom: () => void;
}

export function useRoom(): UseRoomReturn {
  const store = useRoomStore();

  const joinRoom = useCallback(
    async (roomId: string, token: string) => {
      store.setLoading(true);
      store.setError(null);

      try {
        // Fetch initial room state via REST
        const state = await fetchRoomState(token, roomId);
        store.setRoom(state.room);
        useRoomStore.setState({
          participants: state.participants,
          turnState: state.turnState,
          suggestions: state.suggestions,
        });

        // Join via Socket.IO for real-time updates
        socketService.joinRoom(roomId, token);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to join room';
        store.setError(message);
      } finally {
        store.setLoading(false);
      }
    },
    [store],
  );

  const leaveRoom = useCallback(() => {
    const room = useRoomStore.getState().room;
    if (room) {
      socketService.leaveRoom(room.id);
    }
    store.reset();
  }, [store]);

  // Wire up Socket.IO events to the store
  useEffect(() => {
    const handleRoomJoined = (data: {
      room: Room;
      participants: Participant[];
      turnState: TurnState;
      suggestions: AISuggestion[];
    }) => {
      useRoomStore.setState({
        room: data.room,
        participants: data.participants,
        turnState: data.turnState,
        suggestions: data.suggestions,
        isLoading: false,
      });
    };

    const handleParticipantJoined = (data: { participant: Participant }) => {
      useRoomStore.getState().addParticipant(data.participant);
    };

    const handleParticipantLeft = (data: { participantId: string }) => {
      useRoomStore.getState().removeParticipant(data.participantId);
    };

    const handleParticipantUpdated = (data: {
      participantId: string;
      updates: Partial<Pick<Participant, 'isMuted' | 'isSpeaking' | 'status'>>;
    }) => {
      useRoomStore.getState().updateParticipant(data.participantId, data.updates);
    };

    const handleTurnChanged = (data: { turnState: TurnState }) => {
      useRoomStore.getState().setTurnState(data.turnState);
    };

    const handleAISuggestion = (data: { suggestion: AISuggestion }) => {
      useRoomStore.getState().addSuggestion(data.suggestion);
    };

    const handleAIStatus = (data: { available: boolean }) => {
      useRoomStore.getState().setAIStatus(data.available);
    };

    const handleRoomClosing = (_data: { reason: string; closesAt: string }) => {
      // The room is about to close; could show a warning UI
    };

    const handleRoomClosed = () => {
      useRoomStore.getState().reset();
    };

    const handleError = (data: { code: string; message: string }) => {
      useRoomStore.getState().setError(data.message);
    };

    socketService.onEvent(SocketEvents.ROOM_JOINED, handleRoomJoined);
    socketService.onEvent(SocketEvents.PARTICIPANT_JOINED, handleParticipantJoined);
    socketService.onEvent(SocketEvents.PARTICIPANT_LEFT, handleParticipantLeft);
    socketService.onEvent(SocketEvents.PARTICIPANT_UPDATED, handleParticipantUpdated);
    socketService.onEvent(SocketEvents.TURN_CHANGED, handleTurnChanged);
    socketService.onEvent(SocketEvents.AI_SUGGESTION, handleAISuggestion);
    socketService.onEvent(SocketEvents.AI_STATUS, handleAIStatus);
    socketService.onEvent(SocketEvents.ROOM_CLOSING, handleRoomClosing);
    socketService.onEvent(SocketEvents.ROOM_CLOSED, handleRoomClosed);
    socketService.onEvent(SocketEvents.ERROR, handleError);

    return () => {
      socketService.offEvent(SocketEvents.ROOM_JOINED, handleRoomJoined);
      socketService.offEvent(SocketEvents.PARTICIPANT_JOINED, handleParticipantJoined);
      socketService.offEvent(SocketEvents.PARTICIPANT_LEFT, handleParticipantLeft);
      socketService.offEvent(SocketEvents.PARTICIPANT_UPDATED, handleParticipantUpdated);
      socketService.offEvent(SocketEvents.TURN_CHANGED, handleTurnChanged);
      socketService.offEvent(SocketEvents.AI_SUGGESTION, handleAISuggestion);
      socketService.offEvent(SocketEvents.AI_STATUS, handleAIStatus);
      socketService.offEvent(SocketEvents.ROOM_CLOSING, handleRoomClosing);
      socketService.offEvent(SocketEvents.ROOM_CLOSED, handleRoomClosed);
      socketService.offEvent(SocketEvents.ERROR, handleError);
    };
  }, []);

  return {
    room: store.room,
    participants: store.participants,
    turnState: store.turnState,
    suggestions: store.suggestions,
    aiAvailable: store.aiAvailable,
    isLoading: store.isLoading,
    error: store.error,
    joinRoom,
    leaveRoom,
  };
}
