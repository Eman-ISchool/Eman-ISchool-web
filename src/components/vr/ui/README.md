# VR UI Components

User interface components for VR experiences including info panels, navigation menus, and control overlays.

## Components

### VRInfoPanel

Floating educational content panel that displays in 3D space.

**Features:**
- Rich media support (text, images, video, audio)
- Arabic RTL text support
- Dismissible with close button
- Billboard effect (always faces camera)
- Smooth fade-in/out animations
- Responsive sizing

**Usage:**

```tsx
import { VRInfoPanel } from '@/components/vr/ui';

function MyVRExperience() {
  const [showPanel, setShowPanel] = useState(false);

  const content = {
    title: {
      en: "The Great Pyramid",
      ar: "الهرم الأكبر"
    },
    description: {
      en: "Built around 2560 BC, the Great Pyramid of Giza is the oldest and largest of the three pyramids.",
      ar: "بُني حوالي عام 2560 قبل الميلاد، الهرم الأكبر في الجيزة هو الأقدم والأكبر من بين الأهرامات الثلاثة."
    },
    imageUrl: "/images/great-pyramid.jpg"
  };

  return (
    <VRCanvas>
      <VRInfoPanel
        content={content}
        position={{ x: 0, y: 1.6, z: -2 }}
        isVisible={showPanel}
        onClose={() => setShowPanel(false)}
        language="en"
        width={600}
        height={400}
      />
    </VRCanvas>
  );
}
```

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `content` | `RichContent` | Yes | - | The content to display (title, description, media) |
| `position` | `HotspotPosition` | Yes | - | 3D position in space (x, y, z) |
| `width` | `number` | No | `600` | Panel width in pixels |
| `height` | `number` | No | `400` | Panel height in pixels |
| `isVisible` | `boolean` | Yes | - | Whether the panel is visible |
| `onClose` | `() => void` | No | - | Callback when panel is closed |
| `language` | `VRLanguage` | No | `'en'` | Display language ('en' or 'ar') |

**Tips:**
- Position panels at eye level (y: 1.6) for comfortable viewing
- Use z: -2 to -3 for readable distance from camera
- Enable close button with onClose prop for dismissible panels
- For Arabic content, set language="ar" for proper RTL rendering
- Keep content concise for better VR readability
- Use images sparingly to maintain performance

### VRNavigation

Floating navigation menu for moving between VR scenes and experiences.

**Features:**
- Scene selector menu with thumbnail grid
- Teleportation between viewpoints with transition effects
- Back/Home navigation buttons with history tracking
- Bilingual support (Arabic RTL & English)
- Toggleable menu (open/close)
- Billboard effect (always faces camera)
- Current scene highlighting
- Responsive grid layout
- Disabled state during transitions

**Usage:**

```tsx
import { VRNavigation } from '@/components/vr/ui';
import { useState } from 'react';

function MyVRExperience() {
  const [activeSceneId, setActiveSceneId] = useState('scene-1');
  const [showNav, setShowNav] = useState(false);

  return (
    <VRCanvas>
      <VRNavigation
        scenes={vrExperience.scenes}
        currentSceneId={activeSceneId}
        onSceneChange={(sceneId) => setActiveSceneId(sceneId)}
        onExit={() => router.push('/vr-eduverse')}
        language="en"
        position={{ x: -2, y: 2, z: -1 }}
        isOpen={showNav}
        onToggle={() => setShowNav(!showNav)}
        showBackButton={true}
        showHomeButton={true}
      />
    </VRCanvas>
  );
}
```

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `scenes` | `VRScene[]` | Yes | - | Array of scenes to display in menu |
| `currentSceneId` | `string` | Yes | - | ID of currently active scene |
| `onSceneChange` | `(sceneId: string) => void` | Yes | - | Callback when scene is selected |
| `onExit` | `() => void` | Yes | - | Callback when exit button is clicked |
| `language` | `VRLanguage` | No | `'en'` | Display language ('en' or 'ar') |
| `position` | `HotspotPosition` | No | `{ x: -2, y: 2, z: -1 }` | 3D position in space |
| `isOpen` | `boolean` | No | `false` | Whether menu is currently open |
| `onToggle` | `() => void` | No | - | Callback when menu is toggled |
| `showBackButton` | `boolean` | No | `true` | Show back navigation button |
| `showHomeButton` | `boolean` | No | `true` | Show home navigation button |

**Tips:**
- Position navigation menu to the side (x: -2 or 2) to avoid blocking view
- Place at comfortable height (y: 1.8-2.5) for easy access
- Use onToggle to control menu state from keyboard shortcuts
- Back button navigates through scene history
- Home button returns to first scene
- Menu automatically tracks scene history for back navigation
- Transitions are blocked during scene changes to prevent errors
- Current scene is highlighted in green with checkmark

## Coming Soon

- VRControls - Control hints overlay
- VRLoadingScreen - Asset loading progress
- VRQuizPanel - Interactive quiz interface
