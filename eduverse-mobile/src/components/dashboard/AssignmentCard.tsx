/**
 * AssignmentCard component
 * Displays assignment with submission status
 */

import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/common';
import { spacing, colors, typography } from '@/theme';
import type { AssignmentResponse } from '@/types/api';

interface AssignmentCardProps {
  assignment: AssignmentResponse;
  onPress?: () => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onPress,
}) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return t('assignments.dueToday');
    } else if (diffDays === 1) {
      return t('assignments.dueTomorrow');
    } else if (diffDays < 7) {
      return t('assignments.dueInDays', { count: diffDays });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        year: 'numeric' 
      });
    }
  };

  const getDueStatus = () => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const diffMs = dueDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'overdue';
    } else if (diffDays === 0) {
      return 'today';
    } else if (diffDays <= 2) {
      return 'soon';
    } else {
      return 'upcoming';
    }
  };

  const getDueStatusColor = () => {
    switch (getDueStatus()) {
      case 'overdue':
        return colors.error;
      case 'today':
        return colors.warning;
      case 'soon':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const getDueStatusText = () => {
    switch (getDueStatus()) {
      case 'overdue':
        return t('assignments.overdue');
      case 'today':
        return t('assignments.dueToday');
      case 'soon':
        return t('assignments.dueSoon');
      default:
        return '';
    }
  };

  const hasSubmission = !!assignment.submission;

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getDueStatusColor() }]} />
          <Text style={styles.statusText}>{getDueStatusText()}</Text>
        </View>
        <Text style={styles.dueDate}>{formatDate(assignment.dueDate)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {assignment.title}
      </Text>

      <Text style={styles.courseName}>{assignment.courseName}</Text>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>
          {hasSubmission 
            ? t('assignments.score', { score: assignment.submission?.score || 0, max: assignment.maxScore })
            : t('assignments.maxScore', { max: assignment.maxScore })
          }
        </Text>
      </View>

      {hasSubmission && assignment.submission && (
        <View style={styles.submissionContainer}>
          <Text style={styles.submittedText}>{t('assignments.submitted')}</Text>
          <Text style={styles.submittedDate}>
            {new Date(assignment.submission.submittedAt).toLocaleDateString()}
          </Text>
        </View>
      )}

      {!hasSubmission && (
        <Pressable 
          onPress={() => console.log('Submit assignment:', assignment.id)}
          style={styles.submitButton}
          testID={`assignment-${assignment.id}-submit`}
        >
          <Text style={styles.submitButtonText}>{t('assignments.submit')}</Text>
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
  dueDate: {
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
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  scoreLabel: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  submissionContainer: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  submittedText: {
    ...typography.textStyles.caption,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  submittedDate: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  submitButtonText: {
    ...typography.textStyles.button,
    color: colors.textInverse,
  },
});

export default AssignmentCard;
