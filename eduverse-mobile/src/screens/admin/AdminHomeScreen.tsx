/**
 * AdminHomeScreen
 * Admin dashboard with KPI stats and quick actions
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { get } from '@/api/client';

export function AdminHomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const isRTL = I18nManager.isRTL;

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get<any>('/admin/stats');
      setStats(data.data || data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const kpis = [
    { label: t('admin.totalStudents', 'Students'), value: stats?.totalStudents || 0, color: colors.info, icon: '👨‍🎓' },
    { label: t('admin.totalTeachers', 'Teachers'), value: stats?.totalTeachers || 0, color: colors.success, icon: '👩‍🏫' },
    { label: t('admin.activeCourses', 'Courses'), value: stats?.activeCourses || 0, color: colors.warning, icon: '📚' },
    { label: t('admin.pendingEnrollments', 'Pending'), value: stats?.pendingEnrollments || 0, color: colors.error, icon: '⏳' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>
          {t('admin.dashboard', 'Admin Dashboard')}
        </Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStats} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          {kpis.map((kpi, i) => (
            <View key={i} style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>{kpi.icon}</Text>
              <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {/* Revenue */}
        {stats?.totalRevenue != null && (
          <View style={styles.revenueCard}>
            <Text style={styles.revenueLabel}>{t('admin.totalRevenue', 'Total Revenue')}</Text>
            <Text style={styles.revenueValue}>
              AED {(stats.totalRevenue || 0).toLocaleString()}
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          {t('admin.quickActions', 'Quick Actions')}
        </Text>
        <View style={styles.actionsGrid}>
          {[
            { label: t('admin.manageStudents', 'Students'), icon: '👥', tab: 'Students' },
            { label: t('admin.manageCourses', 'Courses'), icon: '📖', tab: 'Courses' },
            { label: t('admin.viewReports', 'Reports'), icon: '📊', tab: 'Reports' },
            { label: t('admin.settings', 'Settings'), icon: '⚙️', tab: 'Settings' },
          ].map((action) => (
            <TouchableOpacity
              key={action.tab}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.tab)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  header: { padding: spacing.padding.md, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { ...typography.textStyles.h2, color: colors.textPrimary },
  scrollContent: { padding: spacing.padding.md },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  kpiCard: { width: '47%', backgroundColor: colors.background, borderRadius: 12, padding: 16, alignItems: 'center' },
  kpiIcon: { fontSize: 28, marginBottom: 8 },
  kpiValue: { fontSize: 28, fontWeight: '700' },
  kpiLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  revenueCard: { backgroundColor: colors.primary, borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 20 },
  revenueLabel: { color: colors.textInverse, opacity: 0.85, fontSize: 14 },
  revenueValue: { color: colors.textInverse, fontSize: 32, fontWeight: '700', marginTop: 4 },
  sectionTitle: { ...typography.textStyles.h3, color: colors.textPrimary, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { width: '47%', backgroundColor: colors.background, borderRadius: 12, padding: 20, alignItems: 'center' },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  textRTL: { textAlign: 'right' },
});

export default AdminHomeScreen;
