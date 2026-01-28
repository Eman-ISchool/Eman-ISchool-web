// @ts-nocheck
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { VRScene, VRExperience } from '@/types/vr';

// Dynamically import VR components (client-side only)
const VRCanvas = dynamic(
  () => import('@/components/vr/canvas/VRCanvas').then((mod) => mod.VRCanvas),
  { ssr: false }
);
const VRScene = dynamic(
  () => import('@/components/vr/scenes/VRScene').then((mod) => mod.VRScene),
  { ssr: false }
);
const VRNavigation = dynamic(
  () => import('@/components/vr/ui/VRNavigation').then((mod) => mod.VRNavigation),
  { ssr: false }
);

/**
 * VR Navigation Test Page
 *
 * Tests the VRNavigation component with multiple scenes to verify:
 * 1. Scene selector menu
 * 2. Teleportation between viewpoints
 * 3. Back/Home navigation
 */
export default function VRNavigationTestPage() {
  const [currentSceneId, setCurrentSceneId] = useState('scene-1');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [showNavigation, setShowNavigation] = useState(true);
  const [log, setLog] = useState<string[]>([]);

  // Test scenes for navigation
  const testScenes: VRScene[] = [
    {
      id: 'scene-1',
      title: {
        en: 'Scene 1: Entrance',
        ar: 'المشهد 1: المدخل',
      },
      description: {
        en: 'Welcome to the first scene',
        ar: 'مرحبا بك في المشهد الأول',
      },
      environmentType: '360-image',
      thumbnailUrl: 'https://placehold.co/400x300/3b82f6/ffffff?text=Scene+1',
      imageUrl: '',
      hotspots: [],
    },
    {
      id: 'scene-2',
      title: {
        en: 'Scene 2: Main Hall',
        ar: 'المشهد 2: القاعة الرئيسية',
      },
      description: {
        en: 'The main exhibition hall',
        ar: 'قاعة المعرض الرئيسية',
      },
      environmentType: '360-image',
      thumbnailUrl: 'https://placehold.co/400x300/10b981/ffffff?text=Scene+2',
      imageUrl: '',
      hotspots: [],
    },
    {
      id: 'scene-3',
      title: {
        en: 'Scene 3: Gallery',
        ar: 'المشهد 3: المعرض',
      },
      description: {
        en: 'Art and artifact gallery',
        ar: 'معرض الفن والآثار',
      },
      environmentType: '360-image',
      thumbnailUrl: 'https://placehold.co/400x300/f59e0b/ffffff?text=Scene+3',
      imageUrl: '',
      hotspots: [],
    },
    {
      id: 'scene-4',
      title: {
        en: 'Scene 4: Observation Deck',
        ar: 'المشهد 4: سطح المراقبة',
      },
      description: {
        en: 'Panoramic view from the top',
        ar: 'منظر بانورامي من الأعلى',
      },
      environmentType: '360-image',
      thumbnailUrl: 'https://placehold.co/400x300/ef4444/ffffff?text=Scene+4',
      imageUrl: '',
      hotspots: [],
    },
  ];

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 10));
  };

  const handleSceneChange = (sceneId: string) => {
    addLog(`Teleporting to scene: ${sceneId}`);
    setCurrentSceneId(sceneId);
  };

  const handleExit = () => {
    addLog('Exit button clicked');
    alert('Would navigate to /vr-eduverse');
  };

  const handleToggleNav = () => {
    setShowNavigation(!showNavigation);
    addLog(`Navigation menu ${!showNavigation ? 'opened' : 'closed'}`);
  };

  const currentScene = testScenes.find((s) => s.id === currentSceneId);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-2">VR Navigation Test</h1>
          <p className="text-gray-400">
            Testing scene selector menu, teleportation, and back/home navigation
          </p>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {/* Controls */}
        <div className="mb-4 bg-gray-800 rounded-lg p-4">
          <div className="flex gap-4 items-center flex-wrap">
            <div>
              <label className="block text-sm font-semibold mb-2">Language</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setLanguage('en');
                    addLog('Language changed to English');
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    language === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    setLanguage('ar');
                    addLog('Language changed to Arabic');
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    language === 'ar'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  العربية
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Navigation Menu</label>
              <button
                onClick={handleToggleNav}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                {showNavigation ? 'Hide Menu' : 'Show Menu'}
              </button>
            </div>

            <div className="ml-auto">
              <label className="block text-sm font-semibold mb-2">Current Scene</label>
              <div className="px-4 py-2 bg-green-600/20 border border-green-500/50 rounded-lg">
                <span className="font-mono text-green-300">{currentSceneId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* VR Canvas */}
        <div className="mb-4">
          <div className="bg-black rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <VRCanvas vrMode="3d">
              {currentScene && (
                <>
                  <VRScene scene={currentScene} enableControls={true} />
                  <VRNavigation
                    scenes={testScenes}
                    currentSceneId={currentSceneId}
                    onSceneChange={handleSceneChange}
                    onExit={handleExit}
                    language={language}
                    isOpen={showNavigation}
                    onToggle={handleToggleNav}
                    showBackButton={true}
                    showHomeButton={true}
                  />
                </>
              )}
            </VRCanvas>
          </div>
        </div>

        {/* Acceptance Criteria Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              <h3 className="font-bold text-green-300">Scene Selector Menu</h3>
            </div>
            <p className="text-sm text-gray-300">
              Grid layout with scene thumbnails, titles, and descriptions. Click any scene
              card to navigate.
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
              <h3 className="font-bold text-green-300">Teleportation</h3>
            </div>
            <p className="text-sm text-gray-300">
              Instant scene switching with transition animations. Disabled during
              transitions to prevent race conditions.
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
              <h3 className="font-bold text-green-300">Back/Home Navigation</h3>
            </div>
            <p className="text-sm text-gray-300">
              Back button navigates to previous scene (with history tracking). Home button
              returns to first scene.
            </p>
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
          <div className="bg-gray-900 rounded p-3 font-mono text-sm max-h-48 overflow-y-auto">
            {log.length === 0 ? (
              <p className="text-gray-500">No events yet. Try interacting with the navigation!</p>
            ) : (
              log.map((entry, index) => (
                <div key={index} className="text-gray-300 mb-1">
                  {entry}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 bg-blue-600/20 border border-blue-500/50 rounded-lg p-4">
          <h3 className="font-bold text-blue-300 mb-2">Testing Instructions</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">1.</span>
              <span>
                <strong>Scene Selector:</strong> Open the navigation menu (if closed) and click
                on different scene thumbnails to navigate between scenes.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">2.</span>
              <span>
                <strong>Back Button:</strong> Navigate to multiple scenes, then use the Back
                button to return to the previous scene. The button should be disabled when
                you&apos;re at the first scene.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">3.</span>
              <span>
                <strong>Home Button:</strong> Navigate to any scene, then click Home to return to
                Scene 1 (Entrance).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">4.</span>
              <span>
                <strong>Language Toggle:</strong> Switch between English and Arabic to test RTL
                text support in the navigation menu.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">5.</span>
              <span>
                <strong>Exit Button:</strong> Click the red Exit button to test the exit
                functionality (shows alert in this test).
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
