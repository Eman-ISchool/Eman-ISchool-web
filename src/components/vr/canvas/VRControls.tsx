'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useXR, useXREvent } from '@react-three/xr';
import * as THREE from 'three';
import type { VRControlScheme } from '@/types/vr';

/**
 * Props for the VRControls component
 */
interface VRControlsProps {
  /** Control scheme configuration */
  controlScheme?: Partial<VRControlScheme>;
  /** Whether to enable orbit controls for mouse/touch in non-VR mode */
  enableOrbitControls?: boolean;
  /** Whether to enable pan movement */
  enablePan?: boolean;
  /** Whether to enable zoom */
  enableZoom?: boolean;
  /** Whether to enable rotation */
  enableRotate?: boolean;
  /** Whether to enable damping (smooth camera movement) */
  enableDamping?: boolean;
  /** Damping factor (lower = smoother but slower) */
  dampingFactor?: number;
  /** Rotation speed */
  rotateSpeed?: number;
  /** Minimum zoom distance */
  minDistance?: number;
  /** Maximum zoom distance */
  maxDistance?: number;
  /** Minimum polar angle (vertical rotation limit) */
  minPolarAngle?: number;
  /** Maximum polar angle (vertical rotation limit) */
  maxPolarAngle?: number;
  /** Target point to orbit around */
  target?: [number, number, number];
  /** Callback when control state changes */
  onChange?: () => void;
  /** Callback when user starts interacting */
  onStart?: () => void;
  /** Callback when user stops interacting */
  onEnd?: () => void;
}

/**
 * VRControls Component
 *
 * Unified control system that works seamlessly across:
 * - VR headsets with hand controllers
 * - Desktop with mouse
 * - Mobile with touch
 * - Optional keyboard controls
 * - Optional gaze control for headsets
 *
 * Features:
 * - Automatic detection of input method
 * - Consistent interaction across all devices
 * - VR controller ray casting for object selection
 * - Touch gesture support (swipe, pinch-to-zoom)
 * - Mouse drag and wheel zoom
 * - Keyboard navigation (WASD, arrow keys)
 * - Configurable sensitivity per input type
 *
 * @example
 * ```tsx
 * <VRControls
 *   enableOrbitControls={true}
 *   enableZoom={true}
 *   controlScheme={{
 *     enableVRControllers: true,
 *     enableMouseControl: true,
 *     enableTouchControl: true,
 *     mouseSensitivity: 1.0,
 *     touchSensitivity: 1.5,
 *   }}
 * />
 * ```
 */
export function VRControls({
  controlScheme = {},
  enableOrbitControls = true,
  enablePan = false,
  enableZoom = true,
  enableRotate = true,
  enableDamping = true,
  dampingFactor = 0.05,
  rotateSpeed = -0.5,
  minDistance = 1,
  maxDistance = 10,
  minPolarAngle = 0,
  maxPolarAngle = Math.PI,
  target = [0, 0, 0],
  onChange,
  onStart,
  onEnd,
}: VRControlsProps) {
  const { camera, gl } = useThree();
  const { isPresenting, controllers } = useXR();
  const keyStateRef = useRef<Record<string, boolean>>({});
  const movementSpeedRef = useRef(0.1);

  // Default control scheme
  const scheme: VRControlScheme = {
    mode: '3d',
    enableGazeControl: false,
    enableMouseControl: true,
    enableTouchControl: true,
    enableKeyboardControl: true,
    enableVRControllers: true,
    gazeDuration: 2000,
    mouseSensitivity: 1.0,
    touchSensitivity: 1.0,
    ...controlScheme,
  };

  // Apply sensitivity to OrbitControls
  const adjustedRotateSpeed = rotateSpeed * (scheme.mouseSensitivity || 1.0);

  // Keyboard controls for non-VR mode
  useEffect(() => {
    if (!scheme.enableKeyboardControl || isPresenting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keyStateRef.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keyStateRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [scheme.enableKeyboardControl, isPresenting]);

  // Apply keyboard movement
  useFrame(() => {
    if (!scheme.enableKeyboardControl || isPresenting) return;

    const keys = keyStateRef.current;
    const speed = movementSpeedRef.current;

    // Get camera's forward and right vectors
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    camera.getWorldDirection(forward);
    right.crossVectors(forward, camera.up).normalize();
    forward.y = 0; // Keep movement horizontal
    forward.normalize();

    // WASD or Arrow key movement
    if (keys['w'] || keys['arrowup']) {
      camera.position.addScaledVector(forward, speed);
    }
    if (keys['s'] || keys['arrowdown']) {
      camera.position.addScaledVector(forward, -speed);
    }
    if (keys['a'] || keys['arrowleft']) {
      camera.position.addScaledVector(right, -speed);
    }
    if (keys['d'] || keys['arrowright']) {
      camera.position.addScaledVector(right, speed);
    }

    // Q/E for up/down
    if (keys['q']) {
      camera.position.y += speed;
    }
    if (keys['e']) {
      camera.position.y -= speed;
    }

    // Shift to move faster
    if (keys['shift']) {
      movementSpeedRef.current = 0.2;
    } else {
      movementSpeedRef.current = 0.1;
    }
  });

  // VR Controller ray visualization and interaction
  useEffect(() => {
    if (!isPresenting || !scheme.enableVRControllers) return;

    controllers.forEach((controller, index) => {
      // Add ray visualization for controller
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -5),
      ]);
      const material = new THREE.LineBasicMaterial({
        color: index === 0 ? 0x00ff00 : 0x0000ff
      });
      const line = new THREE.Line(geometry, material);
      line.name = 'controller-ray';

      // Remove any existing rays
      const existingRay = controller.children.find((child) => child.name === 'controller-ray');
      if (existingRay) {
        controller.remove(existingRay);
      }

      controller.add(line);
    });
  }, [isPresenting, controllers, scheme.enableVRControllers]);

  // VR Controller select events
  useXREvent('selectstart', (e) => {
    if (!scheme.enableVRControllers) return;
    onStart?.();
  });

  useXREvent('selectend', (e) => {
    if (!scheme.enableVRControllers) return;
    onEnd?.();
  });

  useXREvent('select', (e) => {
    if (!scheme.enableVRControllers) return;

    // Get controller
    const controller = e.target as THREE.Group;

    // Perform raycasting from controller
    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    // Check for intersections with interactable objects
    // This will be handled by individual VR components (hotspots, etc.)
    // The event will bubble up to them
    onChange?.();
  });

  // Touch gesture handling for mobile
  useEffect(() => {
    if (!scheme.enableTouchControl || isPresenting) return;

    let touchStartDistance = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      onStart?.();
      touchStartTime = Date.now();

      if (e.touches.length === 2) {
        // Pinch zoom gesture
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDistance = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && enableZoom) {
        // Pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delta = distance - touchStartDistance;

        // Apply zoom with touch sensitivity
        const zoomSpeed = 0.01 * (scheme.touchSensitivity || 1.0);
        const newDistance = camera.position.length() - delta * zoomSpeed;
        const clampedDistance = Math.max(minDistance, Math.min(maxDistance, newDistance));

        camera.position.normalize().multiplyScalar(clampedDistance);
        touchStartDistance = distance;
        onChange?.();
      }
    };

    const handleTouchEnd = () => {
      const touchDuration = Date.now() - touchStartTime;

      // Detect tap vs drag
      if (touchDuration < 200) {
        // Quick tap - could be used for selection
        onChange?.();
      }

      onEnd?.();
    };

    gl.domElement.addEventListener('touchstart', handleTouchStart);
    gl.domElement.addEventListener('touchmove', handleTouchMove);
    gl.domElement.addEventListener('touchend', handleTouchEnd);

    return () => {
      gl.domElement.removeEventListener('touchstart', handleTouchStart);
      gl.domElement.removeEventListener('touchmove', handleTouchMove);
      gl.domElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    scheme.enableTouchControl,
    scheme.touchSensitivity,
    isPresenting,
    enableZoom,
    camera,
    gl.domElement,
    minDistance,
    maxDistance,
    onChange,
    onStart,
    onEnd,
  ]);

  // Gaze control for VR headsets without controllers
  useEffect(() => {
    if (!scheme.enableGazeControl || !isPresenting) return;

    let gazeStartTime = 0;
    let gazing = false;
    let currentTarget: THREE.Object3D | null = null;

    const raycaster = new THREE.Raycaster();
    const centerPoint = new THREE.Vector2(0, 0); // Center of screen for gaze

    const checkGaze = () => {
      if (!isPresenting) return;

      // Cast ray from camera center (gaze direction)
      raycaster.setFromCamera(centerPoint, camera);

      // Get all interactable objects in scene
      const intersects = raycaster.intersectObjects(gl.scene.children, true);

      if (intersects.length > 0) {
        const target = intersects[0].object;

        // Check if we're still gazing at the same object
        if (target === currentTarget) {
          const gazeDuration = Date.now() - gazeStartTime;

          if (!gazing && gazeDuration > (scheme.gazeDuration || 2000)) {
            // Trigger gaze selection
            gazing = true;
            onChange?.();

            // Reset after selection
            setTimeout(() => {
              gazing = false;
              currentTarget = null;
            }, 500);
          }
        } else {
          // Started gazing at new object
          currentTarget = target;
          gazeStartTime = Date.now();
          gazing = false;
        }
      } else {
        // Not looking at anything
        currentTarget = null;
        gazing = false;
      }
    };

    const interval = setInterval(checkGaze, 100); // Check every 100ms

    return () => {
      clearInterval(interval);
    };
  }, [
    scheme.enableGazeControl,
    scheme.gazeDuration,
    isPresenting,
    camera,
    gl.scene,
    onChange,
  ]);

  // Render OrbitControls for non-VR mode
  if (!isPresenting && enableOrbitControls) {
    return (
      <OrbitControls
        enabled={scheme.enableMouseControl || scheme.enableTouchControl}
        enablePan={enablePan}
        enableZoom={enableZoom}
        enableRotate={enableRotate}
        enableDamping={enableDamping}
        dampingFactor={dampingFactor}
        rotateSpeed={adjustedRotateSpeed}
        minDistance={minDistance}
        maxDistance={maxDistance}
        minPolarAngle={minPolarAngle}
        maxPolarAngle={maxPolarAngle}
        target={target}
        onChange={onChange}
        onStart={onStart}
        onEnd={onEnd}
      />
    );
  }

  // In VR mode, controls are handled by XR system and our custom handlers
  return null;
}

/**
 * VRControlsHUD Component
 *
 * Optional heads-up display showing active controls and hints
 */
interface VRControlsHUDProps {
  /** Current control scheme */
  controlScheme: VRControlScheme;
  /** Whether user is in VR mode */
  isVRMode: boolean;
  /** Position of HUD */
  position?: [number, number, number];
  /** Whether to show the HUD */
  visible?: boolean;
}

export function VRControlsHUD({
  controlScheme,
  isVRMode,
  position = [0, -1, -2],
  visible = true,
}: VRControlsHUDProps) {
  if (!visible) return null;

  const hints: string[] = [];

  if (isVRMode) {
    if (controlScheme.enableVRControllers) {
      hints.push('Use controller triggers to select');
      hints.push('Point controllers to interact');
    }
    if (controlScheme.enableGazeControl) {
      hints.push(`Look at objects for ${(controlScheme.gazeDuration || 2000) / 1000}s to select`);
    }
  } else {
    if (controlScheme.enableMouseControl) {
      hints.push('Drag to look around');
      hints.push('Scroll to zoom');
    }
    if (controlScheme.enableTouchControl) {
      hints.push('Swipe to look around');
      hints.push('Pinch to zoom');
    }
    if (controlScheme.enableKeyboardControl) {
      hints.push('WASD/Arrows to move');
      hints.push('Q/E for up/down');
      hints.push('Shift to move faster');
    }
  }

  if (hints.length === 0) return null;

  return (
    <group position={position}>
      {/* This would render 3D text or HTML overlay with control hints */}
      {/* For now, it's a placeholder that parent components can use */}
      {/* Actual implementation would use Html from @react-three/drei or 3D text */}
    </group>
  );
}

export default VRControls;
