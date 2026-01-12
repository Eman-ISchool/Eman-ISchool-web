'use client';

import { useCallback } from 'react';
import { BaseHotspot } from './BaseHotspot';
import type { NavigationHotspot as NavigationHotspotType, VRLanguage } from '@/types/vr';

/**
 * Props for the NavigationHotspot component
 */
export interface NavigationHotspotProps {
  /** Hotspot data */
  hotspot: NavigationHotspotType;
  /** Current language for content display */
  language?: VRLanguage;
  /** Callback when hotspot is clicked */
  onClick?: (hotspotId: string, targetSceneId: string) => void;
  /** Callback when scene navigation is requested */
  onNavigate?: (targetSceneId: string, transitionDuration?: number) => void;
}

/**
 * NavigationHotspot Component
 *
 * Displays a navigation hotspot that teleports the user to another scene when clicked.
 * Uses a distinctive purple/magenta color to indicate teleportation points.
 *
 * Features:
 * - Teleports to target scene on click
 * - Optional transition duration for smooth scene changes
 * - Optional preview image of target scene
 * - Visual indication of navigation purpose
 *
 * @example
 * ```tsx
 * <NavigationHotspot
 *   hotspot={navHotspotData}
 *   language="en"
 *   onNavigate={(sceneId) => changeScene(sceneId)}
 * />
 * ```
 */
export function NavigationHotspot({
  hotspot,
  language = 'en',
  onClick,
  onNavigate,
}: NavigationHotspotProps) {
  const handleClick = useCallback(() => {
    onClick?.(hotspot.id, hotspot.targetSceneId);
    onNavigate?.(hotspot.targetSceneId, hotspot.transitionDuration);
  }, [hotspot, onClick, onNavigate]);

  const label = hotspot.title[language];

  return (
    <BaseHotspot
      id={hotspot.id}
      position={hotspot.position}
      color={hotspot.color || '#a855f7'} // Purple for navigation
      scale={hotspot.scale || 1.2} // Slightly larger to stand out
      icon={hotspot.icon || '🚪'}
      isVisible={hotspot.isVisible !== false}
      label={label}
      onClick={handleClick}
      enablePulse={true}
    />
  );
}

export default NavigationHotspot;
