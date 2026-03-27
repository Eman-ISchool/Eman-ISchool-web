/**
 * PhoneInput component
 * Phone number input with country code selector
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  I18nManager,
  ViewStyle,
  Pressable,
} from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface CountryCode {
  code: string;
  dial: string;
  name: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: 'SA', dial: '+966', name: 'Saudi Arabia' },
  { code: 'AE', dial: '+971', name: 'UAE' },
  { code: 'KW', dial: '+965', name: 'Kuwait' },
  { code: 'BH', dial: '+973', name: 'Bahrain' },
  { code: 'QA', dial: '+974', name: 'Qatar' },
  { code: 'OM', dial: '+968', name: 'Oman' },
  { code: 'EG', dial: '+20', name: 'Egypt' },
  { code: 'JO', dial: '+962', name: 'Jordan' },
  { code: 'LB', dial: '+961', name: 'Lebanon' },
  { code: 'IQ', dial: '+964', name: 'Iraq' },
  { code: 'US', dial: '+1', name: 'United States' },
  { code: 'GB', dial: '+44', name: 'United Kingdom' },
  { code: 'IN', dial: '+91', name: 'India' },
  { code: 'PK', dial: '+92', name: 'Pakistan' },
  { code: 'TR', dial: '+90', name: 'Turkey' },
];

export interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  style?: ViewStyle;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  countryCode = '+966',
  onCountryCodeChange,
  error,
  label,
  placeholder = 'Phone number',
  style,
}) => {
  const isRTL = I18nManager.isRTL;
  const [showPicker, setShowPicker] = useState(false);

  const handleSelectCountry = useCallback(
    (country: CountryCode) => {
      onCountryCodeChange?.(country.dial);
      setShowPicker(false);
    },
    [onCountryCodeChange],
  );

  const renderCountryItem = ({ item }: { item: CountryCode }) => {
    const isSelected = item.dial === countryCode;
    return (
      <TouchableOpacity
        style={[styles.countryItem, isSelected && styles.countryItemSelected]}
        onPress={() => handleSelectCountry(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.countryDial}>{item.dial}</Text>
        <Text style={[styles.countryName, isSelected && styles.countryNameSelected]} numberOfLines={1}>
          {item.name}
        </Text>
        {isSelected && <Text style={styles.checkmark}>+</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, isRTL && styles.textRTL]}>{label}</Text>}
      <View style={[styles.inputRow, isRTL && styles.inputRowRTL, error && styles.inputRowError]}>
        <TouchableOpacity
          style={styles.codeButton}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.codeText}>{countryCode}</Text>
          <Text style={styles.codeChevron}>v</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TextInput
          style={[styles.phoneInput, isRTL && styles.phoneInputRTL]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          keyboardType="phone-pad"
          textAlign={isRTL ? 'right' : 'left'}
        />
      </View>
      {error && <Text style={[styles.errorText, isRTL && styles.textRTL]}>{error}</Text>}

      <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)} statusBarTranslucent>
        <Pressable style={styles.overlay} onPress={() => setShowPicker(false)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Country Code</Text>
            <FlatList
              data={COUNTRY_CODES}
              renderItem={renderCountryItem}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              style={styles.countryList}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.margin.sm },
  label: { ...typography.textStyles.label, color: colors.textPrimary, marginBottom: spacing.xs },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.sm,
    minHeight: 48,
    overflow: 'hidden',
  },
  inputRowRTL: { flexDirection: 'row-reverse' },
  inputRowError: { borderColor: colors.error },
  codeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.padding.md,
    minHeight: 44,
    minWidth: 80,
  },
  codeText: { ...typography.textStyles.body, color: colors.textPrimary, fontWeight: typography.fontWeight.medium },
  codeChevron: { fontSize: 10, color: colors.textTertiary, marginLeft: spacing.xs },
  separator: { width: 1, height: 24, backgroundColor: colors.border },
  phoneInput: {
    flex: 1,
    ...typography.textStyles.body,
    color: colors.textPrimary,
    paddingHorizontal: spacing.padding.md,
    minHeight: 44,
  },
  phoneInputRTL: { textAlign: 'right' },
  textRTL: { textAlign: 'right' },
  errorText: { ...typography.textStyles.bodySmall, color: colors.error, marginTop: spacing.xs },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
    paddingBottom: spacing['3xl'],
    maxHeight: '50%',
  },
  sheetHandle: { width: 36, height: 4, backgroundColor: colors.gray300, borderRadius: 2, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
  sheetTitle: { ...typography.textStyles.h4, paddingHorizontal: spacing.padding.lg, marginBottom: spacing.margin.md },
  countryList: { paddingHorizontal: spacing.padding.lg },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.padding.md,
    paddingHorizontal: spacing.padding.md,
    borderRadius: spacing.borderRadius.md,
    minHeight: 48,
  },
  countryItemSelected: { backgroundColor: colors.primaryLight },
  countryDial: { ...typography.textStyles.body, color: colors.textPrimary, fontWeight: typography.fontWeight.medium, width: 60 },
  countryName: { ...typography.textStyles.body, color: colors.textSecondary, flex: 1 },
  countryNameSelected: { color: colors.primary },
  checkmark: { fontSize: 16, color: colors.primary, fontWeight: typography.fontWeight.bold },
});
