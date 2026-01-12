'use client';

import { useState, useCallback } from 'react';
import { BaseHotspot } from './BaseHotspot';
import type { InfoHotspot as InfoHotspotType, VRLanguage } from '@/types/vr';

/**
 * Props for the InfoHotspot component
 */
export interface InfoHotspotProps {
  /** Hotspot data */
  hotspot: InfoHotspotType;
  /** Current language for content display */
  language?: VRLanguage;
  /** Callback when hotspot is clicked */
  onClick?: (hotspotId: string) => void;
  /** Callback when info panel should be shown */
  onShowInfo?: (hotspot: InfoHotspotType) => void;
}

/**
 * InfoHotspot Component
 *
 * Displays an informational hotspot that shows educational content when clicked.
 * Uses a distinctive blue color to indicate information points.
 *
 * Features:
 * - Displays educational content in info panels
 * - Supports rich content (text, images, video, audio)
 * - Bilingual support (Arabic & English)
 * - Can link to related hotspots
 *
 * @example
 * ```tsx
 * <InfoHotspot
 *   hotspot={infoHotspotData}
 *   language="en"
 *   onShowInfo={(hotspot) => setActiveInfo(hotspot)}
 * />
 * ```
 */
export function InfoHotspot({
  hotspot,
  language = 'en',
  onClick,
  onShowInfo,
}: InfoHotspotProps) {
  const [interacted, setInteracted] = useState(false);

  const handleClick = useCallback(() => {
    onClick?.(hotspot.id);
    onShowInfo?.(hotspot);
    setInteracted(true);
  }, [hotspot, onClick, onShowInfo]);

  const label = hotspot.title[language];

  return (
    <BaseHotspot
      id={hotspot.id}
      position={hotspot.position}
      color={interacted ? '#10b981' : hotspot.color || '#3b82f6'} // Blue for info, green when viewed
      scale={hotspot.scale || 1}
      icon={hotspot.icon || 'ℹ️'}
      isVisible={hotspot.isVisible !== false}
      label={label}
      onClick={handleClick}
      enablePulse={!interacted}
    />
  );
}

export default InfoHotspot;
