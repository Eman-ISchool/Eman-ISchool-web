/**
 * Zustand auth store with token management
 * Handles authentication state, user session, and token persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getAuth, storeAuth, clearAuth } from '@/services/storage';
import { zustandMMKVStorage } from '@/utils/mmkv-storage';
import { AuthState, User } from '@/types/models';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (accessToken: string, refreshToken: string, expiresIn: number) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// MMKV-backed persist storage for Zustand
const storage = createJSONStorage(() => zustandMMKVStorage);

// Create auth store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      biometricsEnabled: false,
      lastAuthTime: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (loading) => set({ isLoading: loading }),
      
      login: async (accessToken, refreshToken, expiresIn) => {
        set({ isLoading: true });
        
        try {
          await storeAuth({
            accessToken,
            refreshToken,
            expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
          });
          
          set({
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            lastAuthTime: new Date().toISOString(),
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await clearAuth();
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            lastAuthTime: null,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      refreshUser: async () => {
        const auth = await getAuth();
        
        if (auth) {
          set({
            user: null, // Will be set by API call
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken,
            isAuthenticated: true,
          });
        } else {
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage,
    }
  )
);

// Selector hooks for convenience
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useIsLoading = () => useAuthStore(state => state.isLoading);
