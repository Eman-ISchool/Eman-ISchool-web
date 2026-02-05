'use client';

import { useState } from 'react';
import { VRCanvas } from '@/components/vr/canvas';
import { VRScene } from '@/components/vr/scenes';
import { VRHotspots } from '@/components/vr/hotspots';
import { VRInfoPanel, VRNavigation } from '@/components/vr/ui';
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
  const [currentSceneId, setCurrentSceneId] = useState('test-scene-1');
  const [showNavigation, setShowNavigation] = useState(false);

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

  // Test scenes data with placeholder 360 images
  const testScenes: VRSceneType[] = [
    {
      id: 'test-scene-1',
      title: {
        en: 'Main Plaza',
        ar: 'الساحة الرئيسية',
      },
      description: {
        en: 'The central gathering area with multiple viewpoints',
        ar: 'منطقة التجمع المركزية مع عدة نقاط عرض',
      },
      environmentType: '360-image',
      imageUrl: 'https://picsum.photos/seed/scene1/4096/2048',
      thumbnailUrl: 'https://picsum.photos/seed/scene1/400/200',
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
    },
    {
      id: 'test-scene-2',
      title: {
        en: 'Garden View',
        ar: 'منظر الحديقة',
      },
      description: {
        en: 'A peaceful garden setting with natural elements',
        ar: 'حديقة هادئة مع عناصر طبيعية',
      },
      environmentType: '360-image',
      imageUrl: 'https://picsum.photos/seed/scene2/4096/2048',
      thumbnailUrl: 'https://picsum.photos/seed/scene2/400/200',
      hotspots: [],
      camera: {
        initialRotation: { x: 0, y: 0, z: 0 },
        minPolarAngle: 0,
        maxPolarAngle: Math.PI,
        enableZoom: true,
        zoomRange: { min: 0.5, max: 2 },
      },
      lighting: {
        ambientIntensity: 0.8,
        ambientColor: '#f0f0e0',
        directionalIntensity: 0.6,
        directionalColor: '#fffacd',
        directionalPosition: { x: -5, y: 10, z: 5 },
      },
    },
    {
      id: 'test-scene-3',
      title: {
        en: 'Historic Hall',
        ar: 'القاعة التاريخية',
      },
      description: {
        en: 'An ancient hall filled with artifacts',
        ar: 'قاعة قديمة مليئة بالقطع الأثرية',
      },
      environmentType: '360-image',
      imageUrl: 'https://picsum.photos/seed/scene3/4096/2048',
      thumbnailUrl: 'https://picsum.photos/seed/scene3/400/200',
      hotspots: [],
      camera: {
        initialRotation: { x: 0, y: 0, z: 0 },
        minPolarAngle: 0,
        maxPolarAngle: Math.PI,
        enableZoom: true,
        zoomRange: { min: 0.5, max: 2 },
      },
      lighting: {
        ambientIntensity: 0.5,
        ambientColor: '#ffd7a3',
        directionalIntensity: 0.4,
        directionalColor: '#ffb74d',
        directionalPosition: { x: 0, y: 5, z: 10 },
      },
    },
  ];

  const currentScene = testScenes.find((scene) => scene.id === currentSceneId);

  const handleHotspotClick = (hotspot: AnyHotspot) => {
    setInteractionLog((prev) => [
      `Clicked ${hotspot.type} hotspot: ${hotspot.id}`,
      ...prev.slice(0, 4),
    ]);

    if (hotspot.type === 'info') {
      const infoHotspot = hotspot as InfoHotspot;
      setActiveInfoPanel(infoHotspot.content);
    }
  };

  const handleSceneChange = (sceneId: string) => {
    setCurrentSceneId(sceneId);
    setSceneLoaded(false);
    setInteractionLog((prev) => [`Switched to scene: ${sceneId}`, ...prev.slice(0, 4)]);
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">VR Scene Test Page</h1>

        {/* Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => setUseScene(!useScene)}
              className={`px-4 py-2 rounded ${useScene ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {useScene ? 'Using VRScene Component' : 'Using Raw VRCanvas'}
            </button>

            <button
              onClick={() => setShowNavigation(!showNavigation)}
              className={`px-4 py-2 rounded ${showNavigation ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {showNavigation ? 'Hide Navigation' : 'Show Navigation'}
            </button>

            <button
              onClick={toggleLanguage}
              className="px-4 py-2 rounded bg-gray-200"
            >
              Language: {language.toUpperCase()}
            </button>

            <div className="text-sm text-gray-600">
              VR Support: {capabilities.isSupported ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* VR Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden" style={{ height: '70vh' }}>
              {useScene && currentScene ? (
                <VRScene
                  scene={currentScene}
                  onSceneLoaded={() => setSceneLoaded(true)}
                  onSceneChange={handleSceneChange}
                  onHotspotClick={handleHotspotClick}
                />
              ) : (
                <VRCanvas>
                  {currentScene && (
                    <>
                      <VRScene scene={currentScene} onSceneLoaded={() => setSceneLoaded(true)} />
                      <VRHotspots hotspots={currentScene.hotspots} onHotspotClick={handleHotspotClick} />
                    </>
                  )}
                </VRCanvas>
              )}

              {activeInfoPanel && (
                <VRInfoPanel
                  content={activeInfoPanel}
                  language={language}
                  onClose={() => setActiveInfoPanel(null)}
                />
              )}

              {showNavigation && (
                <VRNavigation
                  scenes={testScenes}
                  currentSceneId={currentSceneId}
                  onSceneSelect={handleSceneChange}
                  language={language}
                />
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-semibold mb-2">Current Scene</h2>
              <p className="text-sm">{currentScene?.title[language]}</p>
              <p className="text-xs text-gray-500 mt-1">{currentScene?.description[language]}</p>
              <p className="text-xs text-gray-500 mt-2">
                Loaded: {sceneLoaded ? 'Yes' : 'No'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-semibold mb-2">Interaction Log</h2>
              <ul className="text-xs text-gray-600 space-y-1">
                {interactionLog.length === 0 ? (
                  <li>No interactions yet</li>
                ) : (
                  interactionLog.map((entry, index) => (
                    <li key={index}>{entry}</li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
