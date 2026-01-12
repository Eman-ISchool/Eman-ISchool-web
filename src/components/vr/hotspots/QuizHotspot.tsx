'use client';

import { useState, useCallback } from 'react';
import { BaseHotspot } from './BaseHotspot';
import type { QuizHotspot as QuizHotspotType, VRLanguage } from '@/types/vr';

/**
 * Props for the QuizHotspot component
 */
export interface QuizHotspotProps {
  /** Hotspot data */
  hotspot: QuizHotspotType;
  /** Current language for content display */
  language?: VRLanguage;
  /** Callback when hotspot is clicked */
  onClick?: (hotspotId: string) => void;
  /** Callback when quiz should be shown */
  onShowQuiz?: (hotspot: QuizHotspotType) => void;
  /** Whether the quiz has been answered */
  isAnswered?: boolean;
}

/**
 * QuizHotspot Component
 *
 * Displays a quiz hotspot that presents educational questions when clicked.
 * Uses a yellow color to indicate quiz/test elements.
 *
 * Features:
 * - Displays multiple-choice questions
 * - Tracks answer correctness
 * - Shows explanations after answering
 * - Awards points for correct answers
 * - Changes color based on completion state
 *
 * @example
 * ```tsx
 * <QuizHotspot
 *   hotspot={quizHotspotData}
 *   language="en"
 *   onShowQuiz={(hotspot) => displayQuiz(hotspot)}
 *   isAnswered={false}
 * />
 * ```
 */
export function QuizHotspot({
  hotspot,
  language = 'en',
  onClick,
  onShowQuiz,
  isAnswered = false,
}: QuizHotspotProps) {
  const [completed, setCompleted] = useState(isAnswered);

  const handleClick = useCallback(() => {
    onClick?.(hotspot.id);
    onShowQuiz?.(hotspot);
    if (!completed) {
      setCompleted(true);
    }
  }, [hotspot, onClick, onShowQuiz, completed]);

  const label = hotspot.title[language];

  return (
    <BaseHotspot
      id={hotspot.id}
      position={hotspot.position}
      color={completed ? '#10b981' : hotspot.color || '#eab308'} // Yellow for quiz, green when answered
      scale={hotspot.scale || 1.1}
      icon={hotspot.icon || '❓'}
      isVisible={hotspot.isVisible !== false}
      label={label}
      onClick={handleClick}
      enablePulse={!completed}
    />
  );
}

export default QuizHotspot;
