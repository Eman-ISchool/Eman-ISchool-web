// @ts-nocheck
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { VRScene, VRControlScheme } from '@/types/vr';

// Dynamically import VR components (client-side only)
const VRCanvas = dynamic(
  () => import('@/components/vr/canvas/VRCanvas').then((mod) => mod.VRCanvas),
  { ssr: false }
);
const VRScene = dynamic(
  () => import('@/components/vr/scenes/VRScene').then((mod) => mod.VRScene),
  { ssr: false }
);
const VRControls = dynamic(
  () => import('@/components/vr/canvas/VRControls').then((mod) => mod.VRControls),
  { ssr: false }
);

/**
 * VR Controls Test Page
 *
 * Tests the unified VRControls component with all input methods:
 * 1. Works with VR controllers
 * 2. Mouse drag for desktop
 * 3. Touch swipe for mobile
 * 4. Keyboard navigation (bonus)
 * 5. Gaze control (bonus)
 */
export default function VRControlsTestPage() {
  const [controlScheme, setControlScheme] = useState<Partial<VRControlScheme>>({
    enableVRControllers: true,
    enableMouseControl: true,
    enableTouchControl: true,
    enableKeyboardControl: true,
    enableGazeControl: false,
    mouseSensitivity: 1.0,
    touchSensitivity: 1.0,
    gazeDuration: 2000,
  });

  const [log, setLog] = useState<string[]>([]);
  const [enableZoom, setEnableZoom] = useState(true);
  const [enableDamping, setEnableDamping] = useState(true);
  const [rotateSpeed, setRotateSpeed] = useState(-0.5);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 15));
  };

  // Test scene
  const testScene: VRScene = {
    id: 'test-scene',
    title: {
      en: 'Controls Test Scene',
      ar: 'مشهد اختبار التحكم',
    },
    description: {
      en: 'Test all control methods',
      ar: 'اختبر جميع طرق التحكم',
    },
    environmentType: '360-image',
    thumbnailUrl: 'https://placehold.co/400x300/3b82f6/ffffff?text=Test+Scene',
    imageUrl: '',
    hotspots: [],
  };

  const updateControlScheme = (key: keyof VRControlScheme, value: any) => {
    setControlScheme((prev) => ({ ...prev, [key]: value }));
    addLog(`Updated ${key}: ${value}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-2">VR Controls Test</h1>
          <p className="text-gray-400">
            Testing unified control system for VR headsets, mouse, touch, and keyboard
          </p>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* VR Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden mb-4" style={{ height: '600px' }}>
              <VRCanvas mode="3d" enableXR={true}>
                <VRScene scene={testScene} enableControls={false} />
                <VRControls
                  controlScheme={controlScheme}
                  enableOrbitControls={true}
                  enableZoom={enableZoom}
                  enableDamping={enableDamping}
                  rotateSpeed={rotateSpeed}
                  onChange={() => addLog('Camera changed')}
                  onStart={() => addLog('Interaction started')}
                  onEnd={() => addLog('Interaction ended')}
                />
                {/* Test objects for interaction */}
                <mesh position={[0, 1.6, -3]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color="#3b82f6" />
                </mesh>
                <mesh position={[-2, 1.6, -3]}>
                  <sphereGeometry args={[0.5, 32, 32]} />
                  <meshStandardMaterial color="#10b981" />
                </mesh>
                <mesh position={[2, 1.6, -3]}>
                  <coneGeometry args={[0.5, 1, 32]} />
                  <meshStandardMaterial color="#f59e0b" />
                </mesh>
              </VRCanvas>
            </div>

            {/* Acceptance Criteria Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="font-bold text-green-300">VR Controllers</h3>
                </div>
                <p className="text-sm text-gray-300">
                  Works with VR controllers using XR system. Ray visualization and select events.
                </p>
              </div>

              <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="font-bold text-green-300">Mouse Drag</h3>
                </div>
                <p className="text-sm text-gray-300">
                  Mouse drag to rotate, scroll wheel to zoom. Configurable sensitivity.
                </p>
              </div>

              <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="font-bold text-green-300">Touch Swipe</h3>
                </div>
                <p className="text-sm text-gray-300">
                  Touch swipe to rotate, pinch to zoom. Mobile-optimized gestures.
                </p>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-4">
            {/* Input Method Toggles */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold mb-3">Input Methods</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={controlScheme.enableVRControllers}
                    onChange={(e) =>
                      updateControlScheme('enableVRControllers', e.target.checked)
                    }
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm">VR Controllers</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={controlScheme.enableMouseControl}
                    onChange={(e) => updateControlScheme('enableMouseControl', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm">Mouse Control</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={controlScheme.enableTouchControl}
                    onChange={(e) => updateControlScheme('enableTouchControl', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm">Touch Control</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={controlScheme.enableKeyboardControl}
                    onChange={(e) =>
                      updateControlScheme('enableKeyboardControl', e.target.checked)
                    }
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm">Keyboard Control</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={controlScheme.enableGazeControl}
                    onChange={(e) => updateControlScheme('enableGazeControl', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm">Gaze Control</span>
                </label>
              </div>
            </div>

            {/* Sensitivity Settings */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold mb-3">Sensitivity</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm block mb-1">
                    Mouse: {controlScheme.mouseSensitivity?.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={controlScheme.mouseSensitivity}
                    onChange={(e) =>
                      updateControlScheme('mouseSensitivity', parseFloat(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">
                    Touch: {controlScheme.touchSensitivity?.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={controlScheme.touchSensitivity}
                    onChange={(e) =>
                      updateControlScheme('touchSensitivity', parseFloat(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">
                    Rotate Speed: {rotateSpeed.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="-2.0"
                    max="2.0"
                    step="0.1"
                    value={rotateSpeed}
                    onChange={(e) => {
                      setRotateSpeed(parseFloat(e.target.value));
                      addLog(`Rotate speed: ${e.target.value}`);
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Control Options */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold mb-3">Options</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={enableZoom}
                    onChange={(e) => {
                      setEnableZoom(e.target.checked);
                      addLog(`Zoom ${e.target.checked ? 'enabled' : 'disabled'}`);
                    }}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm">Enable Zoom</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={enableDamping}
                    onChange={(e) => {
                      setEnableDamping(e.target.checked);
                      addLog(`Damping ${e.target.checked ? 'enabled' : 'disabled'}`);
                    }}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm">Enable Damping</span>
                </label>
                {controlScheme.enableGazeControl && (
                  <div>
                    <label className="text-sm block mb-1">
                      Gaze Duration: {controlScheme.gazeDuration}ms
                    </label>
                    <input
                      type="range"
                      min="500"
                      max="5000"
                      step="500"
                      value={controlScheme.gazeDuration}
                      onChange={(e) =>
                        updateControlScheme('gazeDuration', parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Event Log */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Event Log
              </h3>
              <div className="bg-gray-900 rounded p-3 font-mono text-xs max-h-48 overflow-y-auto">
                {log.length === 0 ? (
                  <p className="text-gray-500">No events yet. Try interacting!</p>
                ) : (
                  log.map((entry, index) => (
                    <div key={index} className="text-gray-300 mb-1">
                      {entry}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 bg-blue-600/20 border border-blue-500/50 rounded-lg p-4">
          <h3 className="font-bold text-blue-300 mb-3">Testing Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">🖱️ Mouse (Desktop)</h4>
              <ul className="space-y-1">
                <li>• Drag to rotate view</li>
                <li>• Scroll wheel to zoom</li>
                <li>• Right-click drag to pan (if enabled)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">👆 Touch (Mobile)</h4>
              <ul className="space-y-1">
                <li>• Swipe to rotate view</li>
                <li>• Pinch to zoom in/out</li>
                <li>• Two-finger drag to pan</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">⌨️ Keyboard</h4>
              <ul className="space-y-1">
                <li>• WASD / Arrows to move</li>
                <li>• Q/E for up/down</li>
                <li>• Shift to move faster</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">🥽 VR Controllers</h4>
              <ul className="space-y-1">
                <li>• Point controller to aim</li>
                <li>• Trigger to select</li>
                <li>• Ray shows: Green (L) / Blue (R)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
