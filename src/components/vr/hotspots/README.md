# VR Hotspots Components

Interactive 3D markers for VR scenes that support multiple interaction types including information points, navigation, interactive elements, and quizzes.

## Components

### BaseHotspot

Low-level component that renders a 3D sphere marker with hover effects and animations.

**Features:**
- Pulsing animation to draw attention
- Hover state with visual feedback
- Customizable color and scale
- Optional label overlay (HTML)
- Click/tap interaction support

**Usage:**
```tsx
<BaseHotspot
  id="hotspot-1"
  position={{ x: 0, y: 1.6, z: -2 }}
  color="#4f46e5"
  label="Click me"
  onClick={() => console.log('Clicked!')}
  enablePulse={true}
/>
```

### InfoHotspot (Blue)

Displays educational information when clicked. Uses distinctive blue color.

**Features:**
- Rich content support (text, images, video, audio)
- Bilingual (Arabic & English)
- Related hotspots linking
- Visual feedback when viewed

**Usage:**
```tsx
<InfoHotspot
  hotspot={infoHotspotData}
  language="en"
  onShowInfo={(hotspot) => displayInfoPanel(hotspot)}
/>
```

### NavigationHotspot (Purple)

Teleports user to another scene when clicked. Uses distinctive purple/magenta color.

**Features:**
- Scene-to-scene navigation
- Optional transition duration
- Preview image support
- Visual indication of teleportation

**Usage:**
```tsx
<NavigationHotspot
  hotspot={navHotspotData}
  language="en"
  onNavigate={(sceneId) => changeScene(sceneId)}
/>
```

### InteractiveHotspot (Orange)

Triggers custom interactions with 3D models. Uses distinctive orange color.

**Interaction Types:**
- `rotate` - Rotates 3D models
- `scale` - Scales models up/down
- `animate` - Plays model animations
- `toggle` - Toggles visibility/state

**Usage:**
```tsx
<InteractiveHotspot
  hotspot={interactiveHotspotData}
  language="en"
  onInteract={(hotspot) => handleModelInteraction(hotspot)}
/>
```

### QuizHotspot (Yellow)

Presents educational questions when clicked. Uses distinctive yellow color.

**Features:**
- Multiple-choice questions
- Answer correctness tracking
- Explanations after answering
- Point scoring system
- Color change when completed

**Usage:**
```tsx
<QuizHotspot
  hotspot={quizHotspotData}
  language="en"
  onShowQuiz={(hotspot) => displayQuiz(hotspot)}
  isAnswered={false}
/>
```

### VRHotspot

Universal hotspot component that dispatches to the appropriate specialized component based on type.

**Usage:**
```tsx
<VRHotspot
  hotspot={anyHotspotData}
  language="en"
  onClick={(id, type) => trackInteraction(id, type)}
  onShowInfo={(hotspot) => setActiveInfo(hotspot)}
  onNavigate={(sceneId) => changeScene(sceneId)}
  onInteract={(hotspot) => handleInteraction(hotspot)}
  onShowQuiz={(hotspot) => displayQuiz(hotspot)}
  answeredQuizIds={answeredIds}
/>
```

### VRHotspots (Plural)

Renders multiple hotspots from an array, typically from a VR scene.

**Usage:**
```tsx
<VRHotspots
  hotspots={scene.hotspots}
  language="en"
  onClick={(id, type) => trackInteraction(id, type)}
  onShowInfo={(hotspot) => setActiveInfo(hotspot)}
  onNavigate={(sceneId) => changeScene(sceneId)}
/>
```

## Color Coding

Each hotspot type uses a distinctive color for easy identification:

- **Blue (#3b82f6)**: Information hotspots - Educational content
- **Purple (#a855f7)**: Navigation hotspots - Scene teleportation
- **Orange (#f97316)**: Interactive hotspots - 3D model interactions
- **Yellow (#eab308)**: Quiz hotspots - Educational questions
- **Green (#10b981)**: Completed state - For viewed/answered hotspots

## Type Definitions

All hotspot types are defined in `src/types/vr.ts`:

- `VRHotspot` - Base interface
- `InfoHotspot` - Information content
- `NavigationHotspot` - Scene navigation
- `InteractiveHotspot` - Model interactions
- `QuizHotspot` - Educational quizzes
- `AnyHotspot` - Union type of all hotspot types

## Best Practices

1. **Position Hotspots Thoughtfully**: Place hotspots at eye level (y: 1.6) or where they make sense in the scene
2. **Use Appropriate Types**: Choose the right hotspot type for your content
3. **Provide Clear Labels**: Use concise, descriptive titles in both languages
4. **Limit Hotspot Count**: Don't overcrowd scenes (4-8 hotspots per scene is ideal)
5. **Test Interactions**: Ensure all callbacks work correctly
6. **Track User Progress**: Use the analytics callbacks to track user interactions

## Testing

Visit `/vr-test` to see all hotspot types in action with a 360° panoramic scene.

## Related Components

- `VRScene` - Displays 360° environments where hotspots are placed
- `VRCanvas` - Main VR rendering wrapper
- `VRInfoPanel` - Displays content from info hotspots (to be implemented)
- `VRNavigation` - Handles scene navigation (to be implemented)
