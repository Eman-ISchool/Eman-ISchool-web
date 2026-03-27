/**
 * Badge component
 * Status badge with color variants
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography } from '@/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: colors.successLight, text: colors.success },
  warning: { bg: colors.warningLight, text: colors.warning },
  error: { bg: colors.errorLight, text: colors.error },
  info: { bg: colors.infoLight, text: colors.info },
  neutral: { bg: colors.backgroundTertiary, text: colors.textSecondary },
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
}) => {
  const { bg, text } = variantColors[variant];
  const isSmall = size === 'sm';

  const containerStyle: ViewStyle = {
    backgroundColor: bg,
    paddingHorizontal: isSmall ? spacing.padding.sm : spacing.padding.md,
    paddingVertical: isSmall ? 2 : spacing.padding.xs,
    borderRadius: spacing.borderRadius.full,
  };

  const textStyle: TextStyle = {
    color: text,
    fontSize: isSmall ? typography.fontSize.xs : typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
      <Text style={[styles.label, textStyle]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
