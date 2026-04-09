'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, RefreshCw, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSessionStore } from '@/lib/store';

// ─── Page ───────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();

  const session = useSessionStore((s) => s.session);
  const token = useSessionStore((s) => s.token);
  const drinkType = useSessionStore((s) => s.drinkType);
  const topic = useSessionStore((s) => s.topic);
  const hydrate = useSessionStore((s) => s.hydrate);
  const clearSession = useSessionStore((s) => s.clearSession);

  const [mounted, setMounted] = useState(false);

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

  const handleChangeNickname = useCallback(() => {
    clearSession();
    router.push('/join');
  }, [clearSession, router]);

  const handleLeaveSession = useCallback(() => {
    clearSession();
    router.push('/');
  }, [clearSession, router]);

  // Don't render until hydration is complete
  if (!mounted || !token || !session) {
    return (
      <main className="min-h-screen-safe flex items-center justify-center bg-cream-50">
        <div className="waiting-pulse text-coffee-400 text-lg">Loading...</div>
      </main>
    );
  }

  // Calculate time info
  const createdDate = new Date(session.createdAt);
  const expiresDate = new Date(session.expiresAt);
  const now = new Date();
  const hoursRemaining = Math.max(
    0,
    Math.round((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60)),
  );

  return (
    <main className="min-h-screen-safe flex flex-col bg-cream-50">
      <div className="flex-1 w-full max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Header */}
        <div className="mb-5 sm:mb-8 text-center">
          {/* Avatar */}
          <div
            className="mx-auto mb-3 sm:mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full text-xl sm:text-2xl font-bold text-white shadow-lg"
            style={{ backgroundColor: session.avatarColor || '#d4852f' }}
          >
            {session.nickname
              .split(/\s+/)
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <h1 className="text-2xl font-bold text-espresso-800 sm:text-3xl">
            {session.nickname}
          </h1>
          <p className="mt-1 text-sm text-mocha-500">Guest Session</p>
        </div>

        {/* Session info card */}
        <Card padding="lg" className="mb-3 sm:mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-mocha-500 mb-4">
            Session Details
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-mocha-500 flex items-center gap-2">
                <User className="h-4 w-4" />
                Nickname
              </span>
              <span className="text-sm font-medium text-espresso-800">
                {session.nickname}
              </span>
            </div>

            <div className="h-px bg-cream-200" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-mocha-500">Session created</span>
              <span className="text-sm font-medium text-espresso-800">
                {createdDate.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="h-px bg-cream-200" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-mocha-500">Time remaining</span>
              <span
                className={`text-sm font-medium ${
                  hoursRemaining <= 2 ? 'text-busy' : 'text-espresso-800'
                }`}
              >
                {hoursRemaining}h left
              </span>
            </div>
          </div>
        </Card>

        {/* Preferences card */}
        {(drinkType || topic) && (
          <Card padding="lg" className="mb-3 sm:mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-mocha-500 mb-4">
              Last Preferences
            </h2>
            <div className="space-y-3">
              {drinkType && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-mocha-500 flex items-center gap-2">
                    <Coffee className="h-4 w-4" />
                    Drink
                  </span>
                  <span className="text-sm font-medium text-espresso-800 capitalize">
                    {drinkType}
                  </span>
                </div>
              )}
              {drinkType && topic && <div className="h-px bg-cream-200" />}
              {topic && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-mocha-500">Topic</span>
                  <span className="text-sm font-medium text-espresso-800">
                    {topic}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-3 mt-4 sm:mt-6">
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={handleChangeNickname}
          >
            <RefreshCw className="h-4 w-4" />
            Change Nickname
          </Button>

          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={handleLeaveSession}
            className="text-busy hover:text-busy hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Leave Session
          </Button>
        </div>

        {/* Nav links */}
        <div className="mt-6 sm:mt-8 flex justify-center gap-4 text-sm pb-safe">
          <a
            href="/"
            className="text-coffee-500 hover:text-coffee-600 underline underline-offset-2"
          >
            Home
          </a>
          <a
            href="/select"
            className="text-coffee-500 hover:text-coffee-600 underline underline-offset-2"
          >
            Find a Match
          </a>
          <a
            href="/create"
            className="text-coffee-500 hover:text-coffee-600 underline underline-offset-2"
          >
            Create Room
          </a>
        </div>
      </div>
    </main>
  );
}
