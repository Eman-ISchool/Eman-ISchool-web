/**
 * useAuth hook
 * Handles authentication state and operations including Google Sign-In
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import {
  isBiometricsAvailable,
  authenticateWithBiometrics as authenticateWithBiometricsService,
  enableBiometrics as enableBiometricsService
} from '@/services/biometrics';
import { getAuth } from '@/services/storage';

export interface UseAuthReturn {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  enableBiometrics: () => Promise<boolean>;
  authenticateWithBiometrics: () => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
  const { t } = useTranslation();
  const { setUser, login: storeLogin, logout: storeLogout } = useAuthStore();
  const { updateUser } = useUserStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authApi.login({ email, password });
      
      // Store auth credentials using store method
      await storeLogin(response.accessToken, response.refreshToken, response.expiresIn);
      
      // Store user data
      setUser(response.user);
      updateUser(response.user);
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || t('auth.loginError'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storeLogin, setUser, updateUser, t]);

  const loginWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Implement Google Sign-In when API is available
      // For now, this is a placeholder
      throw new Error('Google Sign-In not yet implemented');
      
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setError(err.message || t('auth.googleSignInError'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Call backend logout
      await authApi.logout();
      
      // Clear auth state using store method
      await storeLogout();
      setUser(null);
      updateUser(null as any);
      
    } catch (err: any) {
      console.error('Logout error:', err);
      // Still clear local state even if backend call fails
      await storeLogout();
      setUser(null);
      updateUser(null as any);
    } finally {
      setIsLoading(false);
    }
  }, [storeLogout, setUser, updateUser]);

  const refreshAuth = useCallback(async () => {
    try {
      const auth = await getAuth();
      
      if (!auth?.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await authApi.refreshToken({
        refreshToken: auth.refreshToken,
      });
      
      // Update auth credentials using store method
      await storeLogin(response.accessToken, response.refreshToken, response.expiresIn);
      
      // Update user data
      setUser(response.user);
      updateUser(response.user);
      
    } catch (err: any) {
      console.error('Auth refresh error:', err);
      // Clear auth if refresh fails
      await storeLogout();
      setUser(null);
      updateUser(null as any);
      throw err;
    }
  }, [storeLogin, setUser, updateUser, storeLogout]);

  const enableBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      const available = await isBiometricsAvailable();
      if (!available) {
        setError(t('auth.biometricsNotAvailable'));
        return false;
      }
      
      // First authenticate with current credentials
      const result = await authenticateWithBiometricsService(t('auth.enableBiometricsPrompt'));
      if (!result.success) {
        return false;
      }
      
      // Enable biometrics
      const enableResult = await enableBiometricsService();
      
      if (enableResult.success) {
        return true;
      } else {
        setError(enableResult.error || t('auth.biometricsEnableError'));
        return false;
      }
    } catch (err: any) {
      console.error('Enable biometrics error:', err);
      setError(err.message || t('auth.biometricsEnableError'));
      return false;
    }
  }, [t]);

  const authenticateWithBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      const available = await isBiometricsAvailable();
      if (!available) {
        setError(t('auth.biometricsNotAvailable'));
        return false;
      }
      
      const result = await authenticateWithBiometricsService(t('auth.biometricPrompt'));
      
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
    }
  }, [t]);

  return {
    user: useAuthStore(state => state.user),
    isAuthenticated: useAuthStore(state => state.isAuthenticated),
    isLoading,
    error,
    login,
    loginWithGoogle,
    logout,
    refreshAuth,
    enableBiometrics,
    authenticateWithBiometrics,
  };
}

export default useAuth;
