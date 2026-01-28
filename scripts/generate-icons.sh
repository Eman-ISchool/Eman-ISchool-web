#!/bin/bash

# Generate PWA icons from source icon
# Usage: ./scripts/generate-icons.sh [path/to/source/icon.png]

set -e

# Default source icon path
SOURCE_ICON="${1:-resources/icon.png}"

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "Error: Source icon not found at $SOURCE_ICON"
    echo "Please provide a 1024x1024 PNG icon as the first argument."
    echo "Usage: $0 [path/to/icon.png]"
    exit 1
fi

# Create output directory
mkdir -p public/icons

echo "Generating PWA icons from $SOURCE_ICON..."

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
    # Generate PWA icons using ImageMagick
    convert "$SOURCE_ICON" -resize 192x192 public/icons/icon-192x192.png
    convert "$SOURCE_ICON" -resize 512x512 public/icons/icon-512x512.png
    convert "$SOURCE_ICON" -resize 512x512 public/icons/icon-maskable-512x512.png
    convert "$SOURCE_ICON" -resize 180x180 public/icons/apple-touch-icon.png

    echo "✓ Generated PWA icons:"
    echo "  - public/icons/icon-192x192.png"
    echo "  - public/icons/icon-512x512.png"
    echo "  - public/icons/icon-maskable-512x512.png"
    echo "  - public/icons/apple-touch-icon.png"
elif command -v sips &> /dev/null; then
    # Fallback to macOS sips command
    sips -z 192 192 "$SOURCE_ICON" --out public/icons/icon-192x192.png
    sips -z 512 512 "$SOURCE_ICON" --out public/icons/icon-512x512.png
    sips -z 512 512 "$SOURCE_ICON" --out public/icons/icon-maskable-512x512.png
    sips -z 180 180 "$SOURCE_ICON" --out public/icons/apple-touch-icon.png

    echo "✓ Generated PWA icons using sips:"
    echo "  - public/icons/icon-192x192.png"
    echo "  - public/icons/icon-512x512.png"
    echo "  - public/icons/icon-maskable-512x512.png"
    echo "  - public/icons/apple-touch-icon.png"
else
    echo "Error: Neither ImageMagick nor sips is installed."
    echo "Please install ImageMagick: brew install imagemagick"
    echo "Or use an online tool to generate the required icon sizes:"
    echo "  - 192x192: public/icons/icon-192x192.png"
    echo "  - 512x512: public/icons/icon-512x512.png"
    echo "  - 512x512: public/icons/icon-maskable-512x512.png"
    echo "  - 180x180: public/icons/apple-touch-icon.png"
    exit 1
fi

echo "Done!"
