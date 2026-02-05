/**
 * EmptyState component
 * Displays empty state with optional action button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel = 'Retry',
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>📭</Text>
      </View>
      <View style={styles.content}>
        {title && <Text style={styles.title}>{title}</Text>}
        {message && <Text style={styles.message}>{message}</Text>}
        {onAction && (
          <TouchableOpacity onPress={onAction} style={styles.actionButton}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.padding.lg,
    alignItems: 'center',
    minHeight: 200,
  },
  iconContainer: {
    marginBottom: spacing.margin.sm,
  },
  icon: {
    fontSize: 48,
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
  actionButton: {
    marginTop: spacing.margin.lg,
    paddingHorizontal: spacing.padding.xl,
    paddingVertical: spacing.padding.sm,
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
  },
  actionText: {
    ...typography.textStyles.button,
    color: colors.textInverse,
    textAlign: 'center',
  },
});
