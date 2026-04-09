'use client';

import { useState, useCallback } from 'react';
import { Coffee, MessageSquare, Users, Copy, Check, LogOut, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Room } from '../../../../shared/types';
import { RoomType } from '../../../../shared/types';
import { DRINK_OPTIONS } from '../../../../shared/constants';

// ─── Types ──────────────────────────────────────────────────────

interface TopicSidebarProps {
  room: Room;
  participantCount: number;
  onLeaveRoom: () => void;
}

// ─── Component ──────────────────────────────────────────────────

export function TopicSidebar({
  room,
  participantCount,
  onLeaveRoom,
}: TopicSidebarProps) {
  const [copied, setCopied] = useState(false);

  const drinkOption = DRINK_OPTIONS.find((d) => d.value === room.drinkType);
  const isPrivate = room.type === RoomType.PRIVATE;

  const handleCopyInvite = useCallback(async () => {
    if (!room.inviteCode) return;
    try {
      await navigator.clipboard.writeText(room.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text approach handled by UI
    }
  }, [room.inviteCode]);

  return (
    <div className="rounded-2xl bg-white border border-cream-300 shadow-sm overflow-hidden">
      {/* Topic */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-cream-200">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-4 w-4 text-coffee-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-mocha-500">
            Topic
          </span>
        </div>
        <p className="text-base font-semibold text-espresso-800 leading-snug">
          {room.topic}
        </p>
      </div>

      {/* Drink & Room Info */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-cream-200 space-y-2 sm:space-y-2.5">
        {/* Drink */}
        <div className="flex items-center gap-2">
          <Coffee className="h-4 w-4 text-coffee-500" />
          <span className="text-sm text-mocha-500">
            {drinkOption ? `${drinkOption.emoji} ${drinkOption.label}` : room.drinkType}
          </span>
        </div>

        {/* Participants */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-coffee-500" />
          <span className="text-sm text-mocha-500">
            {participantCount}/{room.maxParticipants} participants
          </span>
        </div>

        {/* Room type */}
        {isPrivate && (
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-coffee-500" />
            <span className="text-sm text-mocha-500">Private Room</span>
          </div>
        )}
      </div>

      {/* Invite code for private rooms */}
      {isPrivate && room.inviteCode && (
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-cream-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-mocha-500 mb-2">
            Invite Code
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-cream-100 text-espresso-800 font-mono text-sm font-bold px-3 py-2 rounded-lg text-center tracking-widest">
              {room.inviteCode}
            </code>
            <button
              onClick={handleCopyInvite}
              className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-cream-100 text-coffee-600 hover:bg-coffee-100 transition-colors"
              aria-label="Copy invite code"
            >
              {copied ? (
                <Check className="h-4 w-4 text-online" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Leave room */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3">
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          onClick={onLeaveRoom}
          className="text-busy hover:text-busy hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Leave Room
        </Button>
      </div>
    </div>
  );
}
