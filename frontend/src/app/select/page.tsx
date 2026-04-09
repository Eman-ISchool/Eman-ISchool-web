'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useSessionStore } from '@/lib/store';
import { joinQueue } from '@/services/api';
import { DRINK_OPTIONS, DEFAULT_TOPICS } from '../../../../shared/constants';
import type { DrinkType } from '../../../../shared/types';

// ─── Page ───────────────────────────────────────────────────────

export default function SelectPage() {
  const router = useRouter();

  const session = useSessionStore((s) => s.session);
  const token = useSessionStore((s) => s.token);
  const hydrate = useSessionStore((s) => s.hydrate);
  const setPreferences = useSessionStore((s) => s.setPreferences);

  const [mounted, setMounted] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<DrinkType | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const activeTopic = selectedTopic === '__custom__' ? customTopic.trim() : selectedTopic;

  const canSubmit =
    selectedDrink !== null &&
    activeTopic !== null &&
    activeTopic.length >= 2;

  const handleFindMatch = useCallback(async () => {
    if (!canSubmit || !token || !selectedDrink || !activeTopic) return;

    setError(null);
    setLoading(true);
    try {
      setPreferences(selectedDrink, activeTopic);
      await joinQueue(token, selectedDrink, activeTopic);
      router.push('/waiting');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to join queue. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [canSubmit, token, selectedDrink, activeTopic, setPreferences, router]);

  // Don't render until hydration is complete
  if (!mounted || !token) {
    return (
      <main className="min-h-screen-safe flex items-center justify-center bg-cream-50">
        <div className="waiting-pulse text-coffee-400 text-lg">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen-safe flex flex-col bg-cream-50">
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* ── Header ───────────────────────────────────────── */}
        <div className="mb-5 sm:mb-8 text-center">
          <h1 className="text-2xl font-bold text-espresso-800 sm:text-3xl">
            Set Your Preferences
          </h1>
          {session && (
            <p className="mt-2 text-base text-mocha-500">
              Hey {session.nickname}, pick your drink and a topic.
            </p>
          )}
        </div>

        {/* ── Drink Selection ──────────────────────────────── */}
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
                <span className="block text-2xl sm:text-4xl mb-1 sm:mb-2" role="img" aria-label={drink.label}>
                  {drink.emoji}
                </span>
                <span className="block text-xs sm:text-base font-medium text-espresso-800">
                  {drink.label}
                </span>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Topic Selection ──────────────────────────────── */}
        <section className="mb-5 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-espresso-800 mb-2 sm:mb-3">
            What do you want to talk about?
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

            {/* Custom topic card */}
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

        {/* ── Error ────────────────────────────────────────── */}
        {error && (
          <p className="mb-4 text-center text-sm text-red-500">{error}</p>
        )}

        {/* ── Submit ───────────────────────────────────────── */}
        <Button
          size="lg"
          fullWidth
          loading={loading}
          disabled={!canSubmit}
          onClick={handleFindMatch}
        >
          Find a Match
        </Button>

        {/* ── Private room link ────────────────────────────── */}
        <p className="mt-4 sm:mt-5 text-center text-sm text-latte-500 pb-safe">
          Or{' '}
          <a
            href="/create"
            className="text-coffee-500 hover:text-coffee-600 underline underline-offset-2"
          >
            create a private room
          </a>
        </p>
      </div>
    </main>
  );
}
