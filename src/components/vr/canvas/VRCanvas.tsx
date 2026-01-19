'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import type { VRMode } from '@/types/vr';

/**
 * Props for the VRCanvas component
 */
interface VRCanvasProps {
  /** The child components to render within the VR canvas */
  children?: React.ReactNode;
  /** Whether to enable XR mode by default */
  enableXR?: boolean;
  /** Initial VR mode (vr, 3d, or 2d) */
  mode?: VRMode;
  /** Camera field of view */
  fov?: number;
  /** Camera near plane */
  near?: number;
  /** Camera far plane */
  far?: number;
  /** Background color */
  backgroundColor?: string;
  /** Enable shadows */
  shadows?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Callback when XR session starts */
  onXRSessionStart?: () => void;
  /** Callback when XR session ends */
  onXRSessionEnd?: () => void;
  /** Callback when canvas errors occur */
  onError?: (error: Error) => void;
}

/**
 * VRCanvas Component
 *
 * Main wrapper component for VR experiences using React Three Fiber and WebXR.
 * Provides a responsive 3D canvas that supports both VR headsets and standard displays.
 *
 * Features:
 * - WebXR integration for VR headset support
 * - Responsive sizing
 * - Fallback for non-VR browsers
 * - Error handling
 * - Configurable camera and rendering settings
 *
 * @example
 * ```tsx
 * <VRCanvas enableXR mode="vr">
 *   <VRScene />
 *   <VRHotspots />
 * </VRCanvas>
 * ```
 */
export function VRCanvas({
  children,
  enableXR = true,
  mode = '3d',
  fov = 75,
  near = 0.1,
  far = 1000,
  backgroundColor = '#000000',
  shadows = false,
  className = '',
  onXRSessionStart,
  onXRSessionEnd,
  onError,
}: VRCanvasProps) {
  const [xrStore] = useState(() => createXRStore());
  const [hasError, setHasError] = useState(false);

  // Handle XR session events
  useEffect(() => {
    if (!enableXR) return;

    const handleSessionStart = () => {
      onXRSessionStart?.();
    };

    const handleSessionEnd = () => {
      onXRSessionEnd?.();
    };

    // Subscribe to XR store events
    const unsubscribe = xrStore.subscribe((state) => {
      if (state.session && !state.session.ended) {
        handleSessionStart();
      } else if (state.session?.ended) {
        handleSessionEnd();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [enableXR, xrStore, onXRSessionStart, onXRSessionEnd]);

  // Handle canvas errors
  const handleError = (error: Error) => {
    setHasError(true);
    onError?.(error);
  };

  // Error fallback UI
  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 text-white ${className}`}>
        <div className="text-center p-8">
          <h3 className="text-xl font-semibold mb-2">Unable to load VR experience</h3>
          <p className="text-gray-400">
            There was an error initializing the 3D environment. Please refresh the page or try a
            different browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      <Canvas
        camera={{
          fov,
          near,
          far,
          position: [0, 1.6, 0], // Average human eye height
        }}
        gl={{
          antialias: true,
          alpha: false,
          preserveDrawingBuffer: true,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(backgroundColor);
        }}
        shadows={shadows}
        dpr={[1, 2]} // Device pixel ratio range for performance
        onError={handleError}
      >
        {enableXR && mode === 'vr' ? (
          <XR store={xrStore}>
            <Suspense fallback={null}>{children}</Suspense>
          </XR>
        ) : (
          <Suspense fallback={null}>{children}</Suspense>
        )}
      </Canvas>

      {/* VR Enter/Exit Button - only shown when XR is enabled and supported */}
      {enableXR && mode === 'vr' && (
        <button
          className="absolute bottom-4 right-4 z-10 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
          onClick={() => xrStore.enterVR()}
          aria-label="Enter VR mode"
        >
          Enter VR
        </button>
      )}
    </div>
  );
}

/**
 * Loading fallback component for VR canvas
 */
export function VRCanvasLoading({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full h-full flex items-center justify-center bg-gray-900 ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading VR experience...</p>
      </div>
    </div>
  );
}

export default VRCanvas;
