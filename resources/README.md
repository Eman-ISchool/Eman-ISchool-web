# App Resources

This directory contains source images for app icons and splash screens.

## Required Files

### App Icon
- `icon.png` - 1024x1024 source icon image
  - Will be used to generate all platform-specific icon sizes
  - Should be a PNG with transparent background (recommended)

### Splash Screen
- `splash.png` - 2732x2732 source splash screen image
  - Will be used to generate all platform-specific splash screen sizes
  - Should include your logo/branding centered on a solid background

## Generation

Once you have the source images, run:

```bash
# Generate icons and splash screens for both platforms
npx @capacitor/assets generate
```

This will create:
- `resources/android/` - Android-specific assets
- `resources/ios/` - iOS-specific assets

Then sync with platforms:

```bash
npx cap sync
```

## Note

For now, this directory contains placeholder structure. Add your actual icon.png and splash.png files before generating assets.
