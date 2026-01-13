# VR Experience Components

This directory contains specialized VR experience components for science visualizations and interactive 3D educational content.

## Components

### SolarSystemScene

Interactive 3D model of the solar system with all 8 planets.

**Features:**
- All 8 planets with accurate relative sizes
- Orbital animations around the Sun
- Clickable planets with info panels
- Scale toggle (realistic vs. viewable distances)
- Adjustable animation speed
- Planet rotation on their axes

**Usage:**
```tsx
import { SolarSystemScene, PLANETS_DATA } from '@/components/vr/experiences/SolarSystemScene';

<VRCanvas>
  <SolarSystemScene
    language="ar"
    onPlanetClick={(planet, index) => console.log(planet)}
    realisticScale={false}
    animationSpeed={1}
  />
</VRCanvas>
```

**Props:**
- `language: VRLanguage` - Display language (ar/en)
- `onPlanetClick: (planet: PlanetData, index: number) => void` - Callback when planet is clicked
- `realisticScale: boolean` - Use realistic distances (true) or viewable scale (false)
- `animationSpeed: number` - Animation speed multiplier (0 = paused, 1 = normal, 5 = max)

**Planet Data:**
Each planet includes:
- Name (bilingual)
- Accurate radius in km
- Distance from Sun in AU
- Orbital period (days)
- Rotation period (hours)
- Number of moons
- Color
- Description
- 3 interesting facts

## Adding New Experiences

When creating new science visualizations:

1. Create a new component file (e.g., `HumanCellScene.tsx`)
2. Follow the existing pattern:
   - Use `useFrame` for animations
   - Support bilingual content
   - Include interactive elements (clickable objects)
   - Add educational data as constants
3. Export from `index.ts`
4. Create corresponding page in `/app/vr-eduverse/science/[slug]/`
5. Update the science hub page to mark as available

## Best Practices

- **Performance**: Keep polygon counts reasonable for smooth 60fps
- **Scale**: Use appropriate scales for visibility while maintaining proportions
- **Interactivity**: Make objects clickable with hover states
- **Education**: Include rich educational content with each interactive element
- **Accessibility**: Support both VR and non-VR modes
- **Localization**: All text content should be bilingual (Arabic & English)
