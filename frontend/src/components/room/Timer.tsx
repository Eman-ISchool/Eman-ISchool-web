'use client';

import { TURN_DURATION_SECONDS, TURN_WARNING_SECONDS } from '../../../../shared/constants';

// ─── Types ──────────────────────────────────────────────────────

interface TimerProps {
  remainingSeconds: number;
  isActive: boolean; // true when someone is speaking
}

// ─── Component ──────────────────────────────────────────────────

export function Timer({ remainingSeconds, isActive }: TimerProps) {
  const progress = isActive
    ? Math.max(0, Math.min(1, remainingSeconds / TURN_DURATION_SECONDS))
    : 0;
  const isWarning = isActive && remainingSeconds <= TURN_WARNING_SECONDS && remainingSeconds > 0;

  // Circular timer dimensions - responsive
  const svgSize = 96;
  const strokeWidth = 6;
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2">
      {/* Circular timer */}
      <div className="relative w-[72px] h-[72px] sm:w-[96px] sm:h-[96px]">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-cream-300"
          />
          {/* Progress circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={`transition-all duration-1000 ease-linear ${
              isWarning
                ? 'text-busy'
                : isActive
                  ? 'text-coffee-500'
                  : 'text-cream-300'
            }`}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isActive ? (
            <span
              className={`text-base sm:text-lg font-bold tabular-nums ${
                isWarning ? 'text-busy' : 'text-espresso-800'
              }`}
            >
              {timeDisplay}
            </span>
          ) : (
            <span className="text-[10px] sm:text-xs text-latte-500 text-center leading-tight px-1 sm:px-2">
              Waiting
            </span>
          )}
        </div>
      </div>

      {/* Label below */}
      {isActive && isWarning && (
        <p className="text-[10px] sm:text-xs font-medium text-busy animate-pulse">
          Time almost up!
        </p>
      )}
      {!isActive && (
        <p className="text-[10px] sm:text-xs text-latte-500">
          Waiting for speaker
        </p>
      )}
    </div>
  );
}
