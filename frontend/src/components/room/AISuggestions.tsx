'use client';

import { Sparkles, HelpCircle, ArrowRight, Lightbulb, MessageCircle } from 'lucide-react';
import type { AISuggestion } from '../../../../shared/types';

// ─── Types ──────────────────────────────────────────────────────

interface AISuggestionsProps {
  suggestions: AISuggestion[];
  aiAvailable: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────

const typeConfig: Record<
  AISuggestion['type'],
  { icon: typeof Sparkles; label: string; color: string }
> = {
  question: {
    icon: HelpCircle,
    label: 'Question',
    color: 'text-coffee-600 bg-coffee-50',
  },
  topic_pivot: {
    icon: ArrowRight,
    label: 'New Direction',
    color: 'text-mocha-600 bg-cream-200',
  },
  fun_fact: {
    icon: Lightbulb,
    label: 'Fun Fact',
    color: 'text-coffee-700 bg-coffee-100',
  },
  icebreaker: {
    icon: MessageCircle,
    label: 'Icebreaker',
    color: 'text-mocha-500 bg-cream-100',
  },
};

// ─── Component ──────────────────────────────────────────────────

export function AISuggestions({ suggestions, aiAvailable }: AISuggestionsProps) {
  return (
    <div className="rounded-2xl bg-white border border-cream-300 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-cream-200 bg-cream-50">
        <Sparkles className="h-4 w-4 text-coffee-500" />
        <h3 className="text-sm font-semibold text-espresso-800">
          AI Suggestions
        </h3>
        {!aiAvailable && (
          <span className="ml-auto text-xs text-latte-500 bg-cream-200 px-2 py-0.5 rounded-full">
            Unavailable
          </span>
        )}
      </div>

      {/* Content */}
      <div className="max-h-48 sm:max-h-64 overflow-y-auto custom-scrollbar">
        {!aiAvailable ? (
          <div className="px-3 sm:px-4 py-4 sm:py-6 text-center">
            <Sparkles className="h-8 w-8 text-cream-400 mx-auto mb-2" />
            <p className="text-sm text-latte-500">
              AI suggestions are currently unavailable.
            </p>
            <p className="text-xs text-cream-500 mt-1">
              Conversation starters will appear when the service reconnects.
            </p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="px-3 sm:px-4 py-4 sm:py-6 text-center">
            <Sparkles className="h-8 w-8 text-coffee-200 mx-auto mb-2 waiting-pulse" />
            <p className="text-sm text-mocha-500">
              Listening to the conversation...
            </p>
            <p className="text-xs text-latte-500 mt-1">
              Suggestions will appear as the conversation flows.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-cream-200">
            {suggestions
              .slice()
              .reverse()
              .map((suggestion) => {
                const config = typeConfig[suggestion.type];
                const Icon = config.icon;

                return (
                  <li
                    key={suggestion.id}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-cream-50 transition-colors duration-150"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-lg ${config.color}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-coffee-600 mb-0.5">
                          {config.label}
                        </p>
                        <p className="text-sm text-espresso-800 leading-relaxed">
                          {suggestion.content}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </div>
  );
}
