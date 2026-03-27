/**
 * SearchBar component
 * Search input with icon and clear button, RTL-aware
 */

import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  I18nManager,
  ViewStyle,
} from 'react-native';
import { colors, spacing, typography } from '@/theme';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  style,
}) => {
  const isRTL = I18nManager.isRTL;

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={[styles.container, isRTL && styles.containerRTL, style]}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={[styles.input, isRTL && styles.inputRTL]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        textAlign={isRTL ? 'right' : 'left'}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: spacing.borderRadius.md,
    paddingHorizontal: spacing.padding.md,
    minHeight: 44,
  },
  containerRTL: {
    flexDirection: 'row-reverse',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.textStyles.body,
    color: colors.textPrimary,
    paddingVertical: spacing.padding.sm,
    minHeight: 44,
  },
  inputRTL: {
    textAlign: 'right',
  },
  clearButton: {
    padding: spacing.padding.xs,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearIcon: {
    fontSize: 14,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.bold,
  },
});
