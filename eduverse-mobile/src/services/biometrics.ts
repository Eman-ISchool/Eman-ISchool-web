/**
 * Biometrics service
 * Handles biometric authentication using react-native-keychain
 */

import * as Keychain from 'react-native-keychain';

const BIOMETRICS_KEY = 'eduverse_biometric_enabled';

export interface BiometricResult {
  success: boolean;
  error?: string;
}

/**
 * Check if biometrics is available on the device
 */
export async function isBiometricsAvailable(): Promise<boolean> {
  try {
    const result = await Keychain.getSupportedBiometryType();
    return result !== null;
  } catch (error) {
    console.error('Error checking biometrics availability:', error);
    return false;
  }
}

/**
 * Check if user has enabled biometrics
 */
export async function isBiometricsEnabled(): Promise<boolean> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: BIOMETRICS_KEY,
    });
    return credentials !== false;
  } catch (error) {
    return false;
  }
}

/**
 * Enable biometrics for the user
 */
export async function enableBiometrics(): Promise<BiometricResult> {
  try {
    await Keychain.setGenericPassword(
      'enabled',
      'true',
      {
        service: BIOMETRICS_KEY,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      }
    );
    return { success: true };
  } catch (error: any) {
    console.error('Error enabling biometrics:', error);
    return {
      success: false,
      error: error.message || 'Failed to enable biometrics',
    };
  }
}

/**
 * Disable biometrics for the user
 */
export async function disableBiometrics(): Promise<BiometricResult> {
  try {
    await Keychain.resetGenericPassword({
      service: BIOMETRICS_KEY,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error disabling biometrics:', error);
    return {
      success: false,
      error: error.message || 'Failed to disable biometrics',
    };
  }
}

/**
 * Authenticate with biometrics
 */
export async function authenticateWithBiometrics(
  promptMessage: string = 'Authenticate to continue'
): Promise<BiometricResult> {
  try {
    const result = await Keychain.getGenericPassword({
      service: BIOMETRICS_KEY,
      authenticationPrompt: {
        title: 'Biometric Authentication',
        subtitle: promptMessage,
        cancel: 'Cancel',
      },
    });
    
    if (result) {
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Biometric authentication failed',
      };
    }
  } catch (error: any) {
    console.error('Error authenticating with biometrics:', error);
    
    // User cancelled biometric prompt
    if (error.name === 'UserCancel' || error.name === 'UserFallback') {
      return {
        success: false,
        error: 'Authentication cancelled',
      };
    }
    
    return {
      success: false,
      error: error.message || 'Biometric authentication failed',
    };
  }
}
