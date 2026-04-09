'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Coffee, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSessionStore } from '@/lib/store';
import { useSocket } from '@/hooks/useSocket';
import { useRoom } from '@/hooks/useRoom';
import { useVoice } from '@/hooks/useVoice';
import { useTurn } from '@/hooks/useTurn';
import { ParticipantList } from '@/components/room/ParticipantList';
import { TurnIndicator } from '@/components/room/TurnIndicator';
import { Timer } from '@/components/room/Timer';
import { AISuggestions } from '@/components/room/AISuggestions';
import { TopicSidebar } from '@/components/room/TopicSidebar';
import { MicrophoneButton } from '@/components/voice/MicrophoneButton';

// ─── Page ───────────────────────────────────────────────────────

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const session = useSessionStore((s) => s.session);
  const token = useSessionStore((s) => s.token);
  const hydrate = useSessionStore((s) => s.hydrate);

  const { isConnected, connect, disconnect: disconnectSocket } = useSocket();
  const {
    room,
    participants,
    turnState,
    suggestions,
    aiAvailable,
    isLoading,
    error: roomError,
    joinRoom,
    leaveRoom,
  } = useRoom();
  const {
    isMuted,
    localStream,
    isConnecting: micConnecting,
    error: micError,
    initMicrophone,
    toggleMute,
    cleanup: cleanupVoice,
  } = useVoice(roomId);
  const {
    remainingSeconds,
    isMyTurn,
    myQueuePosition,
    requestTurn,
    releaseTurn,
  } = useTurn();

  const [mounted, setMounted] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // Find my participant ID
  const myParticipantId = useMemo(() => {
    if (!session || !participants.length) return null;
    const me = participants.find((p) => p.sessionId === session.id);
    return me?.id ?? null;
  }, [session, participants]);

  // Current speaker nickname
  const currentSpeakerNickname = useMemo(() => {
    if (!turnState?.currentSpeakerId) return null;
    const speaker = participants.find(
      (p) => p.id === turnState.currentSpeakerId,
    );
    return speaker?.nickname ?? null;
  }, [turnState, participants]);

  // Hydrate session from localStorage on mount
  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  // Redirect to /join if no session after hydration
  useEffect(() => {
    if (mounted && !token) {
      router.replace('/join');
    }
  }, [mounted, token, router]);

  // Connect socket
  useEffect(() => {
    if (mounted && token && !isConnected) {
      connect(token);
    }
  }, [mounted, token, isConnected, connect]);

  // Join room once socket is connected
  useEffect(() => {
    if (isConnected && token && roomId && !hasJoined && !isLoading) {
      setHasJoined(true);
      joinRoom(roomId, token);
    }
  }, [isConnected, token, roomId, hasJoined, isLoading, joinRoom]);

  // Initialize microphone once room is joined
  useEffect(() => {
    if (room && !localStream && !micConnecting && !micError) {
      initMicrophone();
    }
  }, [room, localStream, micConnecting, micError, initMicrophone]);

  // Leave room handler
  const handleLeaveRoom = useCallback(() => {
    cleanupVoice();
    leaveRoom();
    disconnectSocket();
    router.push('/select');
  }, [cleanupVoice, leaveRoom, disconnectSocket, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupVoice();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Don't render until hydration is complete
  if (!mounted || !token) {
    return (
      <main className="min-h-screen-safe flex items-center justify-center bg-cream-50">
        <div className="waiting-pulse text-coffee-400 text-lg">Loading...</div>
      </main>
    );
  }

  // Loading state
  if (isLoading || !room) {
    return (
      <main className="min-h-screen-safe flex flex-col items-center justify-center bg-cream-50 px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-coffee-100 text-coffee-600 mb-6">
          <Coffee className="h-10 w-10 waiting-pulse" strokeWidth={1.5} />
        </div>
        <p className="text-lg font-medium text-espresso-800">
          Joining the room...
        </p>
        <p className="mt-2 text-sm text-mocha-500">
          Setting up your connection.
        </p>
      </main>
    );
  }

  // Error state
  if (roomError) {
    return (
      <main className="min-h-screen-safe flex flex-col items-center justify-center bg-cream-50 px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-busy mb-6">
          <AlertTriangle className="h-10 w-10" strokeWidth={1.5} />
        </div>
        <p className="text-lg font-medium text-espresso-800">
          Unable to join room
        </p>
        <p className="mt-2 text-sm text-mocha-500 text-center max-w-sm">
          {roomError}
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={() => router.push('/select')}>
            Go Back
          </Button>
          <Button
            onClick={() => {
              setHasJoined(false);
            }}
          >
            Retry
          </Button>
        </div>
      </main>
    );
  }

  // ─── Main Room Layout ─────────────────────────────────────────

  return (
    <main className="min-h-screen-safe flex flex-col bg-cream-50">
      {/* ── Mobile: stacked layout / Desktop: grid ──────────── */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-6 flex flex-col lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        {/* ── Left column: main room area ───────────────────── */}
        <div className="flex flex-col gap-3 sm:gap-4 flex-1 min-h-0">
          {/* Timer + Turn indicator row */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="shrink-0">
              <Timer
                remainingSeconds={remainingSeconds}
                isActive={!!turnState?.currentSpeakerId}
              />
            </div>
            <div className="flex-1 min-w-0">
              <TurnIndicator
                currentSpeakerNickname={currentSpeakerNickname}
                isMyTurn={isMyTurn}
                myQueuePosition={myQueuePosition}
                onRequestTurn={requestTurn}
                onReleaseTurn={releaseTurn}
              />
            </div>
          </div>

          {/* Participant list */}
          <div className="rounded-2xl bg-white/60 border border-cream-300 shadow-sm p-3 sm:p-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <ParticipantList
              participants={participants}
              currentSpeakerId={turnState?.currentSpeakerId ?? null}
              myParticipantId={myParticipantId}
            />
          </div>

          {/* Microphone button */}
          <div className="flex justify-center py-2 sm:py-3 lg:py-4">
            <MicrophoneButton
              isMuted={isMuted}
              isConnecting={micConnecting}
              error={micError}
              hasPermission={!!localStream}
              onToggle={toggleMute}
              onRetry={initMicrophone}
            />
          </div>
        </div>

        {/* ── Right column / bottom on mobile: sidebar ──────── */}
        <div className="flex flex-col gap-3 sm:gap-4 mt-1 lg:mt-0 lg:min-h-0 pb-safe">
          {/* Topic & Room info */}
          <TopicSidebar
            room={room}
            participantCount={participants.length}
            onLeaveRoom={handleLeaveRoom}
          />

          {/* AI Suggestions */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <AISuggestions
              suggestions={suggestions}
              aiAvailable={aiAvailable}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
