'use client';

import { useState, useEffect } from 'react';
import type { VRCapabilities } from '@/types/vr';

/**
 * Hook to detect WebXR support and device capabilities
 *
 * This hook detects:
 * - WebXR API support
 * - VR headset availability
 * - AR support
 * - WebGL version support
 * - Device type (mobile/desktop)
 * - Performance characteristics
 *
 * @returns {VRCapabilities} Object containing device capability flags
 *
 * @example
 * ```tsx
 * const capabilities = useVRCapabilities();
 *
 * if (capabilities.hasWebXRSupport) {
 *   // Render VR experience
 * } else {
 *   // Show fallback
 * }
 * ```
 */
export function useVRCapabilities(): VRCapabilities {
  const [capabilities, setCapabilities] = useState<VRCapabilities>({
    hasWebXRSupport: false,
    hasVRHeadset: false,
    hasARSupport: false,
    hasHandTracking: false,
    hasControllers: false,
    displayMode: 'none',
    supportsWebGL2: false,
    isMobile: false,
    devicePixelRatio: 1,
  });

  useEffect(() => {
    const detectCapabilities = async () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const devicePixelRatio = window.devicePixelRatio || 1;

      // Check WebGL support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      const supportsWebGL2 = !!canvas.getContext('webgl2');

      // Check max texture size for performance estimation
      let maxTextureSize: number | undefined;
      if (gl) {
        maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      }

      // Estimate performance level based on device characteristics
      let performanceLevel: 'high' | 'medium' | 'low' = 'medium';
      if (maxTextureSize && maxTextureSize >= 16384 && !isMobile) {
        performanceLevel = 'high';
      } else if (maxTextureSize && maxTextureSize < 8192 || isMobile) {
        performanceLevel = 'low';
      }

      // Check WebXR support
      if ('xr' in navigator) {
        const xr = (navigator as any).xr;

        try {
          // Check VR support
          const vrSupported = await xr.isSessionSupported('immersive-vr');
          let arSupported = false;

          // Check AR support
          try {
            arSupported = await xr.isSessionSupported('immersive-ar');
          } catch (err) {
            // AR not supported
          }

          const hasWebXRSupport = vrSupported || arSupported;
          const displayMode = vrSupported ? 'immersive-vr' : arSupported ? 'immersive-ar' : 'inline';

          // For headset detection, we need to check if VR is supported and not on mobile
          // Mobile devices support WebXR but aren't headsets
          const hasVRHeadset = vrSupported && !isMobile;

          // Check for advanced features (hand tracking and controllers)
          // These require an active session to fully detect, so we make best guesses
          const hasHandTracking = false; // Would need active session to detect
          const hasControllers = hasVRHeadset; // Headsets typically have controllers

          setCapabilities({
            hasWebXRSupport,
            hasVRHeadset,
            hasARSupport: arSupported,
            hasHandTracking,
            hasControllers,
            displayMode,
            maxTextureSize,
            supportsWebGL2,
            performanceLevel,
            isMobile,
            devicePixelRatio,
          });
        } catch (err) {
          // WebXR API exists but session support check failed
          setCapabilities({
            hasWebXRSupport: false,
            hasVRHeadset: false,
            hasARSupport: false,
            hasHandTracking: false,
            hasControllers: false,
            displayMode: 'inline',
            maxTextureSize,
            supportsWebGL2,
            performanceLevel,
            isMobile,
            devicePixelRatio,
          });
        }
      } else {
        // No WebXR support at all
        setCapabilities({
          hasWebXRSupport: false,
          hasVRHeadset: false,
          hasARSupport: false,
          hasHandTracking: false,
          hasControllers: false,
          displayMode: 'none',
          maxTextureSize,
          supportsWebGL2,
          performanceLevel,
          isMobile,
          devicePixelRatio,
        });
      }
    };

    detectCapabilities();
  }, []);

  return capabilities;
}
