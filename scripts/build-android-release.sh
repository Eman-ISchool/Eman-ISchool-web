#!/bin/bash

# Build signed release APK for Android
# Usage: ./scripts/build-android-release.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")

echo -e "${GREEN}Building Android release APK v${VERSION}${NC}"
echo ""

# Check if environment variables are set
if [ -z "$EDUVERSE_RELEASE_STORE_FILE" ]; then
    echo -e "${YELLOW}Warning: EDUVERSE_RELEASE_STORE_FILE not set${NC}"
    echo "Release APK will be unsigned (debug signing)"
    echo "Set environment variables for signed release:"
    echo "  export EDUVERSE_RELEASE_STORE_FILE=/path/to/keystore.jks"
    echo "  export EDUVERSE_RELEASE_STORE_PASSWORD=your-password"
    echo "  export EDUVERSE_RELEASE_KEY_ALIAS=eduverse"
    echo "  export EDUVERSE_RELEASE_KEY_PASSWORD=your-key-password"
    echo ""
fi

# Sync Capacitor with latest web assets
echo -e "${GREEN}Step 1: Syncing Capacitor...${NC}"
npx cap sync android

# Build release APK
echo -e "${GREEN}Step 2: Building release APK...${NC}"
cd android
./gradlew assembleRelease
cd ..

# Check if build succeeded
if [ ! -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
    echo -e "${RED}Error: APK build failed${NC}"
    echo "Check android/app/build/outputs/apk/release/ for errors"
    exit 1
fi

# Create builds directory
mkdir -p builds/android

# Copy and rename APK with version
APK_SOURCE="android/app/build/outputs/apk/release/app-release.apk"
APK_DEST="builds/android/eduverse-${VERSION}.apk"

echo -e "${GREEN}Step 3: Copying APK to builds directory...${NC}"
cp "$APK_SOURCE" "$APK_DEST"

# Get APK file size
APK_SIZE=$(stat -f%z "$APK_DEST" 2>/dev/null || stat -c%s "$APK_DEST" 2>/dev/null)
APK_SIZE_MB=$((APK_SIZE / 1024 / 1024))

# Create latest.txt file
echo "$VERSION" > "builds/android/latest.txt"

echo ""
echo -e "${GREEN}✓ Build successful!${NC}"
echo "  APK: $APK_DEST"
echo "  Size: ${APK_SIZE_MB} MB"
echo "  Version: $VERSION"
echo ""
echo "To install on device:"
echo "  1. Transfer APK to Android device"
echo "  2. Enable 'Install from unknown sources' in Settings > Security"
echo "  3. Open APK and tap 'Install'"
