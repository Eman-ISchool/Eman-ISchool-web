'use client';

import { useState } from 'react';
import { VRCanvas } from '@/components/vr/canvas';
import { VRScene } from '@/components/vr/scenes';
import { VRHotspots } from '@/components/vr/hotspots';
import { VRInfoPanel } from '@/components/vr/ui';
import { useVRCapabilities } from '@/lib/vr/hooks';
import type { VRScene as VRSceneType, AnyHotspot, InfoHotspot, VRLanguage, RichContent } from '@/types/vr';

/**
 * VR Scene Test Page
 *
 * Test page to verify VRCanvas and VRScene components work correctly
 * with 360-degree panoramic images and camera controls.
 */
export default function VRTestPage() {
  const capabilities = useVRCapabilities();
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [useScene, setUseScene] = useState(false);
  const [interactionLog, setInteractionLog] = useState<string[]>([]);
  const [activeInfoPanel, setActiveInfoPanel] = useState<RichContent | null>(null);
  const [language, setLanguage] = useState<VRLanguage>('en');

  // Test hotspots demonstrating all types
  const testHotspots: AnyHotspot[] = [
    // Info Hotspot (Blue)
    {
      id: 'info-1',
      type: 'info',
      position: { x: -2, y: 1.6, z: -3 },
      title: {
        en: 'Information Point',
        ar: 'نقطة المعلومات',
      },
      description: {
        en: 'Click to learn more',
        ar: 'انقر لمعرفة المزيد',
      },
      content: {
        title: {
          en: 'Welcome to VR Education',
          ar: 'مرحبا بك في التعليم الافتراضي',
        },
        description: {
          en: 'This is an example of an information hotspot. These hotspots provide educational content when clicked.\n\nVR technology creates immersive learning experiences that help students understand complex concepts through interactive 3D visualizations and virtual field trips.',
          ar: 'هذا مثال على نقطة معلومات. توفر هذه النقاط محتوى تعليمي عند النقر عليها.\n\nتقنية الواقع الافتراضي تخلق تجارب تعليمية غامرة تساعد الطلاب على فهم المفاهيم المعقدة من خلال التصورات ثلاثية الأبعاد التفاعلية والرحلات الميدانية الافتراضية.',
        },
        imageUrl: 'https://picsum.photos/400/200',
      },
    },
    // Navigation Hotspot (Purple)
    {
      id: 'nav-1',
      type: 'navigation',
      position: { x: 2, y: 1.6, z: -3 },
      title: {
        en: 'Go to Next Scene',
        ar: 'الانتقال إلى المشهد التالي',
      },
      targetSceneId: 'test-scene-2',
      transitionDuration: 1000,
    },
    // Interactive Hotspot (Orange)
    {
      id: 'interactive-1',
      type: 'interactive',
      position: { x: 0, y: 2.5, z: -3 },
      title: {
        en: 'Rotate Model',
        ar: 'تدوير النموذج',
      },
      interactionType: 'rotate',
    },
    // Quiz Hotspot (Yellow)
    {
      id: 'quiz-1',
      type: 'quiz',
      position: { x: 0, y: 1, z: -3 },
      title: {
        en: 'Test Your Knowledge',
        ar: 'اختبر معرفتك',
      },
      question: {
        en: 'What is the purpose of VR in education?',
        ar: 'ما هو الغرض من الواقع الافتراضي في التعليم؟',
      },
      options: [
        {
          id: 'opt-1',
          text: {
            en: 'To make learning more engaging',
            ar: 'لجعل التعلم أكثر جاذبية',
          },
          isCorrect: true,
        },
        {
          id: 'opt-2',
          text: {
            en: 'Just for entertainment',
            ar: 'فقط للترفيه',
          },
          isCorrect: false,
        },
      ],
      explanation: {
        en: 'VR enhances learning by providing immersive experiences that make complex concepts easier to understand.',
        ar: 'يعزز الواقع الافتراضي التعلم من خلال توفير تجارب غامرة تجعل المفاهيم المعقدة أسهل للفهم.',
      },
      points: 10,
    },
  ];

  // Test scene data with placeholder 360 image
  const testScene: VRSceneType = {
    id: 'test-scene-1',
    title: {
      en: 'Test 360 Scene',
      ar: 'مشهد اختبار 360',
    },
    description: {
      en: 'A test scene with 360-degree panoramic view',
      ar: 'مشهد اختبار بمنظر بانورامي 360 درجة',
    },
    environmentType: '360-image',
    // Using a placeholder equirectangular image URL
    // Replace with actual 360 image for production
    imageUrl: 'https://picsum.photos/4096/2048',
    thumbnailUrl: 'https://picsum.photos/400/200',
    hotspots: testHotspots,
    camera: {
      initialRotation: { x: 0, y: 0, z: 0 },
      minPolarAngle: 0,
      maxPolarAngle: Math.PI,
      enableZoom: true,
      zoomRange: { min: 0.5, max: 2 },
    },
    lighting: {
      ambientIntensity: 0.7,
      ambientColor: '#ffffff',
      directionalIntensity: 0.5,
      directionalColor: '#ffffff',
      directionalPosition: { x: 5, y: 10, z: 5 },
    },
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="p-4 bg-gray-900 text-white">
        <h1 className="text-2xl font-bold mb-2">VR Scene Test</h1>
        <div className="text-sm space-y-1 mb-3">
          <p>
            <span className="font-semibold">WebXR Support:</span>{' '}
            {capabilities.hasWebXRSupport ? '✓ Yes' : '✗ No'}
          </p>
          <p>
            <span className="font-semibold">VR Headset:</span>{' '}
            {capabilities.hasVRHeadset ? '✓ Detected' : '✗ Not detected'}
          </p>
          <p>
            <span className="font-semibold">Display Mode:</span> {capabilities.displayMode}
          </p>
          <p>
            <span className="font-semibold">Performance:</span> {capabilities.performanceLevel}
          </p>
          <p>
            <span className="font-semibold">Device:</span>{' '}
            {capabilities.isMobile ? 'Mobile' : 'Desktop'}
          </p>
          {sceneLoaded && (
            <p className="text-green-400">
              <span className="font-semibold">Scene Status:</span> ✓ Loaded
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setUseScene(false)}
            className={`px-4 py-2 rounded ${
              !useScene ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Basic Shapes
          </button>
          <button
            onClick={() => setUseScene(true)}
            className={`px-4 py-2 rounded ${
              useScene ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            360° Scene
          </button>
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700"
          >
            {language === 'en' ? 'عربي' : 'English'}
          </button>
        </div>
      </div>

      {/* VR Canvas */}
      <div className="h-[calc(100vh-240px)]">
        <VRCanvas
          enableXR={capabilities.hasWebXRSupport}
          mode={capabilities.hasVRHeadset ? 'vr' : '3d'}
          backgroundColor="#1a1a2e"
          shadows
          onXRSessionStart={() => console.log('VR session started')}
          onXRSessionEnd={() => console.log('VR session ended')}
          onError={(error) => console.error('Canvas error:', error)}
        >
          {useScene ? (
            <>
              <VRScene
                scene={testScene}
                enableControls={true}
                isVRMode={capabilities.hasVRHeadset}
                onLoad={() => {
                  console.log('Scene loaded successfully');
                  setSceneLoaded(true);
                }}
                onError={(error) => console.error('Scene error:', error)}
              />
              <VRHotspots
                hotspots={testScene.hotspots}
                language={language}
                onClick={(id, type) => {
                  const msg = `Clicked ${type} hotspot: ${id}`;
                  console.log(msg);
                  setInteractionLog((prev) => [...prev.slice(-4), msg]);
                }}
                onShowInfo={(hotspot) => {
                  const msg = `Showing info: ${hotspot.content.title[language]}`;
                  console.log(msg);
                  setInteractionLog((prev) => [...prev.slice(-4), msg]);
                  setActiveInfoPanel(hotspot.content);
                }}
                onNavigate={(sceneId) => {
                  const msg = `Navigating to scene: ${sceneId}`;
                  console.log(msg);
                  setInteractionLog((prev) => [...prev.slice(-4), msg]);
                }}
                onInteract={(hotspot) => {
                  const msg = `Interacting: ${hotspot.interactionType}`;
                  console.log(msg);
                  setInteractionLog((prev) => [...prev.slice(-4), msg]);
                }}
                onShowQuiz={(hotspot) => {
                  const msg = `Showing quiz: ${hotspot.question[language]}`;
                  console.log(msg);
                  setInteractionLog((prev) => [...prev.slice(-4), msg]);
                }}
              />
              {/* VRInfoPanel Demo */}
              {activeInfoPanel && (
                <VRInfoPanel
                  content={activeInfoPanel}
                  position={{ x: 0, y: 1.6, z: -2 }}
                  isVisible={!!activeInfoPanel}
                  onClose={() => setActiveInfoPanel(null)}
                  language={language}
                  width={600}
                  height={400}
                />
              )}
            </>
          ) : (
            <>
              {/* Ambient light */}
              <ambientLight intensity={0.5} />

              {/* Directional light */}
              <directionalLight position={[5, 5, 5]} intensity={1} castShadow />

              {/* Test cube */}
              <mesh position={[0, 1.6, -2]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#4f46e5" />
              </mesh>

              {/* Test sphere */}
              <mesh position={[-1, 1.6, -2]}>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>

              {/* Test cone */}
              <mesh position={[1, 1.6, -2]}>
                <coneGeometry args={[0.3, 0.6, 32]} />
                <meshStandardMaterial color="#10b981" />
              </mesh>

              {/* Ground plane */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#374151" />
              </mesh>
            </>
          )}
        </VRCanvas>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-900 text-white text-sm">
        {useScene ? (
          <>
            <p className="text-center mb-3">
              Test page for VRScene with interactive hotspots and info panels. You should see a 360° panoramic image with 4 colored hotspots.
              <br />
              <strong>Controls:</strong> Mouse drag to look around, scroll to zoom. Hover over hotspots to see labels, click blue hotspot to see info panel.
              <br />
              <strong>Language:</strong> {language === 'en' ? 'English' : 'العربية'} - Toggle to see RTL text support
            </p>
            <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
              <div className="bg-blue-600 p-2 rounded">
                <strong>Blue:</strong> Info hotspot - Educational content
              </div>
              <div className="bg-purple-600 p-2 rounded">
                <strong>Purple:</strong> Navigation - Go to another scene
              </div>
              <div className="bg-orange-600 p-2 rounded">
                <strong>Orange:</strong> Interactive - Trigger 3D model actions
              </div>
              <div className="bg-yellow-600 p-2 rounded">
                <strong>Yellow:</strong> Quiz - Test your knowledge
              </div>
            </div>
            {interactionLog.length > 0 && (
              <div className="bg-gray-800 p-2 rounded mb-2">
                <p className="font-semibold mb-1">Recent Interactions:</p>
                {interactionLog.map((log, i) => (
                  <p key={i} className="text-xs text-green-400">
                    • {log}
                  </p>
                ))}
              </div>
            )}
            {capabilities.hasWebXRSupport && (
              <p className="text-center text-green-400">
                Click the &quot;Enter VR&quot; button to start VR mode with your headset.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-center">
              Test page for VRCanvas component. You should see three 3D shapes (cube, sphere, cone)
              floating above a ground plane.
            </p>
            {capabilities.hasWebXRSupport && (
              <p className="mt-2 text-center text-green-400">
                Click the &quot;Enter VR&quot; button to start VR mode with your headset.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
