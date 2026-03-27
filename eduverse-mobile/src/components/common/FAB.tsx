/**
 * FAB (Floating Action Button) component
 * Floating action button with icon
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  I18nManager,
} from 'react-native';
import { colors, spacing } from '@/theme';

export interface FABProps {
  icon: string;
  onPress: () => void;
  style?: ViewStyle;
  size?: 'md' | 'lg';
  color?: string;
}

export const FAB: React.FC<FABProps> = ({
  icon,
  onPress,
  style,
  size = 'lg',
  color = colors.primary,
}) => {
  const isRTL = I18nManager.isRTL;
  const dimension = size === 'lg' ? 56 : 48;
  const iconSize = size === 'lg' ? 24 : 20;

  const buttonStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    backgroundColor: color,
    [isRTL ? 'left' : 'right']: spacing.screen.horizontal,
  };

  return (
    <TouchableOpacity
      style={[styles.fab, buttonStyle, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.icon, { fontSize: iconSize }]}>{icon}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  icon: {
    color: colors.textInverse,
    textAlign: 'center',
  },
});
