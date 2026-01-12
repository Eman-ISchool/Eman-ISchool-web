'use client';

import { useState, useCallback } from 'react';
import { BaseHotspot } from './BaseHotspot';
import type { InteractiveHotspot as InteractiveHotspotType, VRLanguage } from '@/types/vr';

/**
 * Props for the InteractiveHotspot component
 */
export interface InteractiveHotspotProps {
  /** Hotspot data */
  hotspot: InteractiveHotspotType;
  /** Current language for content display */
  language?: VRLanguage;
  /** Callback when hotspot is clicked */
  onClick?: (hotspotId: string, interactionType: string) => void;
  /** Callback when interaction should be triggered */
  onInteract?: (hotspot: InteractiveHotspotType) => void;
}

/**
 * InteractiveHotspot Component
 *
 * Displays an interactive hotspot that triggers custom interactions with 3D models.
 * Uses an orange color to indicate interactive elements.
 *
 * Supported interactions:
 * - rotate: Rotates the 3D model
 * - scale: Scales the 3D model up/down
 * - animate: Plays an animation on the model
 * - toggle: Toggles visibility or state
 *
 * @example
 * ```tsx
 * <InteractiveHotspot
 *   hotspot={interactiveHotspotData}
 *   language="en"
 *   onInteract={(hotspot) => handleInteraction(hotspot)}
 * />
 * ```
 */
export function InteractiveHotspot({
  hotspot,
  language = 'en',
  onClick,
  onInteract,
}: InteractiveHotspotProps) {
  const [isActive, setIsActive] = useState(false);

  const handleClick = useCallback(() => {
    onClick?.(hotspot.id, hotspot.interactionType);
    onInteract?.(hotspot);
    setIsActive(!isActive);
  }, [hotspot, onClick, onInteract, isActive]);

  const label = hotspot.title[language];

  // Icon based on interaction type
  const getIcon = () => {
    switch (hotspot.interactionType) {
      case 'rotate':
        return '🔄';
      case 'scale':
        return '🔍';
      case 'animate':
        return '▶️';
      case 'toggle':
        return '🔀';
      default:
        return '⚡';
    }
  };

  return (
    <BaseHotspot
      id={hotspot.id}
      position={hotspot.position}
      color={isActive ? '#10b981' : hotspot.color || '#f97316'} // Orange for interactive
      scale={hotspot.scale || 1}
      icon={hotspot.icon || getIcon()}
      isVisible={hotspot.isVisible !== false}
      label={label}
      onClick={handleClick}
      enablePulse={!isActive}
    />
  );
}

export default InteractiveHotspot;
