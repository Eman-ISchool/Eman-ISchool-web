/**
 * ReelCard component
 * Displays reel thumbnail with progress indicator
 */

import React from 'react';
import { View, StyleSheet, Image, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/common';
import { spacing, colors, typography } from '@/theme';
import type { ReelFeedItem } from '@/types/api';

interface ReelCardProps {
  reel: ReelFeedItem;
  onPress?: () => void;
  onBookmark?: () => void;
}

export const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  onPress,
  onBookmark,
}) => {
  const { t } = useTranslation();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return t('reels.durationMinutes', { minutes, seconds: remainingSeconds });
    } else if (remainingSeconds > 0) {
      return t('reels.durationSeconds', { seconds: remainingSeconds });
    } else {
      return t('reels.durationLessThanMinute', { seconds });
    }
  };

  const getProgressPercentage = () => {
    if (reel.durationSeconds > 0) {
      return Math.round((reel.progress.watchedSeconds / reel.durationSeconds) * 100);
    }
    return 0;
  };

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: reel.thumbnailUrl || 'https://via.placeholder.com/300x400?text=Reel' }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        
        {reel.progress.isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {reel.titleEn || reel.titleAr}
          </Text>
          
          {reel.subject && (
            <Text style={styles.subject}>{reel.subject}</Text>
          )}
          
          {reel.gradeLevel && (
            <Text style={styles.gradeLevel}>{reel.gradeLevel}</Text>
          )}
        </View>

        <Text style={styles.teacherName}>{reel.teacherName}</Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t('reels.views')}</Text>
            <Text style={styles.statValue}>{reel.viewCount}</Text>
          </View>
          
          {reel.durationSeconds > 0 && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('reels.duration')}</Text>
              <Text style={styles.statValue}>{formatDuration(reel.progress.watchedSeconds)}</Text>
            </View>
          )}
        </View>

        {reel.progress.isCompleted && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} />
            </View>
            <Text style={styles.progressText}>{getProgressPercentage()}%</Text>
            </View>
        )}

        <View style={styles.actions}>
          <Pressable
            onPress={() => onBookmark && onBookmark()}
            style={styles.bookmarkButton}
            testID={`reel-${reel.id}-bookmark`}
          >
            <Text style={styles.bookmarkButtonText}>
              {reel.progress.isBookmarked ? t('reels.bookmarked') : t('reels.bookmark')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  thumbnailContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.backgroundSecondary,
  },
  completedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.success,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    color: colors.textInverse,
    fontWeight: '700' as const,
    fontSize: 14,
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.textStyles.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subject: {
    ...typography.textStyles.label,
    color: colors.primary,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  gradeLevel: {
    ...typography.textStyles.label,
    color: colors.primary,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  teacherName: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  statValue: {
    ...typography.textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600' as const,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 2,
    flex: 1,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    height: '100%',
  },
  progressText: {
    ...typography.textStyles.caption,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  bookmarkButton: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  bookmarkButtonText: {
    ...typography.textStyles.button,
    color: colors.primary,
  },
});

export default ReelCard;
