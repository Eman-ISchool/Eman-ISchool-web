/**
 * StudentAttendanceScreen
 * Attendance history with summary stats
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { get } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

export function StudentAttendanceScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isRTL = I18nManager.isRTL;

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get<any>(`/attendance?studentId=${user?.id}`);
      setRecords(data.data || []);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const stats = {
    total: records.length,
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
  };
  const rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'present': return { bg: colors.successLight, text: colors.success, label: t('attendance.present', 'Present') };
      case 'absent': return { bg: colors.errorLight, text: colors.error, label: t('attendance.absent', 'Absent') };
      case 'late': return { bg: colors.warningLight, text: colors.warning, label: t('attendance.late', 'Late') };
      case 'excused': return { bg: colors.infoLight, text: colors.info, label: t('attendance.excused', 'Excused') };
      default: return { bg: colors.backgroundTertiary, text: colors.textTertiary, label: status };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const s = getStatusStyle(item.status);
    return (
      <View style={styles.card}>
        <View style={[styles.row, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.lessonName, isRTL && styles.textRTL]} numberOfLines={1}>
              {item.lesson?.title || item.lessonId}
            </Text>
            <Text style={[styles.dateText, isRTL && styles.textRTL]}>
              {new Date(item.createdAt || item.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>
          {t('attendance.title', 'Attendance')}
        </Text>
      </View>

      {/* Summary */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{rate}%</Text>
          <Text style={styles.statLabel}>{t('attendance.rate', 'Rate')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.success }]}>{stats.present}</Text>
          <Text style={styles.statLabel}>{t('attendance.present', 'Present')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.error }]}>{stats.absent}</Text>
          <Text style={styles.statLabel}>{t('attendance.absent', 'Absent')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.warning }]}>{stats.late}</Text>
          <Text style={styles.statLabel}>{t('attendance.late', 'Late')}</Text>
        </View>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAttendance} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>{t('attendance.empty', 'No attendance records')}</Text>
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
  statsRow: { flexDirection: 'row', padding: spacing.padding.md, gap: 8 },
  statCard: { flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  list: { padding: spacing.padding.md },
  card: { backgroundColor: colors.background, borderRadius: 10, padding: 14, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lessonName: { ...typography.textStyles.body, color: colors.textPrimary, fontWeight: '500' },
  dateText: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  emptyText: { ...typography.textStyles.body, color: colors.textTertiary },
  textRTL: { textAlign: 'right' },
});

export default StudentAttendanceScreen;
