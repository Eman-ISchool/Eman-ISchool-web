# eduverse Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-19

## Active Technologies
- TypeScript 5.x with Next.js 14.2.35 + React 18.3.1, Supabase JS 2.78.0, NextAuth 4.24.13, RunwayML API, Zustand 5.0.9, TailwindCSS 4, next-intl 4.7.0 (024-ai-video-reels-pipeline)
- Supabase (PostgreSQL) + Supabase Storage for video files (024-ai-video-reels-pipeline)
- TypeScript 5.x, Next.js 14.2.35, Capacitor 6.x + @capacitor/core, @capacitor/cli, @capacitor/android, @capacitor/ios, @capacitor/splash-screen, @capacitor/status-bar, @capacitor/network, @capacitor/camera, @capacitor/filesystem (025-capacitor-mobile-wrapper)
- N/A (remote hosted - no local storage changes) (025-capacitor-mobile-wrapper)
- TypeScript 5.x with Next.js 14.2.35, React 18.3.1 + Capacitor 8.x (existing), next-pwa or Workbox for service worker, existing Supabase/NextAuth stack (026-mobile-build-packages)
- N/A (builds are file artifacts; no database changes required) (026-mobile-build-packages)
- TypeScript 5.x with React Native 0.76+ (New Architecture) + React Navigation 7.x, React Native Video, React Native Firebase, Zustand 5.x, react-i18next, react-native-keychain (027-react-native-port)
- AsyncStorage for preferences, Keychain/Encrypted SharedPreferences for tokens, existing Supabase PostgreSQL (via API) (027-react-native-port)
- TypeScript 5.x with Next.js 14.2.35, React 18.3.1 + NextAuth 4.24.13, Supabase JS 2.78.0, Zustand 5.0.9, TailwindCSS 4, next-intl 4.7.0, Capacitor 8.x (028-production-readiness-audit)
- Supabase (PostgreSQL) + Supabase Storage for media files (028-production-readiness-audit)

- TypeScript 5.x with Next.js 14.2.35 + React 18.3.1, Supabase JS, googleapis 169.0.0, NextAuth 4.24.13, Zustand 5.0.9 (023-multi-session-meet-fix)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x with Next.js 14.2.35: Follow standard conventions

## Recent Changes
- 028-production-readiness-audit: Added TypeScript 5.x with Next.js 14.2.35, React 18.3.1 + NextAuth 4.24.13, Supabase JS 2.78.0, Zustand 5.0.9, TailwindCSS 4, next-intl 4.7.0, Capacitor 8.x
- 027-react-native-port: Added TypeScript 5.x with React Native 0.76+ (New Architecture) + React Navigation 7.x, React Native Video, React Native Firebase, Zustand 5.x, react-i18next, react-native-keychain
- 026-mobile-build-packages: Added TypeScript 5.x with Next.js 14.2.35, React 18.3.1 + Capacitor 8.x (existing), next-pwa or Workbox for service worker, existing Supabase/NextAuth stack


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
