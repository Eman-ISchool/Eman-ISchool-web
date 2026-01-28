/**
 * Platform Detection Utilities
 *
 * Detects the user's platform (Android, iOS, Desktop)
 * for the download page.
 */

export type Platform = 'android' | 'ios' | 'desktop';

/**
 * Detect the current platform from user agent
 * @returns Platform type
 */
export function detectPlatform(): Platform {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  const ua = navigator.userAgent.toLowerCase();

  // Check for Android
  if (/android/.test(ua)) {
    return 'android';
  }

  // Check for iOS (iPhone, iPad, iPod)
  if (/iphone|ipad|ipod/.test(ua)) {
    return 'ios';
  }

  // Default to desktop
  return 'desktop';
}

/**
 * Check if the current platform is Android
 * @returns true if on Android
 */
export function isAndroid(): boolean {
  return detectPlatform() === 'android';
}

/**
 * Check if the current platform is iOS
 * @returns true if on iOS
 */
export function isIOS(): boolean {
  return detectPlatform() === 'ios';
}

/**
 * Check if the current platform is desktop
 * @returns true if on desktop
 */
export function isDesktop(): boolean {
  return detectPlatform() === 'desktop';
}

/**
 * Get platform display name
 * @returns Human-readable platform name
 */
export function getPlatformName(platform: Platform): string {
  switch (platform) {
    case 'android':
      return 'Android';
    case 'ios':
      return 'iOS';
    case 'desktop':
      return 'Desktop';
    default:
      return 'Unknown';
  }
}
