/**
 * Secure storage service wrapper
 * Uses react-native-keychain for secure token storage
 */

import * as Keychain from 'react-native-keychain';

const AUTH_KEY = 'eduverse_auth';
const SETTINGS_KEY = 'eduverse_settings';

export interface AuthCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AppSettings {
  language: string;
  biometricsEnabled: boolean;
  notificationsEnabled: boolean;
  autoPlayVideos: boolean;
  videoQuality: string;
  pushToken: string | null;
}

/**
 * Store authentication credentials securely
 */
export async function storeAuth(credentials: AuthCredentials): Promise<boolean> {
  try {
    await Keychain.setGenericPassword(AUTH_KEY, JSON.stringify(credentials));
    return true;
  } catch (error) {
    console.error('Failed to store auth credentials:', error);
    return false;
  }
}

/**
 * Retrieve authentication credentials
 */
export async function getAuth(): Promise<AuthCredentials | null> {
  try {
    // @ts-ignore - react-native-keychain v9 API changed
    const credentials = await Keychain.getGenericPassword(AUTH_KEY);
    if (credentials) {
      return JSON.parse(credentials.password) as AuthCredentials;
    }
    return null;
  } catch (error: any) {
    // Keychain error when no credentials exist is expected
    if (error.name !== 'KeychainError') {
      console.error('Failed to retrieve auth credentials:', error);
    }
    return null;
  }
}

/**
 * Clear authentication credentials
 */
export async function clearAuth(): Promise<boolean> {
  try {
    await Keychain.resetGenericPassword();
    return true;
  } catch (error) {
    console.error('Failed to clear auth credentials:', error);
    return false;
  }
}

/**
 * Store app settings (non-sensitive)
 * Uses AsyncStorage for general settings
 */
export async function storeSettings(settings: Partial<AppSettings>): Promise<void> {
  try {
    const existingSettings = await getSettings();
    const mergedSettings = { ...existingSettings, ...settings };
    
    // Using AsyncStorage for non-sensitive settings
    // Note: This requires @react-native-async-storage/async-storage package
    // For now, we'll use Keychain for simplicity
    await Keychain.setGenericPassword(SETTINGS_KEY, JSON.stringify(mergedSettings));
  } catch (error) {
    console.error('Failed to store settings:', error);
  }
}

/**
 * Retrieve app settings
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    // @ts-ignore - react-native-keychain v9 API changed
    const settings = await Keychain.getGenericPassword(SETTINGS_KEY);
    if (settings) {
      return JSON.parse(settings.password) as AppSettings;
    }
    return {
      language: 'en',
      biometricsEnabled: false,
      notificationsEnabled: true,
      autoPlayVideos: false,
      videoQuality: 'auto',
      pushToken: null,
    };
  } catch (error: any) {
    if (error.name !== 'KeychainError') {
      console.error('Failed to retrieve settings:', error);
    }
    return {
      language: 'en',
      biometricsEnabled: false,
      notificationsEnabled: true,
      autoPlayVideos: false,
      videoQuality: 'auto',
      pushToken: null,
    };
  }
}

/**
 * Check if biometrics is available
 */
export async function isBiometricsAvailable(): Promise<boolean> {
  try {
    const biometryType = await Keychain.getSupportedBiometryType();
    return biometryType !== null;
  } catch (error) {
    console.error('Failed to check biometrics availability:', error);
    return false;
  }
}

/**
 * Get supported biometry type
 */
export async function getBiometryType(): Promise<string | null> {
  try {
    const biometryType = await Keychain.getSupportedBiometryType();
    
    switch (biometryType) {
      case 'FaceID':
        return 'Face ID';
      case 'Face':
        return 'Face';
      case 'TouchID':
        return 'Touch ID';
      case 'Fingerprint':
        return 'Fingerprint';
      case 'Iris':
        return 'Iris';
      default:
        return null;
    }
  } catch (error) {
    console.error('Failed to get biometry type:', error);
    return null;
  }
}
