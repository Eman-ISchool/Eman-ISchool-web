# VR Library

This directory contains utilities, hooks, and helper functions for VR functionality.

## Structure

### `/hooks`
Custom React hooks for VR functionality:
- `useVRCapabilities` - Detect WebXR support and device capabilities
- `useVRAnalytics` - Track user interactions in VR experiences
- `useVRSession` - Manage VR session state
- Other VR-specific hooks

### `/utils`
VR utility functions:
- Asset loading helpers
- 3D math utilities
- Scene management helpers
- Performance optimization utilities

## Usage Guidelines

1. Keep hooks focused and composable
2. Document all utility functions with JSDoc
3. Include proper TypeScript types
4. Write unit tests for complex utilities
5. Follow existing patterns from `src/lib/`
