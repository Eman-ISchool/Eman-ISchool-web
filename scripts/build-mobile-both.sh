#!/bin/bash

# Build both Android and iOS mobile versions
# Usage: ./scripts/build-mobile-both.sh [android|ios|both]
# Default: both

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")

# Parse arguments
PLATFORM=${1:-both}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Eduverse Mobile Build v${VERSION}   ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to build Next.js static export
build_web() {
    echo -e "${GREEN}Step 1: Building Next.js static export...${NC}"
    
    # Temporarily enable static export in next.config.mjs
    if grep -q "output: 'export'" next.config.mjs; then
        echo "  Static export already enabled"
    else
        echo "  Temporarily enabling static export..."
        sed -i.bak "s|// output: 'export'|output: 'export'|" next.config.mjs
    fi
    
    # Build the static export
    npm run build
    
    # Restore original next.config.mjs
    if [ -f "next.config.mjs.bak" ]; then
        mv next.config.mjs.bak next.config.mjs
    fi
    
    echo -e "${GREEN}  ✓ Web build complete${NC}"
    echo ""
}

# Function to build Android
build_android() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Building Android APK${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    
    # Check if environment variables are set
    if [ -z "$EDUVERSE_RELEASE_STORE_FILE" ]; then
        echo -e "${YELLOW}Warning: EDUVERSE_RELEASE_STORE_FILE not set${NC}"
        echo "Release APK will be unsigned (debug signing)"
        echo ""
    fi
    
    # Sync Capacitor with Android
    echo -e "${BLUE}Step 1: Syncing Capacitor with Android...${NC}"
    npx cap sync android
    
    # Build release APK
    echo -e "${BLUE}Step 2: Building release APK...${NC}"
    cd android
    ./gradlew assembleRelease
    cd ..
    
    # Check if build succeeded
    if [ ! -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
        echo -e "${RED}Error: APK build failed${NC}"
        exit 1
    fi
    
    # Create builds directory
    mkdir -p builds/android
    
    # Copy and rename APK with version
    APK_SOURCE="android/app/build/outputs/apk/release/app-release.apk"
    APK_DEST="builds/android/eduverse-${VERSION}.apk"
    
    echo -e "${BLUE}Step 3: Copying APK to builds directory...${NC}"
    cp "$APK_SOURCE" "$APK_DEST"
    
    # Get APK file size
    APK_SIZE=$(stat -f%z "$APK_DEST" 2>/dev/null || stat -c%s "$APK_DEST" 2>/dev/null)
    APK_SIZE_MB=$((APK_SIZE / 1024 / 1024))
    
    # Create latest.txt file
    echo "$VERSION" > "builds/android/latest.txt"
    
    echo ""
    echo -e "${GREEN}✓ Android build successful!${NC}"
    echo "  APK: $APK_DEST"
    echo "  Size: ${APK_SIZE_MB} MB"
    echo "  Version: $VERSION"
    echo ""
}

# Function to build iOS
build_ios() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Building iOS IPA${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    
    # Check if on macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo -e "${RED}Error: iOS builds require macOS${NC}"
        echo "Skipping iOS build..."
        return
    fi
    
    # Check if Xcode is installed
    if ! command -v xcodebuild &> /dev/null; then
        echo -e "${RED}Error: Xcode not found${NC}"
        echo "Skipping iOS build..."
        return
    fi
    
    # Check if environment variables are set
    if [ -z "$EDUVERSE_IOS_TEAM_ID" ]; then
        echo -e "${YELLOW}Warning: EDUVERSE_IOS_TEAM_ID not set${NC}"
        echo "Update ExportOptions.plist with your Team ID"
        echo ""
    fi
    
    # Sync Capacitor with iOS
    echo -e "${BLUE}Step 1: Syncing Capacitor with iOS...${NC}"
    npx cap sync ios
    
    # Create build directory
    mkdir -p ios/build
    
    # Archive (using project instead of workspace)
    echo -e "${BLUE}Step 2: Archiving...${NC}"
    xcodebuild archive \
        -project ios/App/App.xcodeproj \
        -scheme App \
        -configuration Release \
        -archivePath ios/build/Eduverse.xcarchive \
        -allowProvisioningUpdates || {
        echo -e "${YELLOW}Warning: Archive failed, trying with workspace...${NC}"
        if [ -f "ios/App/App.xcworkspace/contents.xcworkspacedata" ]; then
            xcodebuild archive \
                -workspace ios/App/App.xcworkspace \
                -scheme App \
                -configuration Release \
                -archivePath ios/build/Eduverse.xcarchive \
                -allowProvisioningUpdates
        fi
    }
    
    # Check if archive succeeded
    if [ ! -d "ios/build/Eduverse.xcarchive" ]; then
        echo -e "${RED}Error: Archive failed${NC}"
        exit 1
    fi
    
    # Export IPA
    echo -e "${BLUE}Step 3: Exporting IPA...${NC}"
    xcodebuild -exportArchive \
        -archivePath ios/build/Eduverse.xcarchive \
        -exportPath ios/build/ipa \
        -exportOptionsPlist ios/ExportOptions.plist
    
    # Check if export succeeded
    if [ ! -f "ios/build/ipa/App.ipa" ]; then
        echo -e "${RED}Error: IPA export failed${NC}"
        exit 1
    fi
    
    # Create builds directory
    mkdir -p builds/ios
    
    # Copy and rename IPA with version
    IPA_SOURCE="ios/build/ipa/App.ipa"
    IPA_DEST="builds/ios/eduverse-${VERSION}.ipa"
    
    echo -e "${BLUE}Step 4: Copying IPA to builds directory...${NC}"
    cp "$IPA_SOURCE" "$IPA_DEST"
    
    # Get IPA file size
    IPA_SIZE=$(stat -f%z "$IPA_DEST" 2>/dev/null || stat -c%s "$IPA_DEST" 2>/dev/null)
    IPA_SIZE_MB=$((IPA_SIZE / 1024 / 1024))
    
    # Create latest.txt file
    echo "$VERSION" > "builds/ios/latest.txt"
    
    echo ""
    echo -e "${GREEN}✓ iOS build successful!${NC}"
    echo "  IPA: $IPA_DEST"
    echo "  Size: ${IPA_SIZE_MB} MB"
    echo "  Version: $VERSION"
    echo ""
}

# Main execution
case $PLATFORM in
    android)
        build_web
        build_android
        ;;
    ios)
        build_web
        build_ios
        ;;
    both)
        build_web
        build_android
        build_ios
        ;;
    *)
        echo -e "${RED}Error: Invalid platform '$PLATFORM'${NC}"
        echo "Usage: $0 [android|ios|both]"
        exit 1
        ;;
esac

# Print summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Build Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ -f "builds/android/eduverse-${VERSION}.apk" ]; then
    echo -e "${GREEN}✓ Android: builds/android/eduverse-${VERSION}.apk${NC}"
fi

if [ -f "builds/ios/eduverse-${VERSION}.ipa" ]; then
    echo -e "${GREEN}✓ iOS: builds/ios/eduverse-${VERSION}.ipa${NC}"
fi

echo ""
echo -e "${BLUE}Installation Instructions:${NC}"
echo ""
echo "Android:"
echo "  1. Transfer APK to Android device"
echo "  2. Enable 'Install from unknown sources' in Settings > Security"
echo "  3. Open APK and tap 'Install'"
echo ""
echo "iOS:"
echo "  1. Connect iOS device to Mac"
echo "  2. Open Apple Configurator"
echo "  3. Drag IPA onto device"
echo "  4. Trust developer certificate in Settings > General > Device Management"
echo ""
