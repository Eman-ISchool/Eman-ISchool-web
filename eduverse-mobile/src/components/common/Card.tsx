/**
 * Common Card component
 * Reusable card with shadow and rounded corners
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { colors, spacing } from '@/theme';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: keyof typeof spacing.padding;
  shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padding = 'md',
  shadow = true,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadow && styles.cardShadow,
        padding && { paddingVertical: spacing.padding[padding] },
        pressed && styles.cardPressed,
        style,
      ]}
    >
      <View style={styles.cardContent}>{children}</View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
  },
  cardShadow: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardContent: {
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
  },
});
