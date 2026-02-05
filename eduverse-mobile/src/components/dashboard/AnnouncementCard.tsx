/**
 * AnnouncementCard component
 * Displays announcement with read status
 */

import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/common';
import { spacing, colors, typography } from '@/theme';
import type { AnnouncementResponse } from '@/types/api';

interface AnnouncementCardProps {
  announcement: AnnouncementResponse;
  onPress?: () => void;
  onMarkAsRead?: (id: string) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onPress,
  onMarkAsRead,
}) => {
  const { t } = useTranslation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const handleMarkAsRead = () => {
    if (onMarkAsRead && !announcement.isRead) {
      onMarkAsRead(announcement.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return t('announcements.today');
    } else if (diffDays === 1) {
      return t('announcements.yesterday');
    } else if (diffDays < 7) {
      return t('announcements.daysAgo', { count: diffDays });
    } else {
      return t('announcements.date', { 
        day: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
      });
    }
  };

  return (
    <Card onPress={handlePress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.readIndicator, announcement.isRead && styles.read]} />
          <Text style={styles.targetAudience}>
            {announcement.targetAudience.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.date}>{formatDate(announcement.publishedAt)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {announcement.title}
      </Text>

      <Text style={styles.content} numberOfLines={4}>
        {announcement.content}
      </Text>

      {!announcement.isRead && (
        <Pressable 
          onPress={handleMarkAsRead}
          style={styles.markReadButton}
          testID={`announcement-${announcement.id}-mark-read`}
        >
          <Text style={styles.markReadText}>{t('announcements.markAsRead')}</Text>
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
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  readIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  read: {
    backgroundColor: colors.success,
  },
  date: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
  },
  targetAudience: {
    ...typography.textStyles.label,
    color: colors.primary,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  title: {
    ...typography.textStyles.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  content: {
    ...typography.textStyles.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  markReadButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  markReadText: {
    ...typography.textStyles.link,
    color: colors.primary,
    fontWeight: '600' as const,
  },
});

export default AnnouncementCard;
