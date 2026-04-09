'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSessionStore } from '@/lib/store';
import { useSocket } from '@/hooks/useSocket';
import { leaveQueue } from '@/services/api';
import * as socketService from '@/services/socket';
import { SocketEvents } from '../../../../shared/constants';
import { DRINK_OPTIONS } from '../../../../shared/constants';
import type { MatchFoundEvent } from '../../../../shared/types';

// ─── Page ───────────────────────────────────────────────────────

export default function WaitingPage() {
  const router = useRouter();

  const session = useSessionStore((s) => s.session);
  const token = useSessionStore((s) => s.token);
  const drinkType = useSessionStore((s) => s.drinkType);
  const topic = useSessionStore((s) => s.topic);
  const hydrate = useSessionStore((s) => s.hydrate);

  const { isConnected, connect } = useSocket();

  const [mounted, setMounted] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [dots, setDots] = useState('');
  const [cancelling, setCancelling] = useState(false);

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

  // Connect socket on mount
  useEffect(() => {
    if (mounted && token && !isConnected) {
      connect(token);
    }
  }, [mounted, token, isConnected, connect]);

  // Join queue via socket once connected
  useEffect(() => {
    if (isConnected && drinkType && topic) {
      socketService.joinQueue(drinkType, topic);
    }
  }, [isConnected, drinkType, topic]);

  // Listen for MATCH_FOUND and QUEUE_UPDATE
  useEffect(() => {
    const handleMatchFound = (data: MatchFoundEvent) => {
      router.push(`/room/${data.roomId}`);
    };

    const handleQueueUpdate = (data: { position: number }) => {
      setQueuePosition(data.position);
    };

    socketService.onEvent(SocketEvents.MATCH_FOUND, handleMatchFound);
    socketService.onEvent(SocketEvents.QUEUE_UPDATE, handleQueueUpdate);

    return () => {
      socketService.offEvent(SocketEvents.MATCH_FOUND, handleMatchFound);
      socketService.offEvent(SocketEvents.QUEUE_UPDATE, handleQueueUpdate);
    };
  }, [router]);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Cancel / go back
  const handleCancel = useCallback(async () => {
    if (!token) return;
    setCancelling(true);
    try {
      socketService.leaveQueue();
      await leaveQueue(token);
    } catch {
      // Swallow errors -- user just wants to leave
    } finally {
      router.push('/select');
    }
  }, [token, router]);

  // Don't render until hydration is complete
  if (!mounted || !token) {
    return (
      <main className="min-h-screen-safe flex items-center justify-center bg-cream-50">
        <div className="waiting-pulse text-coffee-400 text-lg">Loading...</div>
      </main>
    );
  }

  const drinkOption = DRINK_OPTIONS.find((d) => d.value === drinkType);

  return (
    <main className="min-h-screen-safe flex flex-col bg-cream-50">
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
        {/* Animated coffee cup */}
        <div className="relative mb-6 sm:mb-8">
          <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-coffee-100 text-coffee-600">
            <Coffee className="h-12 w-12 sm:h-14 sm:w-14 waiting-pulse" strokeWidth={1.5} />
          </div>
          {/* Steam animation */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1">
            <span className="block w-1.5 h-6 rounded-full bg-coffee-200 opacity-60 animate-bounce [animation-delay:0ms]" />
            <span className="block w-1.5 h-8 rounded-full bg-coffee-200 opacity-40 animate-bounce [animation-delay:200ms]" />
            <span className="block w-1.5 h-5 rounded-full bg-coffee-200 opacity-50 animate-bounce [animation-delay:400ms]" />
          </div>
        </div>

        {/* Status text */}
        <h1 className="text-2xl font-bold text-espresso-800 text-center sm:text-3xl">
          Finding your perfect match{dots}
        </h1>

        <p className="mt-3 text-base text-mocha-500 text-center max-w-sm">
          Hang tight, {session?.nickname ?? 'friend'}! We are pairing you with
          someone who shares your vibe.
        </p>

        {/* Selected preferences */}
        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2">
          {drinkOption && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-coffee-50 border border-coffee-200 text-sm font-medium text-coffee-700">
              <span>{drinkOption.emoji}</span>
              {drinkOption.label}
            </span>
          )}
          {topic && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cream-200 border border-cream-400 text-sm font-medium text-mocha-600">
              {topic}
            </span>
          )}
        </div>

        {/* Queue position */}
        {queuePosition !== null && (
          <p className="mt-4 text-sm text-coffee-600 font-medium bg-coffee-50 px-4 py-2 rounded-full">
            Queue position: #{queuePosition}
          </p>
        )}

        {/* Connection status */}
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-online' : 'bg-away animate-pulse'
            }`}
          />
          <span className="text-xs text-latte-500">
            {isConnected ? 'Connected to server' : 'Connecting...'}
          </span>
        </div>

        {/* Cancel button */}
        <div className="mt-6 sm:mt-8 w-full max-w-xs pb-safe">
          <Button
            variant="outline"
            size="md"
            fullWidth
            loading={cancelling}
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel & Go Back
          </Button>
        </div>
      </div>
    </main>
  );
}
