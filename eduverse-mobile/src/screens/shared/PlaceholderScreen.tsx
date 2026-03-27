/**
 * PlaceholderScreen - Reusable placeholder for screens not yet implemented
 * Shows a centered title and "Coming Soon" message
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

interface PlaceholderScreenProps {
  title: string;
  subtitle?: string;
}

export function PlaceholderScreen({ title, subtitle }: PlaceholderScreenProps) {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>{title.charAt(0)}</Text>
          </View>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle || 'Coming soon'}</Text>
      </View>
    </SafeAreaView>
  );
}

/**
 * Factory to create named placeholder screen components.
 * Each screen is a proper React component with a displayName.
 */
export function createPlaceholderScreen(title: string, subtitle?: string) {
  const Screen: React.FC = () => <PlaceholderScreen title={title} subtitle={subtitle} />;
  Screen.displayName = `${title.replace(/\s/g, '')}Screen`;
  return Screen;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default PlaceholderScreen;
