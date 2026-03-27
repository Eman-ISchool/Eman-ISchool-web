/**
 * AssignmentCard component
 * Assignment card with due date and status
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import type { Assignment } from '@/types/models';

export interface AssignmentCardProps {
  assignment: Assignment;
  onPress?: () => void;
  courseName?: string;
  status?: 'pending' | 'submitted' | 'graded' | 'overdue';
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: colors.warningLight, text: colors.warning },
  submitted: { label: 'Submitted', bg: colors.infoLight, text: colors.info },
  graded: { label: 'Graded', bg: colors.successLight, text: colors.success },
  overdue: { label: 'Overdue', bg: colors.errorLight, text: colors.error },
};

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays <= 7) return `Due in ${diffDays} days`;

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `Due ${month}/${day}`;
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr).getTime() < Date.now();
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onPress,
  courseName,
  status,
}) => {
  const isRTL = I18nManager.isRTL;
  const effectiveStatus = status || (isOverdue(assignment.dueDate) ? 'overdue' : 'pending');
  const config = statusConfig[effectiveStatus];
  const dueDateText = formatDueDate(assignment.dueDate);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <View style={styles.titleArea}>
          <Text style={[styles.title, isRTL && styles.textRTL]} numberOfLines={2}>
            {assignment.title}
          </Text>
          {courseName && (
            <Text style={[styles.courseName, isRTL && styles.textRTL]} numberOfLines={1}>
              {courseName}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.statusText, { color: config.text }]}>{config.label}</Text>
        </View>
      </View>

      <View style={[styles.footer, isRTL && styles.footerRTL]}>
        <View style={[styles.dueRow, isRTL && styles.dueRowRTL]}>
          <Text style={styles.dueIcon}>{'[D]'}</Text>
          <Text style={[styles.dueText, effectiveStatus === 'overdue' && styles.dueTextOverdue]}>
            {dueDateText}
          </Text>
        </View>
        {assignment.maxScore > 0 && (
          <Text style={styles.maxScore}>Max: {assignment.maxScore}</Text>
        )}
      </View>

      {assignment.description && (
        <Text style={[styles.description, isRTL && styles.textRTL]} numberOfLines={2}>
          {assignment.description}
        </Text>
      )}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  headerRTL: { flexDirection: 'row-reverse' },
  titleArea: { flex: 1, marginRight: spacing.sm },
  title: { ...typography.textStyles.body, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: 2 },
  courseName: { ...typography.textStyles.bodySmall, color: colors.textSecondary },
  textRTL: { textAlign: 'right' },
  statusBadge: {
    paddingHorizontal: spacing.padding.sm,
    paddingVertical: 3,
    borderRadius: spacing.borderRadius.full,
  },
  statusText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  footerRTL: { flexDirection: 'row-reverse' },
  dueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.gap.xs },
  dueRowRTL: { flexDirection: 'row-reverse' },
  dueIcon: { fontSize: 12, color: colors.textTertiary },
  dueText: { ...typography.textStyles.bodySmall, color: colors.textSecondary },
  dueTextOverdue: { color: colors.error, fontWeight: typography.fontWeight.medium },
  maxScore: { ...typography.textStyles.caption, color: colors.textTertiary },
  description: { ...typography.textStyles.bodySmall, color: colors.textTertiary, marginTop: spacing.xs },
});
