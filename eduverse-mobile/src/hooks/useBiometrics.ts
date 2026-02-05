/**
 * useBiometrics hook
 * Provides biometric authentication functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  isBiometricsAvailable, 
  isBiometricsEnabled, 
  enableBiometrics, 
  disableBiometrics, 
  authenticateWithBiometrics 
} from '@/services/biometrics';

export interface UseBiometricsReturn {
  isAvailable: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  enable: () => Promise<boolean>;
  disable: () => Promise<boolean>;
  authenticate: (promptMessage?: string) => Promise<boolean>;
}

export function useBiometrics(): UseBiometricsReturn {
  const { t } = useTranslation();
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check biometrics availability on mount
  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = useCallback(async () => {
    try {
      const available = await isBiometricsAvailable();
      setIsAvailable(available);
      
      if (available) {
        const enabled = await isBiometricsEnabled();
        setIsEnabled(enabled);
      }
    } catch (err: any) {
      console.error('Error checking biometrics:', err);
      setError(err.message);
    }
  }, []);

  const enable = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await enableBiometrics();
      
      if (result.success) {
        setIsEnabled(true);
        return true;
      } else {
        setError(result.error || t('auth.biometricsEnableError'));
        return false;
      }
    } catch (err: any) {
      console.error('Enable biometrics error:', err);
      setError(err.message || t('auth.biometricsEnableError'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const disable = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await disableBiometrics();
      
      if (result.success) {
        setIsEnabled(false);
        return true;
      } else {
        setError(result.error || t('auth.biometricsDisableError'));
        return false;
      }
    } catch (err: any) {
      console.error('Disable biometrics error:', err);
      setError(err.message || t('auth.biometricsDisableError'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const authenticate = useCallback(async (promptMessage?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authenticateWithBiometrics(
        promptMessage || t('auth.biometricPrompt')
      );
      
      if (result.success) {
        return true;
      } else {
        setError(result.error || t('auth.biometricFailed'));
        return false;
      }
    } catch (err: any) {
      console.error('Biometric authentication error:', err);
      setError(err.message || t('auth.biometricFailed'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  return {
    isAvailable,
    isEnabled,
    isLoading,
    error,
    enable,
    disable,
    authenticate,
  };
}

export default useBiometrics;
