/**
 * Language hook with RTL support
 * Handles language switching and RTL layout changes
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n';
import { I18nManager } from 'react-native';
import { useUserStore } from '@/store';
import { initializeLanguage } from '@/i18n';

export function useLanguage() {
  const { t } = useTranslation();
  const { settings, updateSettings } = useUserStore();
  const [currentLanguage, setCurrentLanguage] = useState(settings.language);

  const changeLanguage = async (language: string) => {
    try {
      await updateSettings({ language });
      setCurrentLanguage(language);
      await initializeLanguage(language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const toggleLanguage = async () => {
    const languages = ['en', 'ar', 'fr'];
    const currentIndex = languages.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    await changeLanguage(languages[nextIndex]);
  };

  return {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
    t,
    isRTL: I18nManager.isRTL,
  } as any;
}
