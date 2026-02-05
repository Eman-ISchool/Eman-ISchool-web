/**
 * Zustand user store for profile and preferences
 * Handles user profile, language preference, and notification settings
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getSettings, storeSettings } from '@/services/storage';
import { AppSettings, User } from '@/types/models';

interface UserStore {
  user: User | null;
  settings: {
    language: 'en' | 'ar' | 'fr';
    biometricsEnabled: boolean;
    notificationsEnabled: boolean;
    autoPlayVideos: boolean;
    videoQuality: 'auto' | 'high' | 'medium' | 'low';
    pushToken: string | null;
  };
  updateUser: (user: User) => void;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

// Create persist storage for Zustand
const storage = createJSONStorage(() => ({
  getItem: (name) => {
    // For now, use a simple storage approach
    // In production, this would use AsyncStorage
    return Promise.resolve(null);
  },
  setItem: (name, value) => {
    // For now, use a simple storage approach
    // In production, this would use AsyncStorage
    return Promise.resolve();
  },
  removeItem: (name) => {
    // For now, use a simple storage approach
    // In production, this would use AsyncStorage
    return Promise.resolve();
  },
}));

// Create user store
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      settings: {
        language: 'en',
        biometricsEnabled: false,
        notificationsEnabled: true,
        autoPlayVideos: false,
        videoQuality: 'auto',
        pushToken: null,
      },

      updateUser: (user) => set({ user }),

      updateSettings: async (settings) => {
        const currentSettings = get().settings;
        const newSettings = { ...currentSettings, ...settings };
        
        try {
          await storeSettings(newSettings);
          set({ settings: newSettings });
        } catch (error) {
          console.error('Failed to update settings:', error);
        }
      },
    }),
    {
      name: 'user-storage',
      storage,
    }
  )
);

// Selector hooks for convenience
export const useUserProfile = () => useUserStore(state => state.user);
export const useUserSettings = () => useUserStore(state => state.settings);
export const useUserLanguage = () => useUserStore(state => state.settings.language);
export const useUserBiometricsEnabled = () => useUserStore(state => state.settings.biometricsEnabled);
export const useUserNotificationsEnabled = () => useUserStore(state => state.settings.notificationsEnabled);
