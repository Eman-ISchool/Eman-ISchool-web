# VR 360-Degree Images

This directory contains 360-degree equirectangular images for VR field trip experiences.

## Directory Structure

```
360-images/
├── field-trips/
│   ├── pyramids-of-giza/     # 5 scenes
│   ├── egyptian-museum/       # 6 scenes
│   └── abu-simbel/           # 5 scenes
└── README.md
```

## Image Requirements

### Technical Specifications
- **Format:** JPG or PNG
- **Minimum Resolution:** 4096x2048 pixels (2:1 aspect ratio)
- **Recommended Resolution:** 8192x4096 pixels for higher quality
- **Projection Type:** Equirectangular (360° x 180°)
- **File Size:** Optimize to < 5MB for web performance

### Quality Guidelines
- High resolution and sharpness
- Proper stitching (no visible seams)
- Correct horizon alignment
- Natural lighting and colors
- Low noise/compression artifacts

## Current Status

**Currently using placeholder images from placehold.co service.** These need to be replaced with actual 360-degree images.

### Scenes Requiring Images

#### Pyramids of Giza (5 scenes)
1. `great-pyramid-exterior.jpg` - Exterior view of Great Pyramid
2. `great-pyramid-interior.jpg` - Inside King's Chamber
3. `great-sphinx.jpg` - View of the Great Sphinx
4. `pyramid-complex.jpg` - Overview of all three pyramids
5. `solar-barque.jpg` - Solar Barque Museum interior

#### Egyptian Museum (6 scenes)
1. `museum-entrance.jpg` - Museum entrance hall
2. `tutankhamun-gallery.jpg` - Tutankhamun treasures gallery
3. `mummies-room.jpg` - Royal mummies exhibition room
4. `jewelry-collection.jpg` - Ancient jewelry display
5. `hieroglyphics-gallery.jpg` - Hieroglyphics and writing room
6. `main-atrium.jpg` - Main atrium with colossal statues

#### Abu Simbel (5 scenes)
1. `great-temple-facade.jpg` - Exterior facade with colossal statues
2. `great-temple-interior.jpg` - Hypostyle hall with Osiris statues
3. `sanctuary.jpg` - Inner sanctuary with seated gods
4. `small-temple.jpg` - Temple of Hathor interior
5. `temples-overview.jpg` - Overview of both temples

**Total: 16 high-quality 360° images needed**

## Sourcing 360-Degree Images

### Free Resources

#### 1. **Polyhaven (polyhaven.com/hdris)**
- High-quality free HDRIs and 360° images
- CC0 License (public domain)
- Professional quality
- Limited Egyptian/historical content

#### 2. **Flickr Creative Commons**
- Search: "360 panorama Egypt" + filter by CC licenses
- URL: https://www.flickr.com/search/?text=360%20egypt&license=2%2C3%2C4%2C5%2C6%2C9
- Requires proper attribution
- Variable quality

#### 3. **Google Arts & Culture**
- Virtual tours of museums and historical sites
- High-quality panoramas
- Check licensing for each image
- URL: https://artsandculture.google.com/

#### 4. **Wikimedia Commons**
- Search: "360 panorama" or "equirectangular"
- Free licenses (CC-BY-SA, CC0, Public Domain)
- URL: https://commons.wikimedia.org/
- Requires attribution per license

#### 5. **Kuula (kuula.co)**
- Community-shared 360° photos
- Mix of free and paid
- Check individual licenses

#### 6. **360cities.net**
- Large collection of 360° panoramas
- Mix of free and premium
- Check licensing for educational use

### Paid/Professional Resources

#### 1. **iStock 360**
- Professional quality
- Various licenses available
- Search: "360 panorama Egypt"

#### 2. **Adobe Stock**
- High-quality 360° images
- Royalty-free licensing
- Filter by "360°" in search

#### 3. **TurboSquid**
- 3D environments and 360° images
- Professional quality
- Various licensing options

### Creating Custom Images

#### Option 1: Commission Photography
- Hire a photographer with 360° camera
- Full rights and control
- Most expensive option
- Highest quality and authenticity

#### Option 2: AI Generation
- Use AI tools to generate 360° images
- Tools: Skybox AI, Blockade Labs, Midjourney + panorama tools
- Quick and cost-effective
- May lack authenticity
- Example workflow:
  1. Generate panorama with AI (Midjourney, Stable Diffusion)
  2. Convert to equirectangular format
  3. Stitch and fix seams
  4. Export at 4096x2048 or higher

#### Option 3: 3D Rendering
- Use 3D software (Blender, Cinema 4D)
- Render equirectangular camera
- Full control over scene
- Requires 3D modeling expertise

## Placeholder Images

Current implementation uses dynamic placeholders from placehold.co:
```
https://placehold.co/4096x2048/[color]/[text-color]?text=[Scene+Name]
```

### Generating Static Placeholders

To replace with static placeholder images, use ImageMagick:

```bash
# Install ImageMagick (if not already installed)
brew install imagemagick  # macOS
apt-get install imagemagick  # Linux

# Generate placeholder (example)
convert -size 4096x2048 xc:#d4a574 \
  -gravity center \
  -pointsize 120 \
  -fill white \
  -annotate +0+0 "Great Pyramid Exterior\n360° Placeholder" \
  great-pyramid-exterior.jpg
```

See `scripts/generate-placeholders.sh` for automated generation.

## Attribution

### Current Attribution
All placeholder images are generated using placehold.co service and are temporary.

### Required Attribution (when using sourced images)

Create an `ATTRIBUTIONS.md` file in this directory with:

```markdown
# Image Attributions

## Pyramids of Giza

### great-pyramid-exterior.jpg
- **Source:** [Source Name]
- **Author:** [Author Name]
- **License:** [License Type]
- **URL:** [Original URL]
- **Modifications:** [If any]

[Repeat for each image]
```

### License Types
- **CC0:** No attribution required (but appreciated)
- **CC-BY:** Attribution required
- **CC-BY-SA:** Attribution + Share Alike
- **CC-BY-NC:** Attribution + Non-Commercial only

## Implementation

### Updating Image URLs

Once real images are added to this directory, update the `imageUrl` fields in:

1. `src/app/vr-eduverse/field-trips/pyramids-of-giza/page.tsx`
2. `src/app/vr-eduverse/field-trips/egyptian-museum/page.tsx`
3. `src/app/vr-eduverse/field-trips/abu-simbel/page.tsx`

Change from:
```typescript
imageUrl: 'https://placehold.co/4096x2048/d4a574/ffffff?text=Great+Pyramid+Exterior',
```

To:
```typescript
imageUrl: '/vr/360-images/field-trips/pyramids-of-giza/great-pyramid-exterior.jpg',
```

### Image Optimization

Before deploying, optimize images:

```bash
# Using ImageMagick
mogrify -strip -interlace Plane -quality 85 *.jpg

# Or using sharp (Node.js)
npm install sharp
node scripts/optimize-images.js
```

## Testing

After adding real images:

1. ✅ Check image loads correctly in VR canvas
2. ✅ Verify resolution (minimum 4096x2048)
3. ✅ Test on mobile devices
4. ✅ Check file size (< 5MB per image)
5. ✅ Verify equirectangular projection is correct
6. ✅ Test in VR headset if available
7. ✅ Confirm attribution is included

## Roadmap

- [ ] Phase 1: Replace Pyramids of Giza placeholders (5 images)
- [ ] Phase 2: Replace Egyptian Museum placeholders (6 images)
- [ ] Phase 3: Replace Abu Simbel placeholders (5 images)
- [ ] Phase 4: Add additional viewpoints/scenes as needed
- [ ] Phase 5: Upgrade to 8K resolution (8192x4096) for premium experience

## Resources

- [Three.js Documentation - Equirectangular Mapping](https://threejs.org/docs/#api/en/textures/Texture)
- [WebXR Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
- [Equirectangular Projection Explained](https://en.wikipedia.org/wiki/Equirectangular_projection)
- [360° Photography Guide](https://www.360cities.net/how-to-shoot)

## Support

For questions or issues with VR images, contact the development team or create an issue in the project repository.
