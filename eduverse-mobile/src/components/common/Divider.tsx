/**
 * Divider component
 * Simple horizontal divider line
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme';

export interface DividerProps {
  style?: ViewStyle;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

const spacingMap = {
  none: 0,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
};

export const Divider: React.FC<DividerProps> = ({
  style,
  spacing: dividerSpacing = 'sm',
}) => {
  const marginVertical = spacingMap[dividerSpacing];

  return <View style={[styles.divider, { marginVertical }, style]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    width: '100%',
  },
});
