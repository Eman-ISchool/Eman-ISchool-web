/**
 * SignInScreen component
 * Main sign-in screen with email/password and Google Sign-In options
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useBiometrics } from '@/hooks/useBiometrics';
import { LoginForm } from '@/components/common';
import { Button } from '@/components/common';
import { SafeAreaWrapper } from '@/components/layout';
import { spacing, colors, typography } from '@/theme';

export const SignInScreen: React.FC = () => {
  const { t } = useTranslation();
  const { login, loginWithGoogle, isLoading, error } = useAuth();
  const { isAvailable: biometricsAvailable, isEnabled: biometricsEnabled, authenticate: biometricAuthenticate } = useBiometrics();
  
  const [showBiometricOption, setShowBiometricOption] = useState(false);

  const handleEmailLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      
      // If biometrics is available but not enabled, offer to enable
      if (biometricsAvailable && !biometricsEnabled) {
        setShowBiometricOption(true);
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Google Sign-In failed:', err);
    }
  };

  const handleBiometricLogin = async () => {
    const success = await biometricAuthenticate();
    if (success) {
      // Biometric authentication successful - user is already logged in
      // Navigate to home screen will be handled by navigation
    }
  };

  const handleEnableBiometrics = async () => {
    const success = await biometricAuthenticate();
    if (success) {
      setShowBiometricOption(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps={false}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/150x150?text=Eduverse' }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Eduverse</Text>
          </View>

          {/* Login Form */}
          <LoginForm 
            onSubmit={handleEmailLogin}
            isLoading={isLoading}
            error={error}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-In Button */}
          <Button
            title={t('auth.signInWithGoogle')}
            onPress={handleGoogleSignIn}
            variant="outline"
            fullWidth
            style={styles.googleButton}
            disabled={isLoading}
          />

          {/* Biometric Option */}
          {biometricsAvailable && !biometricsEnabled && showBiometricOption && (
            <View style={styles.biometricOptionContainer}>
              <Text style={styles.biometricOptionText}>
                {t('auth.enableBiometricsPrompt')}
              </Text>
              <Button
                title={t('auth.enableBiometrics')}
                onPress={handleEnableBiometrics}
                variant="secondary"
                size="small"
              />
            </View>
          )}

          {/* Biometric Login Button */}
          {biometricsAvailable && biometricsEnabled && (
            <Pressable 
              onPress={handleBiometricLogin}
              style={styles.biometricButton}
              testID="biometric-login-button"
            >
              <Text style={styles.biometricButtonText}>
                {t('auth.signInWithBiometrics')}
              </Text>
            </Pressable>
          )}

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>
              {t('auth.noAccount')}{' '}
              <Text style={styles.signUpLink}>{t('auth.signUp')}</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.md,
  },
  logoText: {
    ...typography.textStyles.h2,
    color: colors.textPrimary,
    fontWeight: '700' as const,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  googleButton: {
    marginBottom: spacing.md,
  },
  biometricOptionContainer: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  biometricOptionText: {
    ...typography.textStyles.body,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  biometricButton: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  biometricButtonText: {
    ...typography.textStyles.button,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  signUpContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  signUpText: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  signUpLink: {
    ...typography.textStyles.body,
    color: colors.primary,
    fontWeight: '600' as const,
  },
});

export default SignInScreen;
