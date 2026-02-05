/**
 * ErrorState component
 * Displays error message with retry button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  style?: any;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⚠️</Text>
      </View>
      <View style={styles.content}>
        {title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.message}>{message}</Text>}
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.errorLight,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.padding.lg,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.margin.sm,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    ...typography.textStyles.h3,
    marginBottom: spacing.margin.xs,
    textAlign: 'center',
  },
  message: {
    ...typography.textStyles.body,
    textAlign: 'center',
    marginBottom: spacing.margin.lg,
  },
  retryButton: {
    marginTop: spacing.margin.lg,
    paddingHorizontal: spacing.padding.xl,
    paddingVertical: spacing.padding.sm,
    backgroundColor: colors.error,
    borderRadius: spacing.borderRadius.md,
  },
  retryText: {
    ...typography.textStyles.buttonSmall,
    color: colors.textInverse,
    textAlign: 'center',
  },
  content: {
    padding: spacing.padding.md,
  },
});
