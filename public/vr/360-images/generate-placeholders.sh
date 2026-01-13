#!/bin/bash

# Generate Placeholder 360° Images for VR Field Trips
#
# This script generates properly-sized placeholder images (4096x2048)
# for all VR field trip scenes using ImageMagick.
#
# Requirements:
#   - ImageMagick (brew install imagemagick or apt-get install imagemagick)
#
# Usage:
#   chmod +x generate-placeholders.sh
#   ./generate-placeholders.sh

set -e

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick is not installed."
    echo "Install it with:"
    echo "  macOS: brew install imagemagick"
    echo "  Linux: apt-get install imagemagick"
    exit 1
fi

echo "🎨 Generating VR 360° placeholder images..."
echo ""

# Create directories if they don't exist
mkdir -p field-trips/pyramids-of-giza
mkdir -p field-trips/egyptian-museum
mkdir -p field-trips/abu-simbel
mkdir -p ../thumbnails/pyramids-of-giza
mkdir -p ../thumbnails/egyptian-museum
mkdir -p ../thumbnails/abu-simbel

# Function to generate placeholder image
generate_placeholder() {
    local output_path="$1"
    local color="$2"
    local text="$3"
    local subtitle="$4"

    echo "  Generating: $output_path"

    convert -size 4096x2048 "xc:$color" \
        -gravity center \
        -font Arial-Bold \
        -pointsize 150 \
        -fill white \
        -stroke black \
        -strokewidth 4 \
        -annotate +0-200 "$text" \
        -stroke none \
        -pointsize 80 \
        -fill "#e0e0e0" \
        -annotate +0+100 "$subtitle" \
        -pointsize 60 \
        -fill "#c0c0c0" \
        -annotate +0+250 "360° Placeholder Image" \
        -pointsize 50 \
        -annotate +0+350 "4096 × 2048 pixels" \
        "$output_path"
}

# Function to generate thumbnail
generate_thumbnail() {
    local output_path="$1"
    local color="$2"
    local text="$3"

    echo "  Generating thumbnail: $output_path"

    convert -size 400x300 "xc:$color" \
        -gravity center \
        -font Arial-Bold \
        -pointsize 30 \
        -fill white \
        -stroke black \
        -strokewidth 2 \
        -annotate +0+0 "$text" \
        "$output_path"
}

# ============================================================================
# PYRAMIDS OF GIZA (5 scenes)
# ============================================================================

echo "📐 Pyramids of Giza..."

generate_placeholder \
    "field-trips/pyramids-of-giza/great-pyramid-exterior.jpg" \
    "#d4a574" \
    "Great Pyramid - Exterior" \
    "الهرم الأكبر - المنظر الخارجي"

generate_thumbnail \
    "../thumbnails/pyramids-of-giza/great-pyramid-exterior-thumb.jpg" \
    "#d4a574" \
    "Great Pyramid"

generate_placeholder \
    "field-trips/pyramids-of-giza/great-pyramid-interior.jpg" \
    "#757575" \
    "King's Chamber Interior" \
    "غرفة الملك"

generate_thumbnail \
    "../thumbnails/pyramids-of-giza/great-pyramid-interior-thumb.jpg" \
    "#757575" \
    "King's Chamber"

generate_placeholder \
    "field-trips/pyramids-of-giza/great-sphinx.jpg" \
    "#c9a876" \
    "The Great Sphinx" \
    "أبو الهول"

generate_thumbnail \
    "../thumbnails/pyramids-of-giza/great-sphinx-thumb.jpg" \
    "#c9a876" \
    "Great Sphinx"

generate_placeholder \
    "field-trips/pyramids-of-giza/pyramid-complex.jpg" \
    "#d4a574" \
    "Pyramid Complex Overview" \
    "مجمع الأهرامات"

generate_thumbnail \
    "../thumbnails/pyramids-of-giza/pyramid-complex-thumb.jpg" \
    "#d4a574" \
    "Pyramid Complex"

generate_placeholder \
    "field-trips/pyramids-of-giza/solar-barque.jpg" \
    "#8b7355" \
    "Solar Barque Museum" \
    "متحف مركب الشمس"

generate_thumbnail \
    "../thumbnails/pyramids-of-giza/solar-barque-thumb.jpg" \
    "#8b7355" \
    "Solar Barque"

# ============================================================================
# EGYPTIAN MUSEUM (6 scenes)
# ============================================================================

echo "🏛️  Egyptian Museum..."

generate_placeholder \
    "field-trips/egyptian-museum/museum-entrance.jpg" \
    "#f5e6d3" \
    "Museum Entrance Hall" \
    "مدخل المتحف"

generate_thumbnail \
    "../thumbnails/egyptian-museum/museum-entrance-thumb.jpg" \
    "#f5e6d3" \
    "Museum Entrance"

generate_placeholder \
    "field-trips/egyptian-museum/tutankhamun-gallery.jpg" \
    "#ffd700" \
    "Tutankhamun Gallery" \
    "قاعة توت عنخ آمون"

generate_thumbnail \
    "../thumbnails/egyptian-museum/tutankhamun-gallery-thumb.jpg" \
    "#ffd700" \
    "Tutankhamun"

generate_placeholder \
    "field-trips/egyptian-museum/mummies-room.jpg" \
    "#3d2817" \
    "Royal Mummies Room" \
    "قاعة المومياوات الملكية"

generate_thumbnail \
    "../thumbnails/egyptian-museum/mummies-room-thumb.jpg" \
    "#3d2817" \
    "Royal Mummies"

generate_placeholder \
    "field-trips/egyptian-museum/jewelry-collection.jpg" \
    "#40e0d0" \
    "Ancient Jewelry Collection" \
    "مجموعة المجوهرات القديمة"

generate_thumbnail \
    "../thumbnails/egyptian-museum/jewelry-collection-thumb.jpg" \
    "#40e0d0" \
    "Ancient Jewelry"

generate_placeholder \
    "field-trips/egyptian-museum/hieroglyphics-gallery.jpg" \
    "#8b7355" \
    "Hieroglyphics Gallery" \
    "قاعة الهيروغليفية"

generate_thumbnail \
    "../thumbnails/egyptian-museum/hieroglyphics-gallery-thumb.jpg" \
    "#8b7355" \
    "Hieroglyphics"

generate_placeholder \
    "field-trips/egyptian-museum/main-atrium.jpg" \
    "#e8dcc6" \
    "Main Atrium" \
    "الردهة الرئيسية"

generate_thumbnail \
    "../thumbnails/egyptian-museum/main-atrium-thumb.jpg" \
    "#e8dcc6" \
    "Main Atrium"

# ============================================================================
# ABU SIMBEL (5 scenes)
# ============================================================================

echo "⛰️  Abu Simbel..."

generate_placeholder \
    "field-trips/abu-simbel/great-temple-facade.jpg" \
    "#d2b48c" \
    "Great Temple Facade" \
    "واجهة المعبد الكبير"

generate_thumbnail \
    "../thumbnails/abu-simbel/great-temple-facade-thumb.jpg" \
    "#d2b48c" \
    "Great Temple"

generate_placeholder \
    "field-trips/abu-simbel/great-temple-interior.jpg" \
    "#8b7355" \
    "Hypostyle Hall" \
    "قاعة الأعمدة"

generate_thumbnail \
    "../thumbnails/abu-simbel/great-temple-interior-thumb.jpg" \
    "#8b7355" \
    "Hypostyle Hall"

generate_placeholder \
    "field-trips/abu-simbel/sanctuary.jpg" \
    "#4d3d2e" \
    "Inner Sanctuary" \
    "المقدس الداخلي"

generate_thumbnail \
    "../thumbnails/abu-simbel/sanctuary-thumb.jpg" \
    "#4d3d2e" \
    "Sanctuary"

generate_placeholder \
    "field-trips/abu-simbel/small-temple.jpg" \
    "#c9a876" \
    "Temple of Hathor" \
    "معبد حتحور"

generate_thumbnail \
    "../thumbnails/abu-simbel/small-temple-thumb.jpg" \
    "#c9a876" \
    "Temple of Hathor"

generate_placeholder \
    "field-trips/abu-simbel/temples-overview.jpg" \
    "#87ceeb" \
    "Temples Overview" \
    "منظر المعابد"

generate_thumbnail \
    "../thumbnails/abu-simbel/temples-overview-thumb.jpg" \
    "#87ceeb" \
    "Temples Overview"

echo ""
echo "✅ Done! Generated 16 placeholder images + 16 thumbnails"
echo ""
echo "📁 Images location:"
echo "   360° images: ./field-trips/"
echo "   Thumbnails:  ../thumbnails/"
echo ""
echo "📝 Next steps:"
echo "   1. Review the generated placeholder images"
echo "   2. Replace with real 360° images when available"
echo "   3. Update imageUrl paths in the VR experience pages"
echo "   4. Run image optimization before production"
echo ""
echo "📖 See README.md for sourcing real 360° images"
