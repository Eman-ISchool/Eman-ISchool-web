'use client';

import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { VRScene as VRSceneType } from '@/types/vr';

/**
 * Props for the VRScene component
 */
interface VRSceneProps {
  /** Scene data containing environment and configuration */
  scene: VRSceneType;
  /** Whether to enable orbit controls for camera movement */
  enableControls?: boolean;
  /** Whether this is being viewed in VR mode */
  isVRMode?: boolean;
  /** Callback when scene is loaded */
  onLoad?: () => void;
  /** Callback when texture loading fails */
  onError?: (error: Error) => void;
  /** Override default sphere radius */
  sphereRadius?: number;
}

/**
 * VRScene Component
 *
 * Displays 360-degree equirectangular images as immersive environments.
 * Creates a large sphere with inward-facing geometry to display panoramic images.
 *
 * Features:
 * - 360-degree panoramic image display
 * - Camera controls for looking around
 * - Configurable lighting based on scene settings
 * - Support for VR and non-VR modes
 * - Automatic texture loading and error handling
 *
 * @example
 * ```tsx
 * <VRScene
 *   scene={sceneData}
 *   enableControls={true}
 *   onLoad={() => console.log('Scene loaded')}
 * />
 * ```
 */
export function VRScene({
  scene,
  enableControls = true,
  isVRMode = false,
  onLoad,
  onError,
  sphereRadius = 500,
}: VRSceneProps) {
  const { camera, gl } = useThree();

  // Load 360 image texture if available
  const texture = scene.imageUrl
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useTexture(scene.imageUrl, (loadedTexture) => {
        // Configure texture for optimal 360 display
        if (loadedTexture instanceof THREE.Texture) {
          loadedTexture.colorSpace = THREE.SRGBColorSpace;
          loadedTexture.mapping = THREE.EquirectangularReflectionMapping;
        }
        onLoad?.();
      })
    : null;

  // Apply initial camera rotation if specified
  useEffect(() => {
    if (scene.camera?.initialRotation) {
      const { x, y, z } = scene.camera.initialRotation;
      camera.rotation.set(x, y, z);
    }
  }, [scene.camera?.initialRotation, camera]);

  // Configure camera settings
  useEffect(() => {
    if (scene.camera?.enableZoom !== undefined) {
      // Store zoom preference for controls
      (camera as any).__zoomEnabled = scene.camera.enableZoom;
    }
  }, [scene.camera?.enableZoom, camera]);

  // Create lighting configuration
  const lighting = useMemo(() => {
    const lights = scene.lighting || {};
    return {
      ambientIntensity: lights.ambientIntensity ?? 0.6,
      ambientColor: lights.ambientColor ?? '#ffffff',
      directionalIntensity: lights.directionalIntensity ?? 0.8,
      directionalColor: lights.directionalColor ?? '#ffffff',
      directionalPosition: lights.directionalPosition ?? { x: 5, y: 10, z: 5 },
    };
  }, [scene.lighting]);

  // Handle texture loading errors
  useEffect(() => {
    if (!scene.imageUrl) return;

    const handleError = (error: ErrorEvent) => {
      if (onError) {
        onError(new Error(`Failed to load scene image: ${error.message}`));
      }
    };

    gl.domElement.addEventListener('error', handleError);
    return () => {
      gl.domElement.removeEventListener('error', handleError);
    };
  }, [scene.imageUrl, gl.domElement, onError]);

  return (
    <>
      {/* Lighting Setup */}
      <ambientLight intensity={lighting.ambientIntensity} color={lighting.ambientColor} />
      <directionalLight
        intensity={lighting.directionalIntensity}
        color={lighting.directionalColor}
        position={[
          lighting.directionalPosition.x,
          lighting.directionalPosition.y,
          lighting.directionalPosition.z,
        ]}
        castShadow
      />

      {/* 360 Panoramic Sphere */}
      {scene.environmentType === '360-image' && scene.imageUrl && texture && (
        <mesh>
          <sphereGeometry args={[sphereRadius, 60, 40]} />
          <meshBasicMaterial
            map={texture}
            side={THREE.BackSide} // Render inside of sphere
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Fallback background color if no image */}
      {(!scene.imageUrl || scene.environmentType !== '360-image') && (
        <color attach="background" args={['#87CEEB']} />
      )}

      {/* Camera Controls - disabled in VR mode as headset handles it */}
      {enableControls && !isVRMode && (
        <OrbitControls
          enableZoom={scene.camera?.enableZoom ?? true}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={-0.5} // Negative to invert rotation for natural feel
          minDistance={scene.camera?.zoomRange?.min ?? 1}
          maxDistance={scene.camera?.zoomRange?.max ?? 10}
          minPolarAngle={scene.camera?.minPolarAngle ?? 0}
          maxPolarAngle={scene.camera?.maxPolarAngle ?? Math.PI}
          target={[0, 0, 0]}
        />
      )}
    </>
  );
}

/**
 * VRSceneLoading Component
 *
 * Placeholder component shown while scene assets are loading
 */
export function VRSceneLoading() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <color attach="background" args={['#1a1a1a']} />
      {/* Simple animated sphere to indicate loading */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="#4a5568" wireframe />
      </mesh>
    </>
  );
}

export default VRScene;
