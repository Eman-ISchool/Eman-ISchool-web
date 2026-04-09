'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Coffee, MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSessionStore } from '@/lib/store';

// ─── Feature Card Data ──────────────────────────────────────────

const features = [
  {
    icon: Coffee,
    title: 'Choose Your Drink',
    description:
      'Pick your favourite beverage and we will match you with someone sipping the same thing.',
  },
  {
    icon: Users,
    title: 'Join a Room',
    description:
      'Get matched into a cosy group of 3-6 people who share your interests.',
  },
  {
    icon: MessageCircle,
    title: 'Chat & Connect',
    description:
      'Take turns sharing stories with gentle turn-taking and AI-powered conversation starters.',
  },
] as const;

// ─── Page ───────────────────────────────────────────────────────

export default function LandingPage() {
  const session = useSessionStore((s) => s.session);
  const hydrate = useSessionStore((s) => s.hydrate);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  const hasSession = mounted && session !== null;

  return (
    <main className="min-h-screen-safe flex flex-col bg-cream-50">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-10 pb-6 sm:pt-24 sm:pb-16 text-center">
        {/* Coffee cup icon */}
        <div className="mb-4 sm:mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-coffee-100 text-coffee-600 sm:h-24 sm:w-24">
          <Coffee className="h-8 w-8 sm:h-12 sm:w-12" strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-espresso-800 sm:text-5xl lg:text-6xl">
          Coffee Gathering
        </h1>

        <p className="mt-3 sm:mt-4 max-w-md text-base text-mocha-500 sm:text-xl px-2">
          Meet interesting people over a virtual cup of coffee. No sign-up
          required -- just pick a drink and start chatting.
        </p>

        {/* ── Returning user greeting ────────────────────────── */}
        {hasSession && (
          <p className="mt-4 text-base font-medium text-coffee-600">
            Welcome back, {session.nickname}!
          </p>
        )}

        {/* ── CTA Buttons ────────────────────────────────────── */}
        <div className="mt-6 sm:mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:max-w-none sm:justify-center sm:gap-4">
          <Link href={hasSession ? '/select' : '/join'} className="w-full sm:w-auto">
            <Button size="lg" fullWidth className="sm:w-auto sm:min-w-[200px]">
              {hasSession ? 'Continue to Drinks' : 'Join a Gathering'}
            </Button>
          </Link>

          <Link href={hasSession ? '/create' : '/join'} className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              className="sm:w-auto sm:min-w-[200px]"
            >
              Create Private Room
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="w-full px-4 sm:px-6 pb-8 sm:pb-24">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
          {features.map((f) => (
            <Card key={f.title} padding="lg" className="text-center">
              <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-coffee-100 text-coffee-600">
                <f.icon className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-espresso-800">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-mocha-500 leading-relaxed">
                {f.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="py-4 sm:py-6 text-center text-sm text-latte-500 pb-safe">
        Made with warmth. No account needed.
      </footer>
    </main>
  );
}
