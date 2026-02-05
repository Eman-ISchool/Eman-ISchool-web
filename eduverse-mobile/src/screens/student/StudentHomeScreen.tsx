/**
 * StudentHomeScreen component
 * Main dashboard for student users
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { dashboardApi } from '@/api';
import type { DashboardStatsResponse } from '@/types/api';
import { AnnouncementCard, LessonCard, AssignmentCard } from '@/components/dashboard';
import { Header } from '@/components/layout';
import { spacing, colors, typography } from '@/theme';

export const StudentHomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = React.useState<DashboardStatsResponse | null>(null);
  const [announcements, setAnnouncements] = React.useState<any[]>([]);
  const [upcomingLessons, setUpcomingLessons] = React.useState<any[]>([]);
  const [assignments, setAssignments] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [statsResponse, announcementsResponse, lessonsResponse, assignmentsResponse] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getAnnouncements({ limit: 5 }),
        dashboardApi.getLessons({ upcoming: true, limit: 5 }),
        dashboardApi.getAssignments({ due: 'upcoming', limit: 5 }),
      ]);
      
      setStats(statsResponse);
      setAnnouncements(announcementsResponse.data);
      setUpcomingLessons(lessonsResponse.data);
      setAssignments(assignmentsResponse.data);
      
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchDashboardData();
  }, []);

  return (
    <View style={styles.container}>
      <Header title={t('student.home')} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={null}
      refreshing={isLoading}
        onRefresh={handleRefresh}
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
          )}
          
          {/* Announcements Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('student.announcements')}</Text>
            {announcements.length > 0 ? (
              announcements.map((announcement, index) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onPress={() => console.log('View announcement:', announcement.id)}
                  onMarkAsRead={() => console.log('Mark as read:', announcement.id)}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('student.noAnnouncements')}</Text>
                <Text style={styles.emptySubtext}>{t('student.noAnnouncementsSubtext')}</Text>
              </View>
            )}
          </View>
          
          {/* Upcoming Lessons Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('student.upcomingLessons')}</Text>
            {upcomingLessons.length > 0 ? (
              upcomingLessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onPress={() => console.log('View lesson:', lesson.id)}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('student.noUpcomingLessons')}</Text>
                <Text style={styles.emptySubtext}>{t('student.noUpcomingLessonsSubtext')}</Text>
              </View>
            )}
          </View>
          
          {/* Assignments Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('student.assignments')}</Text>
            {assignments.length > 0 ? (
              assignments.map((assignment, index) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onPress={() => console.log('View assignment:', assignment.id)}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('student.noAssignments')}</Text>
                <Text style={styles.emptySubtext}>{t('student.noAssignmentsSubtext')}</Text>
              </View>
            )}
          </View>
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
