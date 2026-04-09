'use client';

import { Hand, Mic } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// ─── Types ──────────────────────────────────────────────────────

interface TurnIndicatorProps {
  currentSpeakerNickname: string | null;
  isMyTurn: boolean;
  myQueuePosition: number; // -1 if not in queue
  onRequestTurn: () => void;
  onReleaseTurn: () => void;
}

// ─── Component ──────────────────────────────────────────────────

export function TurnIndicator({
  currentSpeakerNickname,
  isMyTurn,
  myQueuePosition,
  onRequestTurn,
  onReleaseTurn,
}: TurnIndicatorProps) {
  return (
    <div className="rounded-2xl bg-white border border-cream-300 shadow-sm p-3 sm:p-4">
      {/* Current speaker banner */}
      <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
        <div
          className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full shrink-0 ${
            isMyTurn
              ? 'bg-online/15 text-online'
              : currentSpeakerNickname
                ? 'bg-coffee-100 text-coffee-600'
                : 'bg-cream-200 text-latte-500'
          }`}
        >
          <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>

        <div className="flex-1 min-w-0">
          {isMyTurn ? (
            <>
              <p className="text-sm font-bold text-online">Your turn!</p>
              <p className="text-xs text-mocha-500">
                Speak now -- everyone is listening.
              </p>
            </>
          ) : currentSpeakerNickname ? (
            <>
              <p className="text-sm font-semibold text-espresso-800 truncate">
                {currentSpeakerNickname} is speaking
              </p>
              <p className="text-xs text-mocha-500">
                Please wait for your turn.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-latte-500">
                No one is speaking
              </p>
              <p className="text-xs text-latte-500">
                Request a turn to start talking.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Queue position indicator */}
      {myQueuePosition >= 0 && !isMyTurn && (
        <p className="text-xs text-center text-coffee-600 font-medium mb-2.5 sm:mb-3 bg-coffee-50 rounded-lg py-1.5">
          You are #{myQueuePosition + 1} in the queue
        </p>
      )}

      {/* Action button */}
      {isMyTurn ? (
        <Button
          size="sm"
          fullWidth
          variant="secondary"
          onClick={onReleaseTurn}
        >
          Done Speaking
        </Button>
      ) : myQueuePosition >= 0 ? (
        <Button
          size="sm"
          fullWidth
          variant="outline"
          disabled
        >
          <Hand className="h-4 w-4" />
          In Queue (#{myQueuePosition + 1})
        </Button>
      ) : (
        <Button
          size="sm"
          fullWidth
          variant="outline"
          onClick={onRequestTurn}
        >
          <Hand className="h-4 w-4" />
          Request to Speak
        </Button>
      )}
    </div>
  );
}
