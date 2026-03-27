/**
 * Switch component
 * Toggle switch with label
 */

import React from 'react';
import {
  View,
  Text,
  Switch as RNSwitch,
  StyleSheet,
  I18nManager,
  ViewStyle,
} from 'react-native';
import { colors, spacing, typography } from '@/theme';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  label,
  disabled = false,
  style,
}) => {
  const isRTL = I18nManager.isRTL;

  return (
    <View style={[styles.container, isRTL && styles.containerRTL, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            disabled && styles.labelDisabled,
            isRTL && styles.labelRTL,
          ]}
          numberOfLines={2}
        >
          {label}
        </Text>
      )}
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: colors.gray300,
          true: colors.primaryLight,
        }}
        thumbColor={value ? colors.primary : colors.gray100}
        ios_backgroundColor={colors.gray300}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingVertical: spacing.padding.sm,
  },
  containerRTL: {
    flexDirection: 'row-reverse',
  },
  label: {
    ...typography.textStyles.body,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.margin.md,
  },
  labelRTL: {
    textAlign: 'right',
    marginRight: 0,
    marginLeft: spacing.margin.md,
  },
  labelDisabled: {
    color: colors.textTertiary,
  },
});
