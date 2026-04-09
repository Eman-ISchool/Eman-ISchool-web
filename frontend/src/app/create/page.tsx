'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, Link2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useSessionStore } from '@/lib/store';
import { createPrivateRoom } from '@/services/api';
import {
  DRINK_OPTIONS,
  DEFAULT_TOPICS,
  PRIVATE_ROOM_MIN_PARTICIPANTS,
  PRIVATE_ROOM_MAX_PARTICIPANTS,
} from '../../../../shared/constants';
import type { DrinkType, Room } from '../../../../shared/types';

// ─── Page ───────────────────────────────────────────────────────

export default function CreateRoomPage() {
  const router = useRouter();

  const session = useSessionStore((s) => s.session);
  const token = useSessionStore((s) => s.token);
  const hydrate = useSessionStore((s) => s.hydrate);

  const [mounted, setMounted] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<DrinkType | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Created room state
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const activeTopic =
    selectedTopic === '__custom__' ? customTopic.trim() : selectedTopic;

  const canSubmit =
    selectedDrink !== null &&
    activeTopic !== null &&
    activeTopic.length >= 2;

  const handleCreateRoom = useCallback(async () => {
    if (!canSubmit || !token || !selectedDrink || !activeTopic) return;

    setError(null);
    setLoading(true);
    try {
      const data = await createPrivateRoom(
        token,
        selectedDrink,
        activeTopic,
        maxParticipants,
      );
      setCreatedRoom(data.room);
      setInviteCode(data.inviteCode);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create room. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [canSubmit, token, selectedDrink, activeTopic, maxParticipants]);

  const handleCopyCode = useCallback(async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [inviteCode]);

  const handleCopyLink = useCallback(async () => {
    if (!createdRoom) return;
    const link = `${window.location.origin}/room/${createdRoom.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [createdRoom]);

  // Don't render until hydration is complete
  if (!mounted || !token) {
    return (
      <main className="min-h-screen-safe flex items-center justify-center bg-cream-50">
        <div className="waiting-pulse text-coffee-400 text-lg">Loading...</div>
      </main>
    );
  }

  // ─── Success State: Room Created ──────────────────────────────

  if (createdRoom && inviteCode) {
    return (
      <main className="min-h-screen-safe flex flex-col bg-cream-50">
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
          {/* Success header */}
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-online/10 text-online mb-4 sm:mb-6">
            <Check className="h-10 w-10" strokeWidth={2} />
          </div>

          <h1 className="text-2xl font-bold text-espresso-800 text-center sm:text-3xl">
            Room Created!
          </h1>
          <p className="mt-2 text-base text-mocha-500 text-center max-w-sm">
            Share the invite code with friends to join your private room.
          </p>

          {/* Invite code */}
          <div className="mt-5 sm:mt-8 w-full max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-mocha-500 text-center mb-3">
              Invite Code
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white text-espresso-800 font-mono text-2xl font-bold px-6 py-4 rounded-2xl text-center tracking-[0.3em] border border-cream-300 shadow-sm">
                {inviteCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-coffee-100 text-coffee-600 hover:bg-coffee-200 transition-colors border border-coffee-200"
                aria-label="Copy invite code"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-online" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Share link */}
          <button
            onClick={handleCopyLink}
            className="mt-4 inline-flex items-center gap-2 text-sm text-coffee-500 hover:text-coffee-600 underline underline-offset-2"
          >
            <Link2 className="h-4 w-4" />
            Copy room link
          </button>

          {/* Room details */}
          <div className="mt-4 sm:mt-6 w-full max-w-sm rounded-2xl bg-white border border-cream-300 shadow-sm p-3 sm:p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-mocha-500">Topic</span>
              <span className="text-espresso-800 font-medium">{createdRoom.topic}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mocha-500">Drink</span>
              <span className="text-espresso-800 font-medium">
                {DRINK_OPTIONS.find((d) => d.value === createdRoom.drinkType)?.emoji}{' '}
                {DRINK_OPTIONS.find((d) => d.value === createdRoom.drinkType)?.label}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mocha-500">Max participants</span>
              <span className="text-espresso-800 font-medium">{createdRoom.maxParticipants}</span>
            </div>
          </div>

          {/* Enter room button */}
          <div className="mt-5 sm:mt-8 w-full max-w-sm">
            <Button
              size="lg"
              fullWidth
              onClick={() => router.push(`/room/${createdRoom.id}`)}
            >
              Enter Room
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          <p className="mt-4 text-center text-sm text-latte-500 pb-safe">
            <a
              href="/select"
              className="text-coffee-500 hover:text-coffee-600 underline underline-offset-2"
            >
              Or find a public match instead
            </a>
          </p>
        </div>
      </main>
    );
  }

  // ─── Creation Form ────────────────────────────────────────────

  return (
    <main className="min-h-screen-safe flex flex-col bg-cream-50">
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Header */}
        <div className="mb-5 sm:mb-8 text-center">
          <h1 className="text-2xl font-bold text-espresso-800 sm:text-3xl">
            Create Private Room
          </h1>
          {session && (
            <p className="mt-2 text-base text-mocha-500">
              Set up a cosy room for you and your friends, {session.nickname}.
            </p>
          )}
        </div>

        {/* Drink Selection */}
        <section className="mb-5 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-espresso-800 mb-2 sm:mb-3">
            What are you having?
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {DRINK_OPTIONS.map((drink) => (
              <Card
                key={drink.value}
                variant={selectedDrink === drink.value ? 'selected' : 'interactive'}
                padding="md"
                onClick={() => setSelectedDrink(drink.value)}
                className="text-center"
              >
                <span
                  className="block text-2xl sm:text-4xl mb-1 sm:mb-2"
                  role="img"
                  aria-label={drink.label}
                >
                  {drink.emoji}
                </span>
                <span className="block text-xs sm:text-base font-medium text-espresso-800">
                  {drink.label}
                </span>
              </Card>
            ))}
          </div>
        </section>

        {/* Topic Selection */}
        <section className="mb-5 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-espresso-800 mb-2 sm:mb-3">
            Pick a topic
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {DEFAULT_TOPICS.map((topic) => (
              <Card
                key={topic}
                variant={selectedTopic === topic ? 'selected' : 'interactive'}
                padding="sm"
                onClick={() => {
                  setSelectedTopic(topic);
                  setCustomTopic('');
                }}
                className="text-center"
              >
                <span className="text-sm font-medium text-espresso-800">
                  {topic}
                </span>
              </Card>
            ))}

            <Card
              variant={selectedTopic === '__custom__' ? 'selected' : 'interactive'}
              padding="sm"
              onClick={() => setSelectedTopic('__custom__')}
              className="text-center"
            >
              <span className="text-sm font-medium text-espresso-800">
                <Sparkles className="inline h-4 w-4 mr-1 -mt-0.5" />
                Custom Topic
              </span>
            </Card>
          </div>

          {selectedTopic === '__custom__' && (
            <div className="mt-3">
              <Input
                placeholder="Type your topic..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                maxLength={100}
                autoFocus
              />
            </div>
          )}
        </section>

        {/* Max Participants */}
        <section className="mb-5 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-espresso-800 mb-2 sm:mb-3">
            Max participants
          </h2>
          <div className="bg-white rounded-2xl border border-cream-300 shadow-sm p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-mocha-500">
                {PRIVATE_ROOM_MIN_PARTICIPANTS} - {PRIVATE_ROOM_MAX_PARTICIPANTS} people
              </span>
              <span className="text-lg font-bold text-espresso-800 bg-coffee-50 px-3 py-1 rounded-lg">
                {maxParticipants}
              </span>
            </div>
            <input
              type="range"
              min={PRIVATE_ROOM_MIN_PARTICIPANTS}
              max={PRIVATE_ROOM_MAX_PARTICIPANTS}
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              className="w-full h-2 bg-cream-300 rounded-full appearance-none cursor-pointer accent-coffee-500"
            />
            <div className="flex justify-between text-xs text-latte-500 mt-1">
              <span>{PRIVATE_ROOM_MIN_PARTICIPANTS}</span>
              <span>{PRIVATE_ROOM_MAX_PARTICIPANTS}</span>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <p className="mb-4 text-center text-sm text-red-500">{error}</p>
        )}

        {/* Create button */}
        <Button
          size="lg"
          fullWidth
          loading={loading}
          disabled={!canSubmit}
          onClick={handleCreateRoom}
        >
          Create Room
        </Button>

        {/* Back link */}
        <p className="mt-4 sm:mt-5 text-center text-sm text-latte-500 pb-safe">
          <a
            href="/select"
            className="text-coffee-500 hover:text-coffee-600 underline underline-offset-2"
          >
            Back to public matching
          </a>
        </p>
      </div>
    </main>
  );
}
