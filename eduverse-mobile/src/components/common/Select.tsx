/**
 * Select component
 * Dropdown picker using a bottom modal list
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  I18nManager,
  ViewStyle,
  Pressable,
} from 'react-native';
import { colors, spacing, typography } from '@/theme';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  style?: ViewStyle;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isRTL = I18nManager.isRTL;

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
    },
    [onChange],
  );

  const renderOption = ({ item }: { item: SelectOption }) => {
    const isSelected = item.value === value;
    return (
      <TouchableOpacity
        style={[styles.option, isSelected && styles.optionSelected]}
        onPress={() => handleSelect(item.value)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.optionText,
            isRTL && styles.textRTL,
            isSelected && styles.optionTextSelected,
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, isRTL && styles.textRTL]}>{label}</Text>
      )}
      <TouchableOpacity
        style={[styles.trigger, error && styles.triggerError]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.triggerText,
            !selectedOption && styles.placeholderText,
            isRTL && styles.textRTL,
          ]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.chevron}>{isRTL ? '◂' : '▸'}</Text>
      </TouchableOpacity>
      {error && (
        <Text style={[styles.errorText, isRTL && styles.textRTL]}>
          {error}
        </Text>
      )}

      <Modal
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            {label && <Text style={styles.sheetTitle}>{label}</Text>}
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              style={styles.optionsList}
            />
          </View>
        </Pressable>
      </Modal>
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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.input.paddingHorizontal,
    paddingVertical: spacing.input.paddingVertical,
    minHeight: 48,
  },
  triggerError: {
    borderColor: colors.error,
  },
  triggerText: {
    ...typography.textStyles.body,
    color: colors.textPrimary,
    flex: 1,
  },
  placeholderText: {
    color: colors.textTertiary,
  },
  chevron: {
    fontSize: 14,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  textRTL: {
    textAlign: 'right',
  },
  errorText: {
    ...typography.textStyles.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
    paddingBottom: spacing['3xl'],
    maxHeight: '60%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.textStyles.h4,
    paddingHorizontal: spacing.padding.lg,
    marginBottom: spacing.margin.md,
  },
  optionsList: {
    paddingHorizontal: spacing.padding.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.padding.md,
    paddingHorizontal: spacing.padding.md,
    borderRadius: spacing.borderRadius.md,
    minHeight: 48,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    ...typography.textStyles.body,
    color: colors.textPrimary,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  checkmark: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
    marginLeft: spacing.sm,
  },
});
