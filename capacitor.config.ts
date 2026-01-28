import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.emanISchool.app',
  appName: 'Eduverse',
  webDir: 'out',
  server: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://your-production-url.com',
    cleartext: false, // HTTPS only
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
