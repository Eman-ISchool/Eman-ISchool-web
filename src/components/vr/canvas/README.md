# VR Canvas Components

Core VR canvas components for rendering VR experiences with React Three Fiber.

## Components

### VRCanvas

Main wrapper component for VR experiences using React Three Fiber and WebXR.

**Features:**
- WebXR integration for VR headset support
- Responsive sizing
- Fallback for non-VR browsers
- Error handling
- Configurable camera and rendering settings

**Usage:**
```tsx
import { VRCanvas } from '@/components/vr/canvas';

<VRCanvas enableXR mode="vr">
  <VRScene />
  <VRHotspots />
</VRCanvas>
```

**Props:**
- `enableXR` (boolean): Enable WebXR mode
- `mode` ('vr' | '3d' | '2d'): Initial rendering mode
- `fov` (number): Camera field of view
- `near` (number): Camera near plane
- `far` (number): Camera far plane
- `backgroundColor` (string): Background color
- `shadows` (boolean): Enable shadows
- `onXRSessionStart` (function): Callback when VR session starts
- `onXRSessionEnd` (function): Callback when VR session ends
- `onError` (function): Callback when errors occur

---

### VRControls

Unified control system that works across VR headsets, desktop mouse, mobile touch, and keyboard.

**Features:**
- VR controller support with ray visualization
- Mouse drag for desktop
- Touch swipe and pinch-to-zoom for mobile
- Keyboard navigation (WASD, arrow keys, Q/E for up/down)
- Optional gaze control for headsets without controllers
- Configurable sensitivity per input type
- Automatic detection of input method

**Usage:**
```tsx
import { VRControls } from '@/components/vr/canvas';

<VRControls
  enableOrbitControls={true}
  enableZoom={true}
  controlScheme={{
    enableVRControllers: true,
    enableMouseControl: true,
    enableTouchControl: true,
    enableKeyboardControl: true,
    mouseSensitivity: 1.0,
    touchSensitivity: 1.5,
  }}
/>
```

**Props:**
- `controlScheme` (VRControlScheme): Control configuration
  - `enableVRControllers` (boolean): Enable VR controller input
  - `enableMouseControl` (boolean): Enable mouse drag/wheel
  - `enableTouchControl` (boolean): Enable touch gestures
  - `enableKeyboardControl` (boolean): Enable keyboard navigation
  - `enableGazeControl` (boolean): Enable gaze-based selection
  - `mouseSensitivity` (number): Mouse rotation speed multiplier
  - `touchSensitivity` (number): Touch gesture speed multiplier
  - `gazeDuration` (number): Time in ms to gaze for selection
- `enableOrbitControls` (boolean): Use OrbitControls in non-VR mode
- `enablePan` (boolean): Allow camera panning
- `enableZoom` (boolean): Allow camera zooming
- `enableRotate` (boolean): Allow camera rotation
- `enableDamping` (boolean): Enable smooth camera movement
- `dampingFactor` (number): Damping smoothness (0-1)
- `rotateSpeed` (number): Base rotation speed
- `minDistance` (number): Minimum zoom distance
- `maxDistance` (number): Maximum zoom distance
- `minPolarAngle` (number): Minimum vertical rotation
- `maxPolarAngle` (number): Maximum vertical rotation
- `target` ([number, number, number]): Point to orbit around
- `onChange` (function): Called when controls change
- `onStart` (function): Called when user starts interacting
- `onEnd` (function): Called when user stops interacting

**Control Methods:**

**Desktop (Mouse):**
- Left-click drag: Rotate camera
- Right-click drag: Pan camera (if enabled)
- Scroll wheel: Zoom in/out

**Mobile (Touch):**
- One finger swipe: Rotate camera
- Two finger pinch: Zoom in/out
- Two finger drag: Pan camera (if enabled)

**Keyboard:**
- W/↑: Move forward
- S/↓: Move backward
- A/←: Move left
- D/→: Move right
- Q: Move up
- E: Move down
- Shift: Move faster

**VR Controllers:**
- Point controller: Aim ray
- Trigger button: Select
- Ray visualization: Green (left) / Blue (right)

**Gaze Control:**
- Look at object for specified duration
- Visual feedback during gaze time
- Auto-select when duration reached

---

### VRControlsHUD

Optional heads-up display showing control hints to users.

**Usage:**
```tsx
import { VRControlsHUD } from '@/components/vr/canvas';

<VRControlsHUD
  controlScheme={controlScheme}
  isVRMode={isPresenting}
  visible={showHints}
/>
```

**Props:**
- `controlScheme` (VRControlScheme): Current control configuration
- `isVRMode` (boolean): Whether user is in VR
- `position` ([number, number, number]): HUD position in 3D space
- `visible` (boolean): Whether to show the HUD

---

### VRCanvasLoading

Loading fallback component for VR canvas.

**Usage:**
```tsx
import { VRCanvasLoading } from '@/components/vr/canvas';

<Suspense fallback={<VRCanvasLoading />}>
  <VRCanvas>...</VRCanvas>
</Suspense>
```

## Best Practices

1. **Always use dynamic imports** for VR components to avoid SSR issues:
   ```tsx
   const VRCanvas = dynamic(() => import('@/components/vr/canvas').then(m => m.VRCanvas), {
     ssr: false
   });
   ```

2. **Wrap VR components in Suspense** for better loading states:
   ```tsx
   <Suspense fallback={<VRCanvasLoading />}>
     <VRCanvas>...</VRCanvas>
   </Suspense>
   ```

3. **Use VRControls instead of OrbitControls** for better VR integration:
   - VRControls automatically disables in VR mode
   - Provides consistent experience across devices
   - Supports additional input methods

4. **Configure sensitivity based on content type**:
   - High sensitivity for quick navigation
   - Low sensitivity for precise viewing
   - Touch sensitivity typically higher than mouse

5. **Provide control hints** with VRControlsHUD for first-time users

6. **Test on multiple devices**:
   - Desktop with mouse
   - Mobile with touch
   - VR headset with controllers
   - VR headset without controllers (gaze control)

## Examples

### Basic VR Scene with Controls

```tsx
'use client';

import dynamic from 'next/dynamic';

const VRCanvas = dynamic(() => import('@/components/vr/canvas').then(m => m.VRCanvas), { ssr: false });
const VRControls = dynamic(() => import('@/components/vr/canvas').then(m => m.VRControls), { ssr: false });
const VRScene = dynamic(() => import('@/components/vr/scenes').then(m => m.VRScene), { ssr: false });

export default function VRExperience() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <VRCanvas enableXR mode="vr">
        <VRScene scene={sceneData} enableControls={false} />
        <VRControls
          enableOrbitControls={true}
          enableZoom={true}
          controlScheme={{
            enableVRControllers: true,
            enableMouseControl: true,
            enableTouchControl: true,
            enableKeyboardControl: true,
          }}
        />
      </VRCanvas>
    </div>
  );
}
```

### Custom Control Configuration

```tsx
const customControls: Partial<VRControlScheme> = {
  enableVRControllers: true,
  enableMouseControl: true,
  enableTouchControl: true,
  enableKeyboardControl: false, // Disable keyboard
  enableGazeControl: true, // Enable gaze for accessibility
  mouseSensitivity: 0.8, // Slower mouse movement
  touchSensitivity: 1.2, // Faster touch response
  gazeDuration: 1500, // 1.5s gaze to select
};

<VRControls
  controlScheme={customControls}
  enableZoom={false} // Fixed distance view
  minPolarAngle={Math.PI / 4} // Limit looking down
  maxPolarAngle={3 * Math.PI / 4} // Limit looking up
/>
```

## Architecture

```
VRCanvas (Root Container)
├── Canvas (@react-three/fiber)
│   ├── XR Provider (@react-three/xr)
│   │   ├── VR Session Management
│   │   └── Controller Tracking
│   ├── Camera Setup
│   └── Scene Content
│       ├── VRControls (This component)
│       │   ├── OrbitControls (Non-VR mode)
│       │   ├── VR Controller Handlers
│       │   ├── Keyboard Handlers
│       │   ├── Touch Handlers
│       │   └── Gaze Control
│       ├── VRScene
│       ├── VRHotspots
│       └── Other VR Components
└── UI Overlays
    └── Enter VR Button
```

## Type Definitions

See `src/types/vr.ts` for complete type definitions:
- `VRControlScheme`: Control configuration interface
- `VRMode`: 'vr' | '3d' | '2d'
- `VRCapabilities`: Device capability detection

## Related Components

- `VRScene`: Renders 360° environments
- `VRHotspot`: Interactive points
- `VRNavigation`: Scene navigation
- `useVRCapabilities`: Hook for device detection
