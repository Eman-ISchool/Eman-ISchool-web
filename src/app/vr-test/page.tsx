'use client';

import { useState } from 'react';
import { VRCanvas } from '@/components/vr/canvas';
import { VRScene } from '@/components/vr/scenes';
import { useVRCapabilities } from '@/lib/vr/hooks';
import type { VRScene as VRSceneType } from '@/types/vr';

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
    hotspots: [],
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

        {/* Toggle between basic scene and VRScene */}
        <div className="flex gap-2">
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
      <div className="p-4 bg-gray-900 text-white text-center text-sm">
        {useScene ? (
          <>
            <p>
              Test page for VRScene component. You should see a 360-degree panoramic image.
              <br />
              Use mouse drag to look around, scroll to zoom.
            </p>
            {capabilities.hasWebXRSupport && (
              <p className="mt-2 text-green-400">
                Click the &quot;Enter VR&quot; button to start VR mode with your headset.
              </p>
            )}
          </>
        ) : (
          <>
            <p>
              Test page for VRCanvas component. You should see three 3D shapes (cube, sphere, cone)
              floating above a ground plane.
            </p>
            {capabilities.hasWebXRSupport && (
              <p className="mt-2 text-green-400">
                Click the &quot;Enter VR&quot; button to start VR mode with your headset.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
