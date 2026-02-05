/**
 * App component
 * Main entry point with providers and navigation
 */

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '@/navigation/RootNavigator';
import { useTranslation } from '@/i18n';
import { OfflineIndicator } from '@/components/common';

export default function App() {
  const { i18n } = useTranslation();
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <RootNavigator />
            <OfflineIndicator />
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
