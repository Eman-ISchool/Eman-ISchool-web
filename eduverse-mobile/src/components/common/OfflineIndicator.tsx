/**
 * OfflineIndicator component
 * Displays offline status indicator
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

export interface OfflineIndicatorProps {
  isOnline?: boolean;
  style?: any;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.indicatorContainer}>
        <Text style={[styles.indicator, isOnline && styles.indicatorOnline]}>
          {isOnline ? '🟢' : '🔴'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.warningLight,
    padding: spacing.padding.md,
    borderRadius: spacing.borderRadius.lg,
  },
  indicatorContainer: {
    marginBottom: spacing.margin.xs,
  },
  indicator: {
    fontSize: 24,
  },
  indicatorOnline: {
    backgroundColor: colors.success,
  },
});
