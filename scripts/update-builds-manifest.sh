#!/bin/bash

# Generate builds manifest from artifacts in builds/ directory
# Usage: ./scripts/update-builds-manifest.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directories
BUILDS_DIR="builds"
PUBLIC_DIR="public/builds"
MANIFEST_FILE="$PUBLIC_DIR/manifest.json"

# Check if builds directory exists
if [ ! -d "$BUILDS_DIR" ]; then
    echo -e "${RED}Error: builds/ directory not found${NC}"
    echo "Please run build scripts first to generate artifacts"
    exit 1
fi

# Create public/builds directory
mkdir -p "$PUBLIC_DIR"

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")

echo "Generating builds manifest for version $VERSION..."

# Initialize manifest JSON
MANIFEST_JSON=$(cat <<EOF
{
  "latestVersion": "$VERSION",
  "generatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "artifacts": []
}
EOF
)

# Function to add artifact to manifest
add_artifact() {
    local platform=$1
    local filename=$2
    local filepath="$BUILDS_DIR/$platform/$filename"

    if [ ! -f "$filepath" ]; then
        echo -e "${YELLOW}Warning: $filepath not found, skipping${NC}"
        return
    fi

    # Get file size in bytes
    filesize=$(stat -f%z "$filepath" 2>/dev/null || stat -c%s "$filepath" 2>/dev/null)

    # Get file modification time
    builddate=$(stat -f%Sm -t "%Y-%m-%dT%H:%M:%SZ" "$filepath" 2>/dev/null || stat -c%y "$filepath" 2>/dev/null | cut -d'.' -f1)

    # Generate checksum (SHA-256)
    checksum=$(shasum -a 256 "$filepath" 2>/dev/null | awk '{print $1}' || sha256sum "$filepath" 2>/dev/null | awk '{print $1}')

    # Add artifact to manifest
    artifact_json=$(cat <<EOF
    {
      "platform": "$platform",
      "version": "$VERSION",
      "filename": "$filename",
      "downloadUrl": "/builds/$platform/$filename",
      "fileSize": $filesize,
      "buildDate": "$builddate",
      "checksum": "$checksum"
    }
EOF
)

    # Insert artifact into manifest
    MANIFEST_JSON=$(echo "$MANIFEST_JSON" | jq --argjson artifact "$artifact_json" '.artifacts += [$artifact]')

    # Copy artifact to public directory
    mkdir -p "$PUBLIC_DIR/$platform"
    cp "$filepath" "$PUBLIC_DIR/$platform/"

    echo -e "${GREEN}✓${NC} Added $platform/$filename (${filesize} bytes)"
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed${NC}"
    echo "Please install jq: brew install jq"
    exit 1
fi

# Process Android artifacts
for apk in "$BUILDS_DIR/android"/*.apk; do
    if [ -f "$apk" ]; then
        filename=$(basename "$apk")
        add_artifact "android" "$filename"
    fi
done

# Process iOS artifacts
for ipa in "$BUILDS_DIR/ios"/*.ipa; do
    if [ -f "$ipa" ]; then
        filename=$(basename "$ipa")
        add_artifact "ios" "$filename"
    fi
done

# Write manifest to file
echo "$MANIFEST_JSON" | jq '.' > "$MANIFEST_FILE"

echo ""
echo -e "${GREEN}✓ Manifest generated: $MANIFEST_FILE${NC}"
echo -e "${GREEN}✓ Latest version: $VERSION${NC}"
echo ""
echo "Artifacts copied to: $PUBLIC_DIR"
