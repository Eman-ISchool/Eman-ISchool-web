/**
 * TextArea component
 * Multi-line text input with label and error support
 */

import React from 'react';
import { View, Text, TextInput, StyleSheet, I18nManager, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export interface TextAreaProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  maxLength?: number;
  numberOfLines?: number;
  style?: ViewStyle;
  editable?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  maxLength,
  numberOfLines = 4,
  style,
  editable = true,
}) => {
  const isRTL = I18nManager.isRTL;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, isRTL && styles.textRTL]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          { minHeight: Math.max(80, numberOfLines * 22) },
          error && styles.inputError,
          isRTL && styles.inputRTL,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        textAlignVertical="top"
        textAlign={isRTL ? 'right' : 'left'}
        editable={editable}
      />
      <View style={[styles.footer, isRTL && styles.footerRTL]}>
        {error ? (
          <Text style={[styles.errorText, isRTL && styles.textRTL]}>{error}</Text>
        ) : (
          <View />
        )}
        {maxLength !== undefined && (
          <Text style={styles.charCount}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.margin.sm },
  label: { ...typography.textStyles.label, color: colors.textPrimary, marginBottom: spacing.xs },
  input: {
    ...typography.textStyles.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.input.paddingHorizontal,
    paddingVertical: spacing.input.paddingVertical,
  },
  inputError: { borderColor: colors.error },
  inputRTL: { textAlign: 'right' },
  textRTL: { textAlign: 'right' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  footerRTL: { flexDirection: 'row-reverse' },
  errorText: { ...typography.textStyles.bodySmall, color: colors.error, flex: 1 },
  charCount: { ...typography.textStyles.caption, color: colors.textTertiary },
});
