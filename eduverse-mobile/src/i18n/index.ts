/**
 * i18n configuration with react-i18next
 * Multi-language support with Arabic (RTL), English, and French
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import { I18nManager } from 'react-native';
import { useUserSettings, useUserStore } from '@/store';

// Import translation files
import en from './en.json';
import ar from './ar.json';
import fr from './fr.json';

// Language resources
const resources = {
  en: { translation: en },
  ar: { translation: ar },
  fr: { translation: fr },
};

// Initialize i18next
i18n.use(initReactI18next({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  compatibilityJSON: 'v3',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
}));

// Initialize RTL for Arabic
export const initializeLanguage = async (language: string): Promise<void> => {
  const isRTL = language === 'ar';
  
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    
    // Restart the app to apply RTL changes
    // Note: In production, this would trigger a restart
    // For now, we'll just set the direction
  }
  
  // Change language
  await i18n.changeLanguage(language);
};

// Get available device languages
export const getAvailableLanguages = () => {
  const locales = getLocales() as any;
  return locales.filter((locale: any) => ['en', 'ar', 'fr'].includes(locale));
};

// Get current language direction
export const getLanguageDirection = () => {
  return I18nManager.isRTL ? 'rtl' : 'ltr';
};

// Hook to use i18n
export const useTranslation = () => {
  const { t, i18n } = i18n;
  return { t, i18n };
};
