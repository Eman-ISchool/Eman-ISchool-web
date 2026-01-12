#!/bin/bash
# VR Educational Experience - Environment Setup Script
# Run this script to set up the development environment

echo "Setting up VR Educational Experience development environment..."

# Check if yarn is available
if ! command -v yarn &> /dev/null; then
    echo "yarn not found, please install yarn first"
    exit 1
fi

# Install existing dependencies
echo "Installing existing dependencies..."
yarn install

# Install VR-specific dependencies
echo "Installing VR dependencies..."
yarn add three @react-three/fiber @react-three/drei @react-three/xr

# Install TypeScript types
echo "Installing TypeScript types..."
yarn add -D @types/three

# Create VR component directories
echo "Creating VR directory structure..."
mkdir -p src/components/vr/core
mkdir -p src/components/vr/scenes/field-trips
mkdir -p src/components/vr/scenes/science
mkdir -p src/components/vr/scenes/geography
mkdir -p src/components/vr/ui
mkdir -p src/components/vr/fallback
mkdir -p src/lib/vr
mkdir -p public/vr/360-images
mkdir -p public/vr/models
mkdir -p public/vr/textures

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'yarn dev' to start the development server"
echo "2. Begin implementing Phase 1 subtasks"
echo ""
echo "VR Experience URLs (to be created):"
echo "  - /vr-eduverse (existing landing page)"
echo "  - /vr-eduverse/field-trips"
echo "  - /vr-eduverse/science"
echo "  - /vr-eduverse/geography"
