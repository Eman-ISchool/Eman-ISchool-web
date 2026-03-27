/**
 * ListItem component
 * Generic list row with left icon/avatar, title, subtitle, right chevron
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
  ViewStyle,
} from 'react-native';
import { colors, spacing, typography } from '@/theme';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  style?: ViewStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightElement,
  onPress,
  showChevron = true,
  style,
}) => {
  const isRTL = I18nManager.isRTL;

  const content = (
    <View style={[styles.container, isRTL && styles.containerRTL, style]}>
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      <View style={styles.content}>
        <Text
          style={[styles.title, isRTL && styles.textRTL]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.subtitle, isRTL && styles.textRTL]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      {showChevron && !rightElement && (
        <Text style={styles.chevron}>{isRTL ? '◂' : '▸'}</Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.padding.md,
    paddingHorizontal: spacing.padding.lg,
    minHeight: 56,
    backgroundColor: colors.background,
  },
  containerRTL: {
    flexDirection: 'row-reverse',
  },
  leftIcon: {
    marginRight: spacing.margin.md,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.textStyles.body,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  subtitle: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  textRTL: {
    textAlign: 'right',
  },
  rightElement: {
    marginLeft: spacing.margin.sm,
  },
  chevron: {
    fontSize: 16,
    color: colors.textTertiary,
    marginLeft: spacing.margin.sm,
  },
});
