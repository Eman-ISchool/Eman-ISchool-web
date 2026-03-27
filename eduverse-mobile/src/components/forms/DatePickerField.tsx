/**
 * DatePickerField component
 * Date picker that opens native date picker modal
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  StyleSheet,
  I18nManager,
  ViewStyle,
  Pressable,
} from 'react-native';
import { colors, spacing, typography } from '@/theme';

export interface DatePickerFieldProps {
  label?: string;
  value?: Date;
  onChange: (date: Date) => void;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
  style?: ViewStyle;
}

function formatDate(date?: Date): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate year/month/day options for manual picker (fallback without native DateTimePicker)
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  error,
  minimumDate,
  maximumDate,
  placeholder = 'Select date',
  style,
}) => {
  const isRTL = I18nManager.isRTL;
  const [isOpen, setIsOpen] = useState(false);

  // State for picker wheels
  const currentDate = value || new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());

  const minYear = minimumDate ? minimumDate.getFullYear() : 1950;
  const maxYear = maximumDate ? maximumDate.getFullYear() : 2050;

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i);
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const handleOpen = useCallback(() => {
    if (value) {
      setSelectedYear(value.getFullYear());
      setSelectedMonth(value.getMonth());
      setSelectedDay(value.getDate());
    }
    setIsOpen(true);
  }, [value]);

  const handleConfirm = useCallback(() => {
    const clampedDay = Math.min(selectedDay, getDaysInMonth(selectedYear, selectedMonth));
    const newDate = new Date(selectedYear, selectedMonth, clampedDay);

    if (minimumDate && newDate < minimumDate) {
      onChange(minimumDate);
    } else if (maximumDate && newDate > maximumDate) {
      onChange(maximumDate);
    } else {
      onChange(newDate);
    }
    setIsOpen(false);
  }, [selectedYear, selectedMonth, selectedDay, minimumDate, maximumDate, onChange]);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, isRTL && styles.textRTL]}>{label}</Text>
      )}
      <TouchableOpacity
        style={[styles.trigger, error && styles.triggerError]}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.triggerText,
            !value && styles.placeholderText,
            isRTL && styles.textRTL,
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
        <Text style={styles.calendarIcon}>📅</Text>
      </TouchableOpacity>
      {error && (
        <Text style={[styles.errorText, isRTL && styles.textRTL]}>
          {error}
        </Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <View
            style={styles.sheet}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={styles.sheetAction}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>{label || 'Select Date'}</Text>
              <TouchableOpacity
                onPress={handleConfirm}
                style={styles.sheetAction}
              >
                <Text style={styles.confirmText}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerRow}>
              {/* Year column */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerColumnLabel}>Year</Text>
                <View style={styles.pickerScroll}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        selectedYear === year && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedYear === year && styles.pickerItemTextSelected,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Month column */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerColumnLabel}>Month</Text>
                <View style={styles.pickerScroll}>
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.pickerItem,
                        selectedMonth === month && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedMonth(month)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMonth === month && styles.pickerItemTextSelected,
                        ]}
                      >
                        {monthNames[month]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Day column */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerColumnLabel}>Day</Text>
                <View style={styles.pickerScroll}>
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        selectedDay === day && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedDay === day && styles.pickerItemTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
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
    color: colors.textPrimary,
    marginBottom: spacing.xs,
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
  calendarIcon: {
    fontSize: 18,
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
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.padding.lg,
    paddingVertical: spacing.padding.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    ...typography.textStyles.h4,
    fontSize: 16,
  },
  sheetAction: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
  },
  confirmText: {
    ...typography.textStyles.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  pickerRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.padding.lg,
    paddingVertical: spacing.padding.md,
    gap: spacing.gap.sm,
  },
  pickerColumn: {
    flex: 1,
    maxHeight: 200,
  },
  pickerColumnLabel: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  pickerScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  pickerItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: spacing.borderRadius.sm,
    minWidth: 44,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  pickerItemText: {
    ...typography.textStyles.bodySmall,
    color: colors.textPrimary,
    fontSize: 13,
  },
  pickerItemTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});
