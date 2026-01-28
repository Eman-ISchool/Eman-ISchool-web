#!/bin/bash

# Build ad hoc IPA for iOS
# Usage: ./scripts/build-ios-adhoc.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")

echo -e "${GREEN}Building iOS ad hoc IPA v${VERSION}${NC}"
echo ""

# Check if on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}Error: iOS builds require macOS${NC}"
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}Error: Xcode not found${NC}"
    echo "Please install Xcode from the App Store"
    exit 1
fi

# Check if environment variables are set
if [ -z "$EDUVERSE_IOS_TEAM_ID" ]; then
    echo -e "${YELLOW}Warning: EDUVERSE_IOS_TEAM_ID not set${NC}"
    echo "Update ExportOptions.plist with your Team ID:"
    echo "  export EDUVERSE_IOS_TEAM_ID=XXXXXXXXXX"
    echo ""
fi

# Sync Capacitor with latest web assets
echo -e "${GREEN}Step 1: Syncing Capacitor...${NC}"
npx cap sync ios

# Install CocoaPods dependencies
echo -e "${GREEN}Step 2: Installing CocoaPods...${NC}"
cd ios/App
if [ ! -d "Pods" ]; then
    pod install
else
    echo "  Pods already installed, skipping..."
fi
cd ../..

# Create build directory
mkdir -p ios/build

# Archive
echo -e "${GREEN}Step 3: Archiving...${NC}"
xcodebuild archive \
    -workspace ios/App/App.xcworkspace \
    -scheme App \
    -configuration Release \
    -archivePath ios/build/Eduverse.xcarchive \
    -allowProvisioningUpdates

# Check if archive succeeded
if [ ! -d "ios/build/Eduverse.xcarchive" ]; then
    echo -e "${RED}Error: Archive failed${NC}"
    echo "Check ios/build/ for errors"
    exit 1
fi

# Export IPA
echo -e "${GREEN}Step 4: Exporting IPA...${NC}"
xcodebuild -exportArchive \
    -archivePath ios/build/Eduverse.xcarchive \
    -exportPath ios/build/ipa \
    -exportOptionsPlist ios/ExportOptions.plist

# Check if export succeeded
if [ ! -f "ios/build/ipa/App.ipa" ]; then
    echo -e "${RED}Error: IPA export failed${NC}"
    echo "Check ios/build/ipa/ for errors"
    exit 1
fi

# Create builds directory
mkdir -p builds/ios

# Copy and rename IPA with version
IPA_SOURCE="ios/build/ipa/App.ipa"
IPA_DEST="builds/ios/eduverse-${VERSION}.ipa"

echo -e "${GREEN}Step 5: Copying IPA to builds directory...${NC}"
cp "$IPA_SOURCE" "$IPA_DEST"

# Get IPA file size
IPA_SIZE=$(stat -f%z "$IPA_DEST" 2>/dev/null || stat -c%s "$IPA_DEST" 2>/dev/null)
IPA_SIZE_MB=$((IPA_SIZE / 1024 / 1024))

# Create latest.txt file
echo "$VERSION" > "builds/ios/latest.txt"

echo ""
echo -e "${GREEN}✓ Build successful!${NC}"
echo "  IPA: $IPA_DEST"
echo "  Size: ${IPA_SIZE_MB} MB"
echo "  Version: $VERSION"
echo ""
echo "To install on device:"
echo "  1. Connect iOS device to Mac"
echo "  2. Open Apple Configurator"
echo "  3. Drag IPA onto device"
echo "  4. Trust developer certificate in Settings > General > Device Management"
