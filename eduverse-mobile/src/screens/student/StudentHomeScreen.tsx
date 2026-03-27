/**
 * StudentHomeScreen component
 * Main dashboard for student users
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { dashboardApi } from '@/api';
import type { DashboardStatsResponse } from '@/types/api';
import { AnnouncementCard, LessonCard, AssignmentCard } from '@/components/dashboard';
import { Header } from '@/components/layout';
import { spacing, colors, typography } from '@/theme';

export const StudentHomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = React.useState<DashboardStatsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await dashboardApi.getStudentDashboard();
      setStats(response);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <View style={styles.container}>
      <Header title={t('student.home')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Stats Section */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('student.stats')}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t('student.totalLessons')}</Text>
                <Text style={styles.statValue}>{stats?.totalLessons || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t('student.completedLessons')}</Text>
                <Text style={styles.statValue}>{stats?.completedLessons || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t('student.upcomingLessons')}</Text>
                <Text style={styles.statValue}>{stats?.upcomingLessons || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t('student.assignments')}</Text>
                <Text style={styles.statValue}>{stats?.activeEnrollments || 0}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  section: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    ...typography.textStyles.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  statLabel: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  statValue: {
    ...typography.textStyles.h4,
    color: colors.textPrimary,
    fontWeight: '600' as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.textStyles.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.textStyles.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});

export default StudentHomeScreen;
