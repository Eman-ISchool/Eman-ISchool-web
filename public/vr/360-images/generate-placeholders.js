#!/usr/bin/env node

/**
 * Generate Placeholder 360° Images for VR Field Trips
 *
 * This script generates properly-sized placeholder images (4096x2048)
 * using Node.js Canvas API (or pure JavaScript fallback).
 *
 * Requirements:
 *   - Node.js 18+
 *   - Optional: canvas package for better quality (npm install canvas)
 *
 * Usage:
 *   node generate-placeholders.js
 */

const fs = require('fs');
const path = require('path');

// Try to load canvas library if available
let Canvas;
try {
  Canvas = require('canvas');
  console.log('✅ Using canvas library for high-quality images');
} catch (e) {
  console.log('ℹ️  Canvas library not found. Install with: npm install canvas');
  console.log('   Generating basic placeholder files instead...\n');
}

const scenes = {
  'pyramids-of-giza': [
    { id: 'great-pyramid-exterior', title: 'Great Pyramid - Exterior', titleAr: 'الهرم الأكبر - المنظر الخارجي', color: '#d4a574' },
    { id: 'great-pyramid-interior', title: "King's Chamber Interior", titleAr: 'غرفة الملك', color: '#757575' },
    { id: 'great-sphinx', title: 'The Great Sphinx', titleAr: 'أبو الهول', color: '#c9a876' },
    { id: 'pyramid-complex', title: 'Pyramid Complex Overview', titleAr: 'مجمع الأهرامات', color: '#d4a574' },
    { id: 'solar-barque', title: 'Solar Barque Museum', titleAr: 'متحف مركب الشمس', color: '#8b7355' },
  ],
  'egyptian-museum': [
    { id: 'museum-entrance', title: 'Museum Entrance Hall', titleAr: 'مدخل المتحف', color: '#f5e6d3' },
    { id: 'tutankhamun-gallery', title: 'Tutankhamun Gallery', titleAr: 'قاعة توت عنخ آمون', color: '#ffd700' },
    { id: 'mummies-room', title: 'Royal Mummies Room', titleAr: 'قاعة المومياوات الملكية', color: '#3d2817' },
    { id: 'jewelry-collection', title: 'Ancient Jewelry Collection', titleAr: 'مجموعة المجوهرات القديمة', color: '#40e0d0' },
    { id: 'hieroglyphics-gallery', title: 'Hieroglyphics Gallery', titleAr: 'قاعة الهيروغليفية', color: '#8b7355' },
    { id: 'main-atrium', title: 'Main Atrium', titleAr: 'الردهة الرئيسية', color: '#e8dcc6' },
  ],
  'abu-simbel': [
    { id: 'great-temple-facade', title: 'Great Temple Facade', titleAr: 'واجهة المعبد الكبير', color: '#d2b48c' },
    { id: 'great-temple-interior', title: 'Hypostyle Hall', titleAr: 'قاعة الأعمدة', color: '#8b7355' },
    { id: 'sanctuary', title: 'Inner Sanctuary', titleAr: 'المقدس الداخلي', color: '#4d3d2e' },
    { id: 'small-temple', title: 'Temple of Hathor', titleAr: 'معبد حتحور', color: '#c9a876' },
    { id: 'temples-overview', title: 'Temples Overview', titleAr: 'منظر المعابد', color: '#87ceeb' },
  ],
};

// Create directories
Object.keys(scenes).forEach(location => {
  const dir = path.join(__dirname, 'field-trips', location);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const thumbDir = path.join(__dirname, '..', 'thumbnails', location);
  if (!fs.existsSync(thumbDir)) {
    fs.mkdirSync(thumbDir, { recursive: true });
  }
});

// Generate images using canvas library
function generateWithCanvas(location, scene) {
  const { createCanvas } = Canvas;

  // Generate 360° image (4096x2048)
  const canvas = createCanvas(4096, 2048);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = scene.color;
  ctx.fillRect(0, 0, 4096, 2048);

  // Add gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, 0, 2048);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 4096, 2048);

  // Title (English)
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 8;
  ctx.font = 'bold 150px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText(scene.title, 2048, 824);
  ctx.fillText(scene.title, 2048, 824);

  // Title (Arabic)
  ctx.font = 'bold 100px Arial';
  ctx.lineWidth = 6;
  ctx.strokeText(scene.titleAr, 2048, 1024);
  ctx.fillText(scene.titleAr, 2048, 1024);

  // Subtitle
  ctx.font = '80px Arial';
  ctx.fillStyle = '#e0e0e0';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 4;
  ctx.strokeText('360° Placeholder Image', 2048, 1224);
  ctx.fillText('360° Placeholder Image', 2048, 1224);

  // Resolution info
  ctx.font = '60px Arial';
  ctx.fillStyle = '#c0c0c0';
  ctx.fillText('4096 × 2048 pixels', 2048, 1324);

  // Save 360° image
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.85 });
  const imagePath = path.join(__dirname, 'field-trips', location, `${scene.id}.jpg`);
  fs.writeFileSync(imagePath, buffer);
  console.log(`  ✓ ${imagePath}`);

  // Generate thumbnail (400x300)
  const thumbCanvas = createCanvas(400, 300);
  const thumbCtx = thumbCanvas.getContext('2d');

  thumbCtx.fillStyle = scene.color;
  thumbCtx.fillRect(0, 0, 400, 300);

  thumbCtx.fillStyle = 'white';
  thumbCtx.strokeStyle = 'black';
  thumbCtx.lineWidth = 3;
  thumbCtx.font = 'bold 30px Arial';
  thumbCtx.textAlign = 'center';
  thumbCtx.textBaseline = 'middle';
  thumbCtx.strokeText(scene.title, 200, 150);
  thumbCtx.fillText(scene.title, 200, 150);

  const thumbBuffer = thumbCanvas.toBuffer('image/jpeg', { quality: 0.85 });
  const thumbPath = path.join(__dirname, '..', 'thumbnails', location, `${scene.id}-thumb.jpg`);
  fs.writeFileSync(thumbPath, thumbBuffer);
  console.log(`  ✓ ${thumbPath}`);
}

// Generate basic info files (fallback when canvas is not available)
function generateInfoFile(location, scene) {
  const info = {
    id: scene.id,
    title: scene.title,
    titleAr: scene.titleAr,
    color: scene.color,
    resolution: '4096x2048',
    format: 'JPEG',
    status: 'placeholder',
    note: 'This is a placeholder. Replace with actual 360° image.',
    placeholderUrl: `https://placehold.co/4096x2048/${scene.color.replace('#', '')}/ffffff?text=${encodeURIComponent(scene.title)}`,
  };

  const infoPath = path.join(__dirname, 'field-trips', location, `${scene.id}.json`);
  fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));
  console.log(`  ℹ️  ${infoPath}`);
}

// Main execution
console.log('🎨 Generating VR 360° placeholder images...\n');

let totalImages = 0;

Object.entries(scenes).forEach(([location, locationScenes]) => {
  const icon = location === 'pyramids-of-giza' ? '📐' : location === 'egyptian-museum' ? '🏛️' : '⛰️';
  console.log(`${icon} ${location}...`);

  locationScenes.forEach(scene => {
    if (Canvas) {
      generateWithCanvas(location, scene);
    } else {
      generateInfoFile(location, scene);
    }
    totalImages++;
  });

  console.log('');
});

console.log(`✅ Done! Generated ${totalImages} placeholder image${totalImages !== 1 ? 's' : ''}\n`);

if (!Canvas) {
  console.log('💡 To generate actual image files:');
  console.log('   1. Install canvas: npm install canvas');
  console.log('   2. Run this script again: node generate-placeholders.js\n');
  console.log('📝 Info files created that can be used to reference placehold.co URLs\n');
} else {
  console.log('📁 Images location:');
  console.log('   360° images: ./field-trips/');
  console.log('   Thumbnails:  ../thumbnails/\n');
}

console.log('📝 Next steps:');
console.log('   1. Review the generated placeholder images');
console.log('   2. Replace with real 360° images when available');
console.log('   3. Update imageUrl paths in the VR experience pages');
console.log('   4. Run image optimization before production\n');
console.log('📖 See README.md for sourcing real 360° images');
