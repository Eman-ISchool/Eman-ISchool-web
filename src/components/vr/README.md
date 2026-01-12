# VR Components

This directory contains all VR-related React components for the EduVerse VR educational experiences.

## Structure

### `/canvas`
Main VR canvas wrapper components using React Three Fiber with XR support.
- VRCanvas component with proper sizing and XR mode support

### `/scenes`
Base VR scene components for loading and displaying 360-degree environments.
- VRScene for 360 equirectangular images
- Camera controls and lighting setup

### `/hotspots`
Interactive hotspot components for information points and navigation.
- Clickable/gazeable hotspots
- Info panel triggers
- Scene navigation points

### `/ui`
VR UI components for user interaction.
- VRInfoPanel - Floating info panels for educational content
- VRNavigation - Navigation system between scenes
- VRControls - Unified control system for headsets, mouse, and touch

### `/experiences`
Complete VR educational experiences organized by subject.

#### `/experiences/field-trips`
Egyptian historical site virtual field trips:
- Pyramids of Giza
- Egyptian Museum
- Abu Simbel Temple

#### `/experiences/science`
3D science visualizations:
- Solar System
- Human Cell
- Atoms & Molecules

#### `/experiences/geography`
Geography VR experiences:
- Nile River
- Sinai Peninsula
- Egyptian Ecosystems

### `/fallback`
2D fallback components for browsers without VR support.
- 2D Panorama Viewer
- Static Gallery Mode
- 2D Science Visualizations

## Development Guidelines

1. All components should support both VR and non-VR modes
2. Use TypeScript with proper types from `src/types/vr.ts`
3. Support Arabic RTL text for bilingual content
4. Implement loading states for assets
5. Follow accessibility best practices
6. Use client-side rendering (dynamic imports) for VR components
