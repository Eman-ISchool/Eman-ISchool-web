/**
 * FormField component
 * Form field wrapper with label, input, error message, required indicator
 */

import React from 'react';
import { View, Text, StyleSheet, I18nManager, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  children,
  style,
}) => {
  const isRTL = I18nManager.isRTL;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={[styles.labelRow, isRTL && styles.labelRowRTL]}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}
      {children}
      {error && (
        <Text style={[styles.errorText, isRTL && styles.textRTL]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.margin.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  labelRowRTL: {
    flexDirection: 'row-reverse',
  },
  label: {
    ...typography.textStyles.label,
    color: colors.textPrimary,
    textTransform: 'none',
  },
  required: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginLeft: spacing.xs,
  },
  textRTL: {
    textAlign: 'right',
  },
  errorText: {
    ...typography.textStyles.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
