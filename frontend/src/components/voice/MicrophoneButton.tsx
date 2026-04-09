'use client';

import { Mic, MicOff, AlertCircle } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────

interface MicrophoneButtonProps {
  isMuted: boolean;
  isConnecting: boolean;
  error: string | null;
  hasPermission: boolean; // true if localStream is available
  onToggle: () => void;
  onRetry: () => void;
}

// ─── Component ──────────────────────────────────────────────────

export function MicrophoneButton({
  isMuted,
  isConnecting,
  error,
  hasPermission,
  onToggle,
  onRetry,
}: MicrophoneButtonProps) {
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center gap-1.5 sm:gap-2">
        <button
          onClick={onRetry}
          className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-red-50 border-2 border-busy text-busy transition-all duration-200 hover:bg-red-100 active:scale-95"
          aria-label="Microphone error - click to retry"
        >
          <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
        <p className="text-xs text-busy text-center max-w-[200px] leading-tight">
          {error}
        </p>
        <button
          onClick={onRetry}
          className="text-xs text-coffee-500 underline underline-offset-2 hover:text-coffee-600"
        >
          Try again
        </button>
      </div>
    );
  }

  // Connecting state
  if (isConnecting) {
    return (
      <div className="flex flex-col items-center gap-1.5 sm:gap-2">
        <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-cream-200 border-2 border-cream-400 text-latte-500">
          <Mic className="h-6 w-6 sm:h-7 sm:w-7 animate-pulse" />
        </div>
        <p className="text-xs text-latte-500">Connecting microphone...</p>
      </div>
    );
  }

  // Not yet initialized
  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center gap-1.5 sm:gap-2">
        <button
          onClick={onRetry}
          className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-cream-200 border-2 border-coffee-300 text-coffee-500 transition-all duration-200 hover:bg-coffee-50 hover:border-coffee-400 active:scale-95"
          aria-label="Enable microphone"
        >
          <MicOff className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
        <p className="text-xs text-mocha-500">Tap to enable mic</p>
      </div>
    );
  }

  // Active mic button
  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2">
      <button
        onClick={onToggle}
        className={`relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-95 ${
          isMuted
            ? 'bg-cream-200 border-cream-400 text-latte-500 hover:bg-cream-300'
            : 'bg-coffee-500 border-coffee-600 text-white hover:bg-coffee-600 shadow-lg shadow-coffee-500/25'
        }`}
        aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
      >
        {/* Audio level ring animation when unmuted */}
        {!isMuted && (
          <>
            <span className="absolute inset-0 rounded-full border-2 border-coffee-400 animate-ping opacity-20" />
            <span className="absolute inset-[-4px] rounded-full border border-coffee-300 animate-pulse opacity-30" />
          </>
        )}
        {isMuted ? (
          <MicOff className="h-6 w-6 sm:h-7 sm:w-7" />
        ) : (
          <Mic className="h-6 w-6 sm:h-7 sm:w-7" />
        )}
      </button>
      <p className="text-xs text-mocha-500">
        {isMuted ? 'Muted' : 'Tap to mute'}
      </p>
    </div>
  );
}
