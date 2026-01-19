'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { VRNavigationProps, HotspotPosition } from '@/types/vr';

/**
 * VRNavigation Component
 *
 * Floating navigation menu for moving between VR scenes and experiences.
 * Provides scene selection, teleportation, and back/home navigation.
 *
 * Features:
 * - Scene selector menu with thumbnails
 * - Teleportation between viewpoints
 * - Back/Home navigation buttons
 * - Bilingual support (Arabic RTL & English)
 * - Toggleable menu (open/close)
 * - Billboard effect (always faces camera)
 * - Responsive grid layout
 *
 * @example
 * ```tsx
 * <VRNavigation
 *   scenes={experience.scenes}
 *   currentSceneId={activeSceneId}
 *   onSceneChange={(sceneId) => setActiveSceneId(sceneId)}
 *   onExit={() => router.push('/vr-eduverse')}
 *   language="en"
 *   position={{ x: -2, y: 2, z: -1 }}
 *   isOpen={showNavigation}
 *   onToggle={() => setShowNavigation(!showNavigation)}
 * />
 * ```
 */
export function VRNavigation({
  scenes,
  currentSceneId,
  onSceneChange,
  onExit,
  language = 'en',
  position = { x: -2, y: 2, z: -1 },
  isOpen: isOpenProp = false,
  onToggle,
  showBackButton = true,
  showHomeButton = true,
}: VRNavigationProps & {
  position?: HotspotPosition;
  isOpen?: boolean;
  onToggle?: () => void;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [opacity, setOpacity] = useState(0);
  const [isOpen, setIsOpen] = useState(isOpenProp);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sceneHistory, setSceneHistory] = useState<string[]>([currentSceneId]);

  // Sync internal state with prop
  useEffect(() => {
    setIsOpen(isOpenProp);
  }, [isOpenProp]);

  // Update scene history
  useEffect(() => {
    if (!sceneHistory.includes(currentSceneId)) {
      setSceneHistory((prev) => [...prev, currentSceneId]);
    }
  }, [currentSceneId, sceneHistory]);

  // Fade in/out animation
  useEffect(() => {
    if (isOpen) {
      setOpacity(0);
      const timer = setTimeout(() => setOpacity(1), 50);
      return () => clearTimeout(timer);
    } else {
      setOpacity(0);
    }
  }, [isOpen]);

  // Billboard effect - always face the camera
  useFrame(({ camera }) => {
    if (groupRef.current && isOpen) {
      groupRef.current.lookAt(camera.position);
    }
  });

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.();
  };

  const handleSceneChange = (sceneId: string) => {
    if (sceneId === currentSceneId || isTransitioning) return;

    setIsTransitioning(true);
    onSceneChange(sceneId);

    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  const handleBack = () => {
    if (sceneHistory.length > 1) {
      const previousSceneId = sceneHistory[sceneHistory.length - 2];
      setSceneHistory((prev) => prev.slice(0, -1));
      handleSceneChange(previousSceneId);
    }
  };

  const handleHome = () => {
    if (scenes.length > 0) {
      const firstSceneId = scenes[0].id;
      setSceneHistory([firstSceneId]);
      handleSceneChange(firstSceneId);
    }
  };

  const currentScene = scenes.find((s) => s.id === currentSceneId);
  const canGoBack = sceneHistory.length > 1;
  const isRTL = language === 'ar';

  const labels = {
    navigation: language === 'ar' ? 'التنقل' : 'Navigation',
    scenes: language === 'ar' ? 'المشاهد' : 'Scenes',
    currentScene: language === 'ar' ? 'المشهد الحالي' : 'Current Scene',
    selectScene: language === 'ar' ? 'اختر مشهد' : 'Select Scene',
    back: language === 'ar' ? 'رجوع' : 'Back',
    home: language === 'ar' ? 'الرئيسية' : 'Home',
    exit: language === 'ar' ? 'خروج' : 'Exit',
    menu: language === 'ar' ? 'القائمة' : 'Menu',
    close: language === 'ar' ? 'إغلاق' : 'Close',
  };

  if (!isOpen) {
    // Collapsed floating button
    return (
      <group ref={groupRef} position={[position.x, position.y, position.z]}>
        <Html
          center
          distanceFactor={8}
          style={{
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={handleToggle}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center gap-2 border-2 border-blue-400"
            aria-label={labels.menu}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
            <span className="font-semibold">{labels.menu}</span>
          </button>
        </Html>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {/* Background plane for depth perception */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[4, 3]} />
        <meshBasicMaterial
          color="#1f2937"
          transparent
          opacity={opacity * 0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Border glow effect */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[4.1, 3.1]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={opacity * 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* HTML Navigation Menu */}
      <Html
        center
        distanceFactor={10}
        style={{
          transition: 'opacity 0.3s ease-in-out',
          opacity,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        <div
          style={{
            width: '800px',
            minHeight: '600px',
            maxHeight: '600px',
            direction: isRTL ? 'rtl' : 'ltr',
          }}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-lg shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-blue-600/90 px-6 py-4 flex items-center justify-between border-b border-blue-500/50">
            <div className="flex items-center gap-3">
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
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <h2
                className="text-xl font-bold text-white"
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              >
                {labels.navigation}
              </h2>
            </div>
            <button
              onClick={handleToggle}
              className="text-white hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-blue-700/50"
              aria-label={labels.close}
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
          </div>

          {/* Content */}
          <div
            className="p-6 overflow-y-auto"
            style={{
              maxHeight: '480px',
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {/* Current Scene Display */}
            {currentScene && (
              <div className="mb-6 p-4 bg-green-600/20 border border-green-500/50 rounded-lg">
                <p className="text-sm text-green-300 mb-2 font-semibold">
                  {labels.currentScene}
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={currentScene.thumbnailUrl}
                    alt={currentScene.title[language]}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-lg">
                      {currentScene.title[language]}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {currentScene.description[language]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Scene Selector Grid */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-200">
                {labels.selectScene}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {scenes.map((scene) => {
                  const isCurrent = scene.id === currentSceneId;
                  return (
                    <button
                      key={scene.id}
                      onClick={() => handleSceneChange(scene.id)}
                      disabled={isCurrent || isTransitioning}
                      className={`relative group overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                        isCurrent
                          ? 'border-green-500 bg-green-600/20 cursor-default'
                          : 'border-gray-600 hover:border-blue-500 hover:shadow-lg hover:scale-105 cursor-pointer'
                      } ${isTransitioning ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video relative">
                        <img
                          src={scene.thumbnailUrl}
                          alt={scene.title[language]}
                          className="w-full h-full object-cover"
                        />
                        {isCurrent && (
                          <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                            <svg
                              className="w-12 h-12 text-green-300"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      {/* Title */}
                      <div className="p-3 bg-gray-800/90">
                        <h4 className="font-semibold text-sm line-clamp-1">
                          {scene.title[language]}
                        </h4>
                        <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                          {scene.description[language]}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer with navigation buttons */}
          <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700/50 flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {showBackButton && (
                <button
                  onClick={handleBack}
                  disabled={!canGoBack || isTransitioning}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                    canGoBack && !isTransitioning
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                  aria-label={labels.back}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      transform: isRTL ? 'scaleX(-1)' : 'none',
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span>{labels.back}</span>
                </button>
              )}

              {showHomeButton && (
                <button
                  onClick={handleHome}
                  disabled={isTransitioning}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                    !isTransitioning
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                  aria-label={labels.home}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>{labels.home}</span>
                </button>
              )}
            </div>

            <button
              onClick={onExit}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
              aria-label={labels.exit}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>{labels.exit}</span>
            </button>
          </div>
        </div>
      </Html>
    </group>
  );
}

export default VRNavigation;
