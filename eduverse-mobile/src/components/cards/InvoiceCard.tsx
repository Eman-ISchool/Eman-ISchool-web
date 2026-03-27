/**
 * InvoiceCard component
 * Invoice/payment card showing amount, status, date
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import { colors, spacing, typography } from '@/theme';

type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  amount: number;
  currency?: string;
  status: InvoiceStatus;
  description: string;
  date: string;
  dueDate?: string;
}

export interface InvoiceCardProps {
  invoice: Invoice;
  onPress?: () => void;
}

const statusConfig: Record<InvoiceStatus, { label: string; bg: string; text: string }> = {
  paid: { label: 'Paid', bg: colors.successLight, text: colors.success },
  pending: { label: 'Pending', bg: colors.warningLight, text: colors.warning },
  overdue: { label: 'Overdue', bg: colors.errorLight, text: colors.error },
  cancelled: { label: 'Cancelled', bg: colors.backgroundTertiary, text: colors.textTertiary },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onPress }) => {
  const isRTL = I18nManager.isRTL;
  const config = statusConfig[invoice.status];
  const currency = invoice.currency || 'SAR';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <View style={styles.amountArea}>
          <Text style={[styles.amount, isRTL && styles.textRTL]}>
            {invoice.amount.toFixed(2)} {currency}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.statusText, { color: config.text }]}>{config.label}</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.description, isRTL && styles.textRTL]} numberOfLines={2}>
        {invoice.description}
      </Text>
      <View style={[styles.footer, isRTL && styles.footerRTL]}>
        <Text style={styles.dateText}>{formatDate(invoice.date)}</Text>
        {invoice.dueDate && (
          <Text style={styles.dueText}>Due: {formatDate(invoice.dueDate)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.padding.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.margin.md,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  headerRTL: { flexDirection: 'row-reverse' },
  amountArea: { flexDirection: 'row', alignItems: 'center', gap: spacing.gap.md },
  amount: { ...typography.textStyles.h4, color: colors.textPrimary },
  statusBadge: {
    paddingHorizontal: spacing.padding.sm,
    paddingVertical: 3,
    borderRadius: spacing.borderRadius.full,
  },
  statusText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium },
  description: { ...typography.textStyles.body, color: colors.textSecondary, marginBottom: spacing.sm },
  textRTL: { textAlign: 'right' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerRTL: { flexDirection: 'row-reverse' },
  dateText: { ...typography.textStyles.caption, color: colors.textTertiary },
  dueText: { ...typography.textStyles.caption, color: colors.textTertiary },
});
