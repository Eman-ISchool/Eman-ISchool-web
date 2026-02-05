/**
 * Deep linking service
 * Handles deep linking for navigation and external app integration
 */

import React, { useEffect } from 'react';
import { Linking } from 'react-native';

export const DEEP_LINKING_CONFIG = {
  prefixes: ['eduverse://', 'https://eduverse.app'],
};

/**
 * Parse deep link URL and extract route and params
 */
export function parseDeepLinkUrl(url: string): { route: string | null; params: any } {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.replace(/^\//, '');
    
    // Simple route matching
    if (path.startsWith('/student/home')) {
      return { route: 'StudentHome', params: {} };
    }
    if (path.startsWith('/student/reels')) {
      return { route: 'StudentReels', params: {} };
    }
    if (path.startsWith('/student/reel/')) {
      const reelId = path.split('/').pop();
      return { route: 'ReelDetail', params: { reelId } };
    }
    if (path.startsWith('/student/calendar')) {
      return { route: 'StudentCalendar', params: {} };
    }
    if (path.startsWith('/student/profile')) {
      return { route: 'StudentProfile', params: {} };
    }
    
    return { route: null, params: {} };
  } catch (error) {
    console.error('Failed to parse deep link:', error);
    return { route: null, params: {} };
  }
}

/**
 * Handle deep link events
 */
export function useDeepLinking(navigation: any) {
  const handleDeepLink = ({ url }: { url: string | null }) => {
    if (!url) return;
    
    const { route, params } = parseDeepLinkUrl(url);
    
    if (route) {
      console.log('Deep link received:', { route, params });
      
      // Navigate to the appropriate screen
      (navigation as any).navigate(route as any, params);
    }
  };

  useEffect(() => {
    // Add deep link listener
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    return () => {
      // Remove deep link listener on cleanup
      subscription.remove();
    };
  }, [navigation]);

  /**
   * Get initial URL from deep linking
   */
  export const getInitialURL = async (): Promise<string | null> => {
    const initialUrl = await Linking.getInitialURL();
    return initialUrl;
  };

  /**
   * Open a URL in the external browser
   */
  export const openURL = async (url: string): Promise<void> => {
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.warn('Cannot open URL:', url);
    }
  };
}
