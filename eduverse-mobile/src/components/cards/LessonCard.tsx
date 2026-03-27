/**
 * LessonCard component
 * Lesson card showing status, time, meet link
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import type { Lesson, LessonStatus } from '@/types/models';

export interface LessonCardProps {
  lesson: Lesson;
  onPress?: () => void;
  onJoinMeet?: () => void;
}

const statusConfig: Record<LessonStatus, { label: string; bg: string; text: string }> = {
  scheduled: { label: 'Scheduled', bg: colors.infoLight, text: colors.info },
  live: { label: 'Live', bg: colors.errorLight, text: colors.error },
  completed: { label: 'Completed', bg: colors.successLight, text: colors.success },
  cancelled: { label: 'Cancelled', bg: colors.backgroundTertiary, text: colors.textTertiary },
};

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

function formatTimeRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sH = String(s.getHours()).padStart(2, '0');
  const sM = String(s.getMinutes()).padStart(2, '0');
  const eH = String(e.getHours()).padStart(2, '0');
  const eM = String(e.getMinutes()).padStart(2, '0');
  return `${sH}:${sM} - ${eH}:${eM}`;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, onPress, onJoinMeet }) => {
  const isRTL = I18nManager.isRTL;
  const config = statusConfig[lesson.status];
  const isLive = lesson.status === 'live';
  const hasMeetLink = !!lesson.meetLink;

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
            {lesson.title}
          </Text>
          <Text style={[styles.dateTime, isRTL && styles.textRTL]}>
            {formatDateTime(lesson.startDateTime)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          {isLive && <View style={styles.liveDot} />}
          <Text style={[styles.statusText, { color: config.text }]}>{config.label}</Text>
        </View>
      </View>

      <View style={[styles.timeRow, isRTL && styles.timeRowRTL]}>
        <Text style={styles.timeIcon}>{'[T]'}</Text>
        <Text style={styles.timeText}>
          {formatTimeRange(lesson.startDateTime, lesson.endDateTime)}
        </Text>
      </View>

      {lesson.description && (
        <Text style={[styles.description, isRTL && styles.textRTL]} numberOfLines={2}>
          {lesson.description}
        </Text>
      )}

      {isLive && hasMeetLink && onJoinMeet && (
        <TouchableOpacity style={styles.joinButton} onPress={onJoinMeet} activeOpacity={0.8}>
          <Text style={styles.joinButtonText}>Join Meeting</Text>
        </TouchableOpacity>
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
  dateTime: { ...typography.textStyles.bodySmall, color: colors.textSecondary },
  textRTL: { textAlign: 'right' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.padding.sm,
    paddingVertical: 3,
    borderRadius: spacing.borderRadius.full,
    gap: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.error },
  statusText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.gap.xs },
  timeRowRTL: { flexDirection: 'row-reverse' },
  timeIcon: { fontSize: 12, color: colors.textTertiary },
  timeText: { ...typography.textStyles.bodySmall, color: colors.textSecondary },
  description: { ...typography.textStyles.bodySmall, color: colors.textSecondary, marginBottom: spacing.sm },
  joinButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
    paddingVertical: spacing.padding.sm,
    paddingHorizontal: spacing.padding.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  joinButtonText: { ...typography.textStyles.button, color: colors.textInverse, fontSize: 14 },
});
