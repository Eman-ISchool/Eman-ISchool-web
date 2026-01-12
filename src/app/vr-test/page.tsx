'use client';

import { VRCanvas } from '@/components/vr/canvas';
import { useVRCapabilities } from '@/lib/vr/hooks';

/**
 * VR Canvas Test Page
 *
 * Simple test page to verify VRCanvas component works correctly
 * with basic 3D primitives and WebXR support detection.
 */
export default function VRTestPage() {
  const capabilities = useVRCapabilities();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="p-4 bg-gray-900 text-white">
        <h1 className="text-2xl font-bold mb-2">VR Canvas Test</h1>
        <div className="text-sm space-y-1">
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
        </div>
      </div>

      {/* VR Canvas */}
      <div className="h-[calc(100vh-200px)]">
        <VRCanvas
          enableXR={capabilities.hasWebXRSupport}
          mode={capabilities.hasVRHeadset ? 'vr' : '3d'}
          backgroundColor="#1a1a2e"
          shadows
          onXRSessionStart={() => console.log('VR session started')}
          onXRSessionEnd={() => console.log('VR session ended')}
          onError={(error) => console.error('Canvas error:', error)}
        >
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
        </VRCanvas>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-900 text-white text-center text-sm">
        <p>
          Test page for VRCanvas component. You should see three 3D shapes (cube, sphere, cone)
          floating above a ground plane.
        </p>
        {capabilities.hasWebXRSupport && (
          <p className="mt-2 text-green-400">
            Click the &quot;Enter VR&quot; button to start VR mode with your headset.
          </p>
        )}
      </div>
    </div>
  );
}
