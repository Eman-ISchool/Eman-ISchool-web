'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { HotspotPosition } from '@/types/vr';

/**
 * Props for the BaseHotspot component
 */
export interface BaseHotspotProps {
  /** Unique identifier for the hotspot */
  id: string;
  /** Position in 3D space */
  position: HotspotPosition;
  /** Color of the hotspot marker */
  color?: string;
  /** Scale multiplier for the hotspot */
  scale?: number;
  /** Icon name to display (optional) */
  icon?: string;
  /** Whether the hotspot is visible */
  isVisible?: boolean;
  /** Callback when hotspot is clicked */
  onClick?: () => void;
  /** Callback when hotspot is hovered */
  onHover?: (isHovered: boolean) => void;
  /** Optional label to show on hover */
  label?: string;
  /** Whether to enable pulsing animation */
  enablePulse?: boolean;
}

/**
 * BaseHotspot Component
 *
 * Renders a 3D marker in VR space that can be interacted with.
 * Provides visual feedback through hover states and pulsing animations.
 *
 * Features:
 * - Clickable/tappable 3D sphere marker
 * - Hover state with visual feedback
 * - Pulsing animation to draw attention
 * - Optional label that appears on hover
 * - Customizable color and scale
 *
 * @example
 * ```tsx
 * <BaseHotspot
 *   id="hotspot-1"
 *   position={{ x: 0, y: 1.6, z: -2 }}
 *   color="#4f46e5"
 *   label="Click me"
 *   onClick={() => console.log('Clicked!')}
 * />
 * ```
 */
export function BaseHotspot({
  id,
  position,
  color = '#4f46e5',
  scale = 1,
  icon,
  isVisible = true,
  onClick,
  onHover,
  label,
  enablePulse = true,
}: BaseHotspotProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const pulsePhase = useRef(0);

  // Animate pulsing effect
  useFrame((state, delta) => {
    if (!meshRef.current || !glowRef.current) return;

    if (enablePulse) {
      pulsePhase.current += delta * 2;
      const pulse = Math.sin(pulsePhase.current) * 0.1 + 1;
      meshRef.current.scale.setScalar(scale * pulse);

      // Glow effect
      const glowScale = Math.sin(pulsePhase.current) * 0.2 + 1.2;
      glowRef.current.scale.setScalar(scale * glowScale);
      glowRef.current.material.opacity = (Math.sin(pulsePhase.current) * 0.2 + 0.3) * (hovered ? 1.5 : 1);
    }

    // Slight rotation for visual interest
    meshRef.current.rotation.y += delta * 0.5;
  });

  const handlePointerOver = () => {
    setHovered(true);
    onHover?.(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover?.(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (event: THREE.Event) => {
    event.stopPropagation();
    onClick?.();
  };

  if (!isVisible) return null;

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Outer glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Main hotspot sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>

      {/* Inner core for extra visual depth */}
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={hovered ? 1 : 0.6}
        />
      </mesh>

      {/* Icon or label overlay (HTML) */}
      {(label || icon) && hovered && (
        <Html
          center
          distanceFactor={8}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            transition: 'all 0.2s',
          }}
        >
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap backdrop-blur-sm">
            {icon && <span className="mr-2">{icon}</span>}
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

export default BaseHotspot;
