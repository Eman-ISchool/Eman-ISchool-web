'use client';

import { InfoHotspot } from './InfoHotspot';
import { NavigationHotspot } from './NavigationHotspot';
import { InteractiveHotspot } from './InteractiveHotspot';
import { QuizHotspot } from './QuizHotspot';
import type {
  AnyHotspot,
  VRLanguage,
  InfoHotspot as InfoHotspotType,
  NavigationHotspot as NavigationHotspotType,
  InteractiveHotspot as InteractiveHotspotType,
  QuizHotspot as QuizHotspotType,
} from '@/types/vr';

/**
 * Props for the VRHotspot component
 */
export interface VRHotspotProps {
  /** Hotspot data - can be any hotspot type */
  hotspot: AnyHotspot;
  /** Current language for content display */
  language?: VRLanguage;
  /** Callback when any hotspot is clicked */
  onClick?: (hotspotId: string, hotspotType: string) => void;
  /** Callback when info hotspot should show content */
  onShowInfo?: (hotspot: InfoHotspotType) => void;
  /** Callback when navigation hotspot is activated */
  onNavigate?: (targetSceneId: string, transitionDuration?: number) => void;
  /** Callback when interactive hotspot is triggered */
  onInteract?: (hotspot: InteractiveHotspotType) => void;
  /** Callback when quiz hotspot should show questions */
  onShowQuiz?: (hotspot: QuizHotspotType) => void;
  /** For quiz hotspots - whether the quiz has been answered */
  answeredQuizIds?: string[];
}

/**
 * VRHotspot Component
 *
 * Universal hotspot component that renders the appropriate hotspot type
 * based on the provided hotspot data. Acts as a dispatcher to specialized
 * hotspot components.
 *
 * Supported hotspot types:
 * - info: Educational information points (blue)
 * - navigation: Scene teleportation points (purple)
 * - interactive: 3D model interactions (orange)
 * - quiz: Educational questions (yellow)
 *
 * Features:
 * - Type-safe dispatching to specialized components
 * - Unified callback interface
 * - Bilingual support (Arabic & English)
 * - Visual differentiation by type
 * - State tracking (viewed, answered, etc.)
 *
 * @example
 * ```tsx
 * <VRHotspot
 *   hotspot={hotspotData}
 *   language="en"
 *   onClick={(id, type) => trackInteraction(id, type)}
 *   onShowInfo={(hotspot) => setActiveInfo(hotspot)}
 *   onNavigate={(sceneId) => changeScene(sceneId)}
 * />
 * ```
 */
export function VRHotspot({
  hotspot,
  language = 'en',
  onClick,
  onShowInfo,
  onNavigate,
  onInteract,
  onShowQuiz,
  answeredQuizIds = [],
}: VRHotspotProps) {
  // Generic click handler that includes type information
  const handleClick = (hotspotId: string) => {
    onClick?.(hotspotId, hotspot.type);
  };

  // Dispatch to appropriate hotspot type component
  switch (hotspot.type) {
    case 'info':
      return (
        <InfoHotspot
          hotspot={hotspot as InfoHotspotType}
          language={language}
          onClick={handleClick}
          onShowInfo={onShowInfo}
        />
      );

    case 'navigation':
      return (
        <NavigationHotspot
          hotspot={hotspot as NavigationHotspotType}
          language={language}
          onClick={(id, targetSceneId) => {
            handleClick(id);
          }}
          onNavigate={onNavigate}
        />
      );

    case 'interactive':
      return (
        <InteractiveHotspot
          hotspot={hotspot as InteractiveHotspotType}
          language={language}
          onClick={(id) => handleClick(id)}
          onInteract={onInteract}
        />
      );

    case 'quiz':
      return (
        <QuizHotspot
          hotspot={hotspot as QuizHotspotType}
          language={language}
          onClick={handleClick}
          onShowQuiz={onShowQuiz}
          isAnswered={answeredQuizIds.includes(hotspot.id)}
        />
      );

    default:
      // Fallback for unknown types
      console.warn(`Unknown hotspot type: ${(hotspot as any).type}`);
      return null;
  }
}

export default VRHotspot;
