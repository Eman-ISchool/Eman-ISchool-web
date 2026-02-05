/**
 * LessonCard component
 * Displays lesson with status and details
 */

import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/common';
import { spacing, colors, typography } from '@/theme';
import type { LessonResponse } from '@/types/api';

interface LessonCardProps {
  lesson: LessonResponse;
  onPress?: () => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onPress,
}) => {
  const { t } = useTranslation();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric' 
    });
  };

  const getStatusColor = () => {
    switch (lesson.status) {
      case 'upcoming':
        return colors.info;
      case 'ongoing':
        return colors.primary;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (lesson.status) {
      case 'upcoming':
        return t('lessons.upcoming');
      case 'ongoing':
        return t('lessons.ongoing');
      case 'completed':
        return t('lessons.completed');
      case 'cancelled':
        return t('lessons.cancelled');
      default:
        return lesson.status;
    }
  };

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
        <Text style={styles.date}>{formatDate(lesson.startDateTime)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {lesson.title}
      </Text>

      <Text style={styles.courseName}>{lesson.courseName}</Text>
      <Text style={styles.teacherName}>{lesson.teacherName}</Text>

      <View style={styles.timeContainer}>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>{t('lessons.start')}</Text>
          <Text style={styles.timeValue}>{formatTime(lesson.startDateTime)}</Text>
        </View>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>{t('lessons.end')}</Text>
          <Text style={styles.timeValue}>{formatTime(lesson.endDateTime)}</Text>
        </View>
      </View>

      {lesson.meetLink && (
        <Pressable 
          onPress={() => console.log('Join lesson:', lesson.id)}
          style={styles.joinButton}
          testID={`lesson-${lesson.id}-join`}
        >
          <Text style={styles.joinButtonText}>{t('lessons.join')}</Text>
        </Pressable>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.textStyles.label,
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '600' as const,
  },
  date: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
  },
  title: {
    ...typography.textStyles.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  courseName: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  teacherName: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  timeValue: {
    ...typography.textStyles.body,
    color: colors.textPrimary,
    fontWeight: '500' as const,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  joinButtonText: {
    ...typography.textStyles.button,
    color: colors.textInverse,
  },
});

export default LessonCard;
