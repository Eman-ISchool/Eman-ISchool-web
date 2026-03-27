/**
 * NotificationCard component
 * Notification item with read/unread indicator
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import type { Notification, NotificationType } from '@/types/models';

export interface NotificationCardProps {
  notification: Notification;
  onPress?: () => void;
}

const typeIcons: Record<NotificationType, string> = {
  class_reminder: '[C]',
  grade_update: '[G]',
  announcement: '[A]',
  cancellation: '[X]',
  assignment_due: '[H]',
  exam_reminder: '[E]',
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onPress }) => {
  const isRTL = I18nManager.isRTL;
  const isUnread = !notification.isRead;
  const icon = typeIcons[notification.type] || '[N]';

  return (
    <TouchableOpacity
      style={[styles.card, isUnread && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.row, isRTL && styles.rowRTL]}>
        <View style={[styles.iconContainer, isUnread && styles.iconContainerUnread]}>
          <Text style={[styles.icon, isUnread && styles.iconUnread]}>{icon}</Text>
        </View>
        <View style={styles.content}>
          <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
            <Text style={[styles.title, isRTL && styles.textRTL, isUnread && styles.titleUnread]} numberOfLines={1}>
              {notification.title}
            </Text>
            <Text style={styles.time}>{timeAgo(notification.createdAt)}</Text>
          </View>
          <Text style={[styles.message, isRTL && styles.textRTL]} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    paddingVertical: spacing.padding.md,
    paddingHorizontal: spacing.padding.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    minHeight: 56,
  },
  cardUnread: { backgroundColor: colors.backgroundSecondary },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.gap.md },
  rowRTL: { flexDirection: 'row-reverse' },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerUnread: { backgroundColor: colors.primaryLight },
  icon: { fontSize: 14, color: colors.textSecondary },
  iconUnread: { color: colors.primary },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  titleRowRTL: { flexDirection: 'row-reverse' },
  title: { ...typography.textStyles.body, fontWeight: typography.fontWeight.medium, color: colors.textPrimary, flex: 1 },
  titleUnread: { fontWeight: typography.fontWeight.semibold },
  textRTL: { textAlign: 'right' },
  time: { ...typography.textStyles.caption, color: colors.textTertiary, marginLeft: spacing.sm },
  message: { ...typography.textStyles.bodySmall, color: colors.textSecondary },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
});
