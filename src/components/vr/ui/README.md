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

## Coming Soon

- VRNavigation - Navigation menu for scene selection
- VRControls - Control hints overlay
- VRLoadingScreen - Asset loading progress
- VRQuizPanel - Interactive quiz interface
