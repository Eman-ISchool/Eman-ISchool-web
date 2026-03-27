/**
 * CourseCard component
 * Course preview card for lists
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import type { Course } from '@/types/models';

export interface CourseCardProps {
  course: Course;
  onPress?: () => void;
  teacherName?: string;
  progress?: number; // 0-100
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onPress,
  teacherName,
  progress,
}) => {
  const isRTL = I18nManager.isRTL;
  const hasImage = !!course.imageUrl;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {hasImage && (
        <Image source={{ uri: course.imageUrl! }} style={styles.image} />
      )}
      {!hasImage && (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>
            {course.title.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={[styles.title, isRTL && styles.textRTL]} numberOfLines={2}>
          {course.title}
        </Text>
        {teacherName && (
          <Text style={[styles.teacher, isRTL && styles.textRTL]} numberOfLines={1}>
            {teacherName}
          </Text>
        )}
        {course.subject && (
          <View style={[styles.metaRow, isRTL && styles.metaRowRTL]}>
            <View style={styles.subjectBadge}>
              <Text style={styles.subjectText}>{course.subject}</Text>
            </View>
            {course.gradeLevel && (
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeText}>{course.gradeLevel}</Text>
              </View>
            )}
          </View>
        )}
        {progress !== undefined && progress >= 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}
        {course.price > 0 && (
          <Text style={[styles.price, isRTL && styles.textRTL]}>
            {course.price.toFixed(2)} SAR
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.margin.md,
  },
  image: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 40,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  content: {
    padding: spacing.padding.lg,
  },
  title: {
    ...typography.textStyles.h4,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  teacher: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  textRTL: { textAlign: 'right' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap.sm,
    marginBottom: spacing.sm,
  },
  metaRowRTL: { flexDirection: 'row-reverse' },
  subjectBadge: {
    backgroundColor: colors.infoLight,
    paddingHorizontal: spacing.padding.sm,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.full,
  },
  subjectText: {
    ...typography.textStyles.caption,
    color: colors.info,
    fontWeight: typography.fontWeight.medium,
    fontSize: 11,
  },
  gradeBadge: {
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: spacing.padding.sm,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.full,
  },
  gradeText: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    fontSize: 11,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap.sm,
    marginBottom: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    minWidth: 32,
    textAlign: 'right',
  },
  price: {
    ...typography.textStyles.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
});
