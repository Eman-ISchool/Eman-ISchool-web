/**
 * Common Input component
 * Text input with validation and error states
 */

import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle, TextInputProps, Text } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  touched = false,
  containerStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          touched && styles.inputTouched,
        ]}
        placeholderTextColor={colors.textTertiary}
        placeholder={label}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.margin.sm,
  },
  label: {
    ...typography.textStyles.label,
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  input: {
    ...typography.textStyles.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.input.paddingHorizontal,
    paddingVertical: spacing.input.paddingVertical,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputTouched: {
    borderColor: colors.primary,
  },
  errorText: {
    ...typography.textStyles.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
