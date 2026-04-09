'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSessionStore } from '@/lib/store';
import { createSession } from '@/services/api';
import {
  NICKNAME_MIN_LENGTH,
  NICKNAME_MAX_LENGTH,
} from '../../../../shared/constants';

// ─── Validation ─────────────────────────────────────────────────

const NICKNAME_PATTERN = /^[a-zA-Z0-9 \-_]+$/;

function validateNickname(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < NICKNAME_MIN_LENGTH) {
    return `Nickname must be at least ${NICKNAME_MIN_LENGTH} characters`;
  }
  if (trimmed.length > NICKNAME_MAX_LENGTH) {
    return `Nickname must be at most ${NICKNAME_MAX_LENGTH} characters`;
  }
  if (!NICKNAME_PATTERN.test(trimmed)) {
    return 'Only letters, numbers, spaces, hyphens, and underscores are allowed';
  }
  return null;
}

// ─── Page ───────────────────────────────────────────────────────

export default function JoinPage() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const setToken = useSessionStore((s) => s.setToken);

  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);

      const validationError = validateNickname(nickname);
      if (validationError) {
        setError(validationError);
        return;
      }

      setLoading(true);
      try {
        const data = await createSession(nickname.trim());
        setSession(data.session);
        setToken(data.token);
        router.push('/select');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Something went wrong. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    },
    [nickname, router, setSession, setToken],
  );

  return (
    <main className="min-h-screen-safe flex flex-col items-center justify-center bg-cream-50 px-4 sm:px-6 py-6 sm:py-8">
      <div className="w-full max-w-md">
        {/* ── Header ───────────────────────────────────────── */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="mx-auto mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-coffee-100 text-coffee-600">
            <Coffee className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-espresso-800 sm:text-3xl">
            Join the Gathering
          </h1>
          <p className="mt-2 text-base text-mocha-500">
            Pick a nickname to get started. No sign-up needed.
          </p>
        </div>

        {/* ── Form ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <Input
            label="Nickname"
            placeholder="e.g. CoffeeLover42"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              if (error) setError(null);
            }}
            error={error ?? undefined}
            helperText={`${nickname.trim().length}/${NICKNAME_MAX_LENGTH} characters`}
            maxLength={NICKNAME_MAX_LENGTH}
            autoFocus
          />

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={loading}
          >
            Enter as Guest
          </Button>
        </form>

        {/* ── Back link ────────────────────────────────────── */}
        <p className="mt-5 sm:mt-6 text-center text-sm text-latte-500 pb-safe">
          <a
            href="/"
            className="text-coffee-500 hover:text-coffee-600 underline underline-offset-2"
          >
            Back to home
          </a>
        </p>
      </div>
    </main>
  );
}
