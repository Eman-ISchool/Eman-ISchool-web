'use client';

import { VRHotspot } from './VRHotspot';
import type { VRHotspotProps } from './VRHotspot';
import type { AnyHotspot } from '@/types/vr';

/**
 * Props for the VRHotspots component
 */
export interface VRHotspotsProps extends Omit<VRHotspotProps, 'hotspot'> {
  /** Array of hotspots to render */
  hotspots: AnyHotspot[];
}

/**
 * VRHotspots Component
 *
 * Renders multiple hotspots from an array, typically from a VR scene.
 * Provides a convenient way to render all hotspots in a scene with
 * unified event handlers.
 *
 * Features:
 * - Renders multiple hotspots efficiently
 * - Shared event handlers for all hotspots
 * - Type-safe hotspot rendering
 * - Filters out hidden hotspots
 *
 * @example
 * ```tsx
 * <VRHotspots
 *   hotspots={scene.hotspots}
 *   language="en"
 *   onClick={(id, type) => trackInteraction(id, type)}
 *   onShowInfo={(hotspot) => setActiveInfo(hotspot)}
 *   onNavigate={(sceneId) => changeScene(sceneId)}
 * />
 * ```
 */
export function VRHotspots({ hotspots, ...props }: VRHotspotsProps) {
  return (
    <group>
      {hotspots
        .filter((hotspot) => hotspot.isVisible !== false)
        .map((hotspot) => (
          <VRHotspot key={hotspot.id} hotspot={hotspot} {...props} />
        ))}
    </group>
  );
}

export default VRHotspots;
