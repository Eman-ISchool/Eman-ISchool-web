/**
 * Avatar component
 * User avatar with image or initials fallback
 */

import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@/theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

const AVATAR_COLORS = [
  colors.primary,
  colors.student,
  colors.teacher,
  colors.parent,
  colors.admin,
  colors.success,
  colors.warning,
  colors.info,
];

const sizeMap: Record<AvatarSize, number> = {
  sm: spacing.avatar.sm,
  md: spacing.avatar.md,
  lg: spacing.avatar.lg,
  xl: spacing.avatar.xl,
};

const fontSizeMap: Record<AvatarSize, number> = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
};

function getInitial(name?: string): string {
  if (!name || name.trim().length === 0) return '?';
  return name.trim().charAt(0).toUpperCase();
}

function getColorFromName(name?: string): string {
  if (!name) return colors.gray400;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 'md',
  style,
}) => {
  const [imageError, setImageError] = useState(false);
  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];
  const showImage = uri && !imageError;

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    backgroundColor: showImage ? colors.backgroundTertiary : getColorFromName(name),
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
      {showImage ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
          onError={() => setImageError(true)}
        />
      ) : (
        <Text style={[styles.initial, { fontSize }]}>{getInitial(name)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initial: {
    color: colors.textInverse,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
});
