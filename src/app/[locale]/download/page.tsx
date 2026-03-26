'use client';

import { useEffect, useState } from 'react';
import { PlatformCard } from '@/components/download/PlatformCard';
import { detectPlatform, type Platform } from '@/lib/platform-detect';
import { BuildArtifact } from '@/types/builds';

// Default build data (will be replaced with actual manifest data)
const defaultArtifacts: BuildArtifact[] = [
  {
    platform: 'android',
    version: '0.1.0',
    filename: 'eduverse-0.1.0.apk',
    downloadUrl: '/builds/android/eduverse-0.1.0.apk',
    fileSize: 0, // Will be updated when build is available
    buildDate: new Date().toISOString(),
  },
  {
    platform: 'ios',
    version: '0.1.0',
    filename: 'eduverse-0.1.0.ipa',
    downloadUrl: '/builds/ios/eduverse-0.1.0.ipa',
    fileSize: 0, // Will be updated when build is available
    buildDate: new Date().toISOString(),
  },
];

export default function DownloadPage() {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('desktop');
  const [artifacts, setArtifacts] = useState<BuildArtifact[]>(defaultArtifacts);
  const [loading, setLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detect platform on mount
    setCurrentPlatform(detectPlatform());

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Try to load builds manifest
    fetch('/builds/manifest.json')
      .then(res => res.json())
      .then(data => {
        if (data.artifacts && Array.isArray(data.artifacts)) {
          setArtifacts(data.artifacts);
        }
      })
      .catch(err => {
        console.error('Failed to load builds manifest:', err);
        // Use default artifacts
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
  };

  const getArtifact = (platform: 'android' | 'ios'): BuildArtifact | undefined => {
    return artifacts.find(a => a.platform === platform);
  };

  const androidArtifact = getArtifact('android');
  const iosArtifact = getArtifact('ios');

  const androidInstructions = [
    'Download the APK file',
    'Enable "Install from unknown sources" in Settings > Security',
    'Open the downloaded file and tap "Install"',
    'Once installed, open Eduverse from your app drawer',
  ];

  const iosInstructions = [
    'Ensure your device UDID is registered with us',
    'Download the IPA file',
    'Connect your device to a Mac with Apple Configurator',
    'Drag the IPA onto your device in Apple Configurator',
    'Trust the developer certificate in Settings > General > Device Management',
  ];

  const pwaInstructions = [
    'Visit this page in Chrome (Android) or Safari (iOS)',
    'Tap "Add to Home Screen" when prompted',
    'Or tap the menu (⋮) and select "Install app"',
    'The app will be added to your home screen',
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Download Eduverse</h1>
          <p className="text-lg text-gray-600">
            Get the Eduverse app on your mobile device or install as a PWA
          </p>
        </div>
      </div>

      {/* Platform indicator */}
      {currentPlatform !== 'desktop' && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-4 py-3">
            <p className="text-sm text-blue-800">
              Detected: <strong>{currentPlatform === 'android' ? 'Android' : 'iOS'}</strong> device
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Android Card */}
          <PlatformCard
            platform="android"
            version={androidArtifact?.version || '0.1.0'}
            downloadUrl={androidArtifact?.downloadUrl}
            fileSize={androidArtifact?.fileSize}
            instructions={androidInstructions}
            isRecommended={currentPlatform === 'android'}
          />

          {/* iOS Card */}
          <PlatformCard
            platform="ios"
            version={iosArtifact?.version || '0.1.0'}
            downloadUrl={iosArtifact?.downloadUrl}
            fileSize={iosArtifact?.fileSize}
            instructions={iosInstructions}
            isRecommended={currentPlatform === 'ios'}
          />

          {/* PWA Card */}
          <PlatformCard
            platform="pwa"
            version="0.1.0"
            downloadUrl="/"
            instructions={pwaInstructions}
            isRecommended={currentPlatform === 'desktop'}
            onInstall={deferredPrompt ? handleInstallClick : undefined}
          />
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-white rounded-lg p-6 border">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About Eduverse</h2>
          <p className="text-gray-700 mb-4">
            Eduverse is an educational platform that provides immersive learning experiences
            through interactive 3D content, video lessons, and collaborative features.
          </p>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Interactive 3D learning environments</li>
            <li>Video lessons and tutorials</li>
            <li>Collaborative study tools</li>
            <li>Offline access with PWA</li>
            <li>Regular content updates</li>
          </ul>
        </div>

        {/* Support Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need help? Contact our{' '}
            <a href="/support" className="text-blue-600 hover:text-blue-800 underline">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
