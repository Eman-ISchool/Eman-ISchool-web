/**
 * StudentNotificationsScreen
 * Notification list for student
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { get } from '@/api/client';
import type { Notification } from '@/types/models';

export function StudentNotificationsScreen() {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get<any>('/notifications');
      setNotifications(data.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'class_reminder': return '📅';
      case 'grade_update': return '📊';
      case 'announcement': return '📢';
      case 'cancellation': return '❌';
      case 'assignment_due': return '📝';
      case 'exam_reminder': return '📋';
      default: return '🔔';
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.card, !item.isRead && styles.unread]}
      activeOpacity={0.7}
    >
      <View style={[styles.row, isRTL && { flexDirection: 'row-reverse' }]}>
        <Text style={styles.icon}>{getIcon(item.type)}</Text>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={[styles.title, isRTL && styles.textRTL]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.message, isRTL && styles.textRTL]} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={[styles.time, isRTL && styles.textRTL]}>
            {new Date(item.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
          </Text>
        </View>
        {!item.isRead && <View style={styles.dot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>
          {t('notifications.title', 'Notifications')}
        </Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchNotifications} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>{t('notifications.empty', 'No notifications')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { padding: spacing.padding.md, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { ...typography.textStyles.h2, color: colors.textPrimary },
  list: { padding: spacing.padding.sm },
  card: { backgroundColor: colors.background, borderRadius: 10, padding: 14, marginBottom: 6 },
  unread: { backgroundColor: colors.primaryLight },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 28 },
  title: { ...typography.textStyles.body, color: colors.textPrimary, fontWeight: '600' },
  message: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  time: { fontSize: 11, color: colors.textTertiary, marginTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  emptyText: { ...typography.textStyles.body, color: colors.textTertiary },
  textRTL: { textAlign: 'right' },
});

export default StudentNotificationsScreen;
