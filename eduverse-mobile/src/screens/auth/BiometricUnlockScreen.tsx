/**
 * BiometricUnlockScreen component
 * Screen for biometric authentication
 */

import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBiometrics } from '@/hooks/useBiometrics';
import { SafeAreaWrapper } from '@/components/layout';
import { spacing, colors, typography } from '@/theme';

export const BiometricUnlockScreen: React.FC = () => {
  const { t } = useTranslation();
  const { isAvailable, authenticate, error } = useBiometrics();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    const success = await authenticate(t('auth.biometricPrompt'));
    setIsLoading(false);
    
    if (success) {
      // Biometric authentication successful
      // Navigate to home screen will be handled by navigation
    }
  };

  if (!isAvailable) {
    return (
      <SafeAreaWrapper>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>{t('auth.biometricsNotAvailable')}</Text>
            <Text style={styles.message}>{t('auth.biometricsNotSupportedMessage')}</Text>
          </View>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Biometric Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🔐</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('auth.biometricUnlock')}</Text>

          {/* Message */}
          <Text style={styles.message}>{t('auth.biometricUnlockMessage')}</Text>

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Biometric Button */}
          <Pressable
            onPress={handleBiometricAuth}
            style={styles.biometricButton}
            disabled={isLoading}
            testID="biometric-unlock-button"
          >
            <Text style={styles.biometricButtonText}>
              {isLoading ? t('auth.authenticating') : t('auth.authenticate')}
            </Text>
          </Pressable>

          {/* Fallback Link */}
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>{t('auth.biometricFallback')}</Text>
            <Text style={styles.fallbackLink}>{t('auth.usePassword')}</Text>
          </View>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconText: {
    fontSize: 64,
    textAlign: 'center',
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xl,
  },
  errorText: {
    ...typography.textStyles.body,
    color: colors.error,
    textAlign: 'center',
  },
  biometricButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.xl,
    minWidth: 200,
  },
  biometricButtonText: {
    ...typography.textStyles.button,
    color: colors.textInverse,
    fontWeight: '600' as const,
  },
  fallbackContainer: {
    marginTop: spacing.lg,
  },
  fallbackText: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  fallbackLink: {
    ...typography.textStyles.link,
    color: colors.primary,
    fontWeight: '600' as const,
  },
});

export default BiometricUnlockScreen;
