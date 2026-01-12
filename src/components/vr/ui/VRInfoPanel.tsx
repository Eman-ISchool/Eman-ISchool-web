'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { VRInfoPanelProps } from '@/types/vr';

/**
 * VRInfoPanel Component
 *
 * Displays floating educational content panels in 3D space.
 * Supports rich content including text, images, videos, and audio.
 * Fully supports Arabic RTL text for bilingual education.
 *
 * Features:
 * - Displays text and images in 3D space
 * - Supports Arabic RTL text rendering
 * - Dismissible with close button
 * - Rich media support (images, video, audio)
 * - Smooth fade-in/out animations
 * - Responsive sizing
 * - Billboard effect (always faces camera)
 *
 * @example
 * ```tsx
 * <VRInfoPanel
 *   content={richContent}
 *   position={{ x: 0, y: 1.6, z: -2 }}
 *   isVisible={true}
 *   onClose={() => setShowPanel(false)}
 *   language="ar"
 *   width={600}
 *   height={400}
 * />
 * ```
 */
export function VRInfoPanel({
  content,
  position,
  width = 600,
  height = 400,
  isVisible,
  onClose,
  language = 'en',
}: VRInfoPanelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [opacity, setOpacity] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  // Fade in/out animation
  useEffect(() => {
    if (isVisible && !isClosing) {
      setOpacity(0);
      const timer = setTimeout(() => setOpacity(1), 50);
      return () => clearTimeout(timer);
    } else if (!isVisible || isClosing) {
      setOpacity(0);
    }
  }, [isVisible, isClosing]);

  // Billboard effect - always face the camera
  useFrame(({ camera }) => {
    if (groupRef.current && isVisible) {
      groupRef.current.lookAt(camera.position);
    }
  });

  const handleClose = () => {
    setIsClosing(true);
    setOpacity(0);
    setTimeout(() => {
      setIsClosing(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible && !isClosing) return null;

  const isRTL = language === 'ar';
  const title = content.title[language];
  const description = content.description[language];

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {/* Background plane for depth perception */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[width / 200, height / 200]} />
        <meshBasicMaterial
          color="#1f2937"
          transparent
          opacity={opacity * 0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Border glow effect */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[width / 200 + 0.1, height / 200 + 0.1]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={opacity * 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* HTML Content Overlay */}
      <Html
        center
        distanceFactor={10}
        style={{
          transition: 'opacity 0.3s ease-in-out',
          opacity,
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
      >
        <div
          style={{
            width: `${width}px`,
            minHeight: `${height}px`,
            maxHeight: `${height}px`,
            direction: isRTL ? 'rtl' : 'ltr',
          }}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-lg shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-blue-600/90 px-6 py-4 flex items-center justify-between border-b border-blue-500/50">
            <h2
              className="text-xl font-bold text-white"
              style={{ textAlign: isRTL ? 'right' : 'left' }}
            >
              {title}
            </h2>
            {onClose && (
              <button
                onClick={handleClose}
                className="ml-4 text-white hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-blue-700/50"
                aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Content */}
          <div
            className="p-6 overflow-y-auto"
            style={{
              maxHeight: `${height - 80}px`,
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {/* Image */}
            {content.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={content.imageUrl}
                  alt={title}
                  className="w-full h-auto object-cover max-h-48"
                  loading="lazy"
                />
              </div>
            )}

            {/* Description */}
            <div
              className="text-gray-200 leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: isRTL ? 'inherit' : 'inherit' }}
            >
              {description}
            </div>

            {/* Video */}
            {content.videoUrl && (
              <div className="mt-4 rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-auto max-h-64"
                  preload="metadata"
                >
                  <source src={content.videoUrl} type="video/mp4" />
                  {language === 'ar'
                    ? 'متصفحك لا يدعم تشغيل الفيديو'
                    : 'Your browser does not support the video tag.'}
                </video>
              </div>
            )}

            {/* Audio */}
            {content.audioUrl && (
              <div className="mt-4">
                <audio controls className="w-full" preload="metadata">
                  <source src={content.audioUrl} type="audio/mpeg" />
                  {language === 'ar'
                    ? 'متصفحك لا يدعم تشغيل الصوت'
                    : 'Your browser does not support the audio element.'}
                </audio>
              </div>
            )}
          </div>

          {/* Footer with action hint */}
          <div className="px-6 py-3 bg-gray-800/50 border-t border-gray-700/50">
            <p className="text-xs text-gray-400 text-center">
              {language === 'ar'
                ? 'اضغط خارج اللوحة أو على زر الإغلاق للمتابعة'
                : 'Click outside or press close to continue'}
            </p>
          </div>
        </div>
      </Html>
    </group>
  );
}

export default VRInfoPanel;
