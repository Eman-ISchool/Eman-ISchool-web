'use client';

import { Mic, MicOff, WifiOff } from 'lucide-react';
import type { Participant, ParticipantStatus } from '../../../../shared/types';
import { ParticipantStatus as PStatus } from '../../../../shared/types';

// ─── Types ──────────────────────────────────────────────────────

interface ParticipantListProps {
  participants: Participant[];
  currentSpeakerId: string | null;
  myParticipantId: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────

function getInitials(nickname: string): string {
  return nickname
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function statusLabel(status: ParticipantStatus): string | null {
  if (status === PStatus.RECONNECTING) return 'Reconnecting...';
  if (status === PStatus.DISCONNECTED) return 'Disconnected';
  return null;
}

// ─── Component ──────────────────────────────────────────────────

export function ParticipantList({
  participants,
  currentSpeakerId,
  myParticipantId,
}: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-4 text-latte-500 text-sm">
        No one else here yet...
      </div>
    );
  }

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-mocha-500 px-1">
        Participants ({participants.length})
      </h3>

      <ul className="space-y-1 sm:space-y-1.5">
        {participants.map((p) => {
          const isSpeaking = p.id === currentSpeakerId;
          const isMe = p.id === myParticipantId;
          const badStatus = statusLabel(p.status);

          return (
            <li
              key={p.id}
              className="flex items-center gap-2.5 sm:gap-3 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 bg-white/60 border border-cream-300"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white transition-shadow duration-300 ${
                    isSpeaking
                      ? 'ring-[3px] ring-online shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                      : ''
                  }`}
                  style={{ backgroundColor: p.avatarColor || '#d4852f' }}
                >
                  {getInitials(p.nickname)}
                </div>
                {/* Speaking pulse */}
                {isSpeaking && (
                  <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-online border-2 border-white animate-pulse" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-espresso-800 truncate">
                  {p.nickname}
                  {isMe && (
                    <span className="ml-1.5 text-xs text-coffee-500">(you)</span>
                  )}
                </p>
                {badStatus ? (
                  <p className="text-xs text-away flex items-center gap-1">
                    <WifiOff className="h-3 w-3" />
                    {badStatus}
                  </p>
                ) : isSpeaking ? (
                  <p className="text-xs text-online font-medium">Speaking</p>
                ) : null}
              </div>

              {/* Mute indicator */}
              <div className="shrink-0">
                {p.isMuted ? (
                  <MicOff className="h-4 w-4 text-latte-500" />
                ) : (
                  <Mic className="h-4 w-4 text-coffee-500" />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
