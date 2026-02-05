# Eduverse Mobile Build Guide

This guide provides instructions for building Android and iOS mobile versions of the Eduverse application using Capacitor.

## Prerequisites

### Android Build Requirements
- Java Development Kit (JDK) 11 or higher
- Android SDK (API level 33+)
- Android Studio (recommended for setup)
- Gradle (included with Android project)

### iOS Build Requirements
- macOS operating system
- Xcode 15.0 or higher
- CocoaPods
- Apple Developer Account (for distribution)

### General Requirements
- Node.js 18+ and npm/yarn
- Capacitor CLI

## Quick Start

### Build Both Platforms (Android + iOS)

```bash
npm run build:mobile
```

This command will:
1. Build the Next.js static export
2. Sync Capacitor with Android and iOS
3. Build Android APK
4. Build iOS IPA (on macOS only)

### Build Android Only

```bash
npm run build:mobile:android
```

### Build iOS Only

```bash
npm run build:mobile:ios
```

## Manual Build Steps

### 1. Build Next.js Static Export

First, build the web application as static files:

```bash
# Temporarily enable static export
sed -i.bak "s|// output: 'export'|output: 'export'|" next.config.mjs

# Build the application
npm run build

# Restore original config
mv next.config.mjs.bak next.config.mjs
```

### 2. Sync Capacitor

Sync the web assets with native platforms:

```bash
# Sync Android
npx cap sync android

# Sync iOS
npx cap sync ios
```

### 3. Build Android APK

```bash
cd android
./gradlew assembleRelease
cd ..

# The APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

### 4. Build iOS IPA

```bash
# Archive the project
xcodebuild archive \
    -project ios/App/App.xcodeproj \
    -scheme App \
    -configuration Release \
    -archivePath ios/build/Eduverse.xcarchive \
    -allowProvisioningUpdates

# Export IPA
xcodebuild -exportArchive \
    -archivePath ios/build/Eduverse.xcarchive \
    -exportPath ios/build/ipa \
    -exportOptionsPlist ios/ExportOptions.plist

# The IPA will be at: ios/build/ipa/App.ipa
```

## Signed Builds

### Android Signed Release

To create a signed Android APK, set the following environment variables:

```bash
export EDUVERSE_RELEASE_STORE_FILE=/path/to/your/keystore.jks
export EDUVERSE_RELEASE_STORE_PASSWORD=your-keystore-password
export EDUVERSE_RELEASE_KEY_ALIAS=your-key-alias
export EDUVERSE_RELEASE_KEY_PASSWORD=your-key-password
```

Then run the build command:

```bash
npm run build:mobile:android
```

### iOS Signed Release

1. Open `ios/ExportOptions.plist` and update with your Team ID:

```xml
<key>teamID</key>
<string>YOUR_TEAM_ID</string>
```

2. Set the environment variable:

```bash
export EDUVERSE_IOS_TEAM_ID=YOUR_TEAM_ID
```

3. Run the build command:

```bash
npm run build:mobile:ios
```

## Build Artifacts

After a successful build, you'll find the following files:

### Android
- **Location**: `builds/android/eduverse-{version}.apk`
- **Version Info**: `builds/android/latest.txt`

### iOS
- **Location**: `builds/ios/eduverse-{version}.ipa`
- **Version Info**: `builds/ios/latest.txt`

## Installation

### Android Installation

1. Transfer the APK file to your Android device
2. Enable "Install from unknown sources" in Settings > Security
3. Open the APK file and tap "Install"

### iOS Installation

1. Connect your iOS device to a Mac
2. Open Apple Configurator (available from Mac App Store)
3. Drag the IPA file onto your device in Apple Configurator
4. On your device, go to Settings > General > Device Management
5. Trust the developer certificate

## Development Builds

For development builds with hot reloading:

### Android Development

```bash
# Start the web dev server
npm run dev

# In another terminal, sync and open Android Studio
npx cap sync android
npx cap open android
```

### iOS Development

```bash
# Start the web dev server
npm run dev

# In another terminal, sync and open Xcode
npx cap sync ios
npx cap open ios
```

## Troubleshooting

### Android Build Issues

**Problem**: Gradle build fails
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleRelease
```

**Problem**: Capacitor sync fails
```bash
# Remove and re-add platform
npx cap rm android
npx cap add android
npx cap sync android
```

### iOS Build Issues

**Problem**: CocoaPods dependency issues
```bash
cd ios/App
pod deintegrate
pod install
```

**Problem**: Code signing errors
- Ensure your Apple Developer account is active
- Check that provisioning profiles are installed
- Verify Bundle Identifier in `ios/App/Info.plist`

**Problem**: Archive fails
```bash
# Clean build folder
rm -rf ios/build
xcodebuild clean -project ios/App/App.xcodeproj -scheme App
```

## Platform-Specific Scripts

### Individual Build Scripts

The project includes individual build scripts for each platform:

- **Android**: `scripts/build-android-release.sh`
- **iOS**: `scripts/build-ios-adhoc.sh`

These can be used independently if needed:

```bash
./scripts/build-android-release.sh
./scripts/build-ios-adhoc.sh
```

## Configuration

### Capacitor Configuration

Edit `capacitor.config.ts` to modify app settings:

```typescript
{
  appId: 'com.emanISchool.app',
  appName: 'Eduverse',
  webDir: 'out',
  server: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://your-production-url.com',
    cleartext: false,
  },
  // ... other settings
}
```

### Android Configuration

Edit `android/app/build.gradle` for Android-specific settings:

```gradle
android {
    defaultConfig {
        applicationId "com.emanISchool.app"
        minSdkVersion 33
        targetSdkVersion 34
        versionCode 1
        versionName "0.1.0"
    }
}
```

### iOS Configuration

Edit `ios/App/Info.plist` for iOS-specific settings:

```xml
<key>CFBundleIdentifier</key>
<string>com.emanISchool.app</string>
<key>CFBundleVersion</key>
<string>1</string>
<key>CFBundleShortVersionString</key>
<string>0.1.0</string>
```

## Version Management

The build scripts automatically extract the version from `package.json`. To update the app version:

```bash
# Update version in package.json
npm version patch  # or minor, major

# The build scripts will use the new version automatically
```

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Documentation](https://developer.android.com/studio)
- [Xcode Documentation](https://developer.apple.com/xcode/)
- [Apple Configurator Guide](https://support.apple.com/guide/apple-configurator/welcome/mac)
