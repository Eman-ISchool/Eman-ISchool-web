/**
 * TeacherHomeScreen
 * Main dashboard for teacher users with KPI stats, quick actions,
 * recent activity feed, and upcoming lessons list.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { LoadingSpinner, ErrorState, Card, Badge } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { get } from '@/api/client';
import { getLessons } from '@/api/lessons';
import { colors, spacing, typography } from '@/theme';
import type { LessonResponse } from '@/types/api';

interface TeacherDashboardStats {
  totalCourses: number;
  activeLessons: number;
  totalStudents: number;
  upcomingLessons: number;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export function TeacherHomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const isRTL = I18nManager.isRTL;

  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<LessonResponse[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [dashRes, lessonsRes] = await Promise.all([
        get<{ stats: TeacherDashboardStats; recentActivity: ActivityItem[] }>('/dashboard/teacher'),
        getLessons({ upcoming: true, limit: 5 }),
      ]);

      setStats(dashRes.stats ?? { totalCourses: 0, activeLessons: 0, totalStudents: 0, upcomingLessons: 0 });
      setActivity(dashRes.recentActivity ?? []);
      setUpcoming(lessonsRes.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const onRefresh = useCallback(() => fetchDashboard(true), [fetchDashboard]);

  const badgeVariant = (status: string) => {
    const map: Record<string, 'success' | 'info' | 'neutral' | 'error'> = {
      live: 'success', scheduled: 'info', completed: 'neutral', cancelled: 'error',
    };
    return map[status] ?? 'neutral';
  };

  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });

  if (loading) return <SafeAreaView style={s.container}><LoadingSpinner /></SafeAreaView>;
  if (error) return <SafeAreaView style={s.container}><ErrorState message={error} onRetry={() => fetchDashboard()} /></SafeAreaView>;

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView style={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        {/* Greeting */}
        <View style={s.header}>
          <Text style={[s.greeting, isRTL && s.rtl]}>{t('teacher.welcome', { name: user?.name ?? '' })}</Text>
          <Text style={[s.subtitle, isRTL && s.rtl]}>Here is your overview for today</Text>
        </View>

        {/* KPI Stats */}
        {stats && (
          <View style={s.statsGrid}>
            <StatCard label="Courses" value={stats.totalCourses} color={colors.primary} />
            <StatCard label="Active Lessons" value={stats.activeLessons} color={colors.info} />
            <StatCard label="Students" value={stats.totalStudents} color={colors.warning} />
            <StatCard label="Upcoming" value={stats.upcomingLessons} color={colors.success} />
          </View>
        )}

        {/* Quick Actions */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, isRTL && s.rtl]}>Quick Actions</Text>
          <View style={s.actionsRow}>
            <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('CreateCourse')}>
              <Text style={s.actionIcon}>+</Text>
              <Text style={s.actionLabel}>Create Course</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('CreateLesson')}>
              <Text style={s.actionIcon}>+</Text>
              <Text style={s.actionLabel}>New Lesson</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('TeacherAttendance')}>
              <Text style={s.actionIcon}>!</Text>
              <Text style={s.actionLabel}>Attendance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Lessons */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, isRTL && s.rtl]}>Upcoming Lessons</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TeacherCalendar')}>
              <Text style={s.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {upcoming.length === 0 ? (
            <View style={s.empty}><Text style={s.emptyText}>No upcoming lessons</Text></View>
          ) : (
            upcoming.map((lesson) => (
              <Card key={lesson.id} style={s.lessonCard} onPress={() => navigation.navigate('TeacherLessonDetail', { lessonId: lesson.id })}>
                <View style={s.lessonRow}>
                  <View style={s.lessonInfo}>
                    <Text style={s.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
                    <Text style={s.lessonMeta}>{fmtDate(lesson.startDateTime)} {fmtTime(lesson.startDateTime)}</Text>
                    <Text style={s.lessonCourse} numberOfLines={1}>{lesson.courseName}</Text>
                  </View>
                  <Badge label={lesson.status} variant={badgeVariant(lesson.status)} size="sm" />
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Recent Activity */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, isRTL && s.rtl]}>Recent Activity</Text>
          {activity.length === 0 ? (
            <View style={s.empty}><Text style={s.emptyText}>No recent activity</Text></View>
          ) : (
            activity.map((item) => (
              <View key={item.id} style={s.actItem}>
                <View style={[s.actDot, { backgroundColor: colors.primary }]} />
                <View style={s.actContent}>
                  <Text style={s.actMsg}>{item.message}</Text>
                  <Text style={s.actTime}>{fmtDate(item.timestamp)} {fmtTime(item.timestamp)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[s.statCard, { borderLeftColor: color }]}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  scroll: { flex: 1 },
  header: { paddingHorizontal: spacing.screen.horizontal, paddingTop: spacing.lg, paddingBottom: spacing.md },
  greeting: { ...typography.textStyles.h3, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { ...typography.textStyles.body, color: colors.textSecondary },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.screen.horizontal, gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: colors.background, borderRadius: spacing.borderRadius.lg, padding: spacing.card.padding, borderLeftWidth: 4, elevation: 2, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  statValue: { ...typography.textStyles.h3, color: colors.textPrimary },
  statLabel: { ...typography.textStyles.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  section: { paddingHorizontal: spacing.screen.horizontal, marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { ...typography.textStyles.h4, color: colors.textPrimary, marginBottom: spacing.md },
  seeAll: { ...typography.textStyles.link, marginBottom: spacing.md },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: spacing.borderRadius.lg, paddingVertical: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  actionIcon: { fontSize: 20, fontWeight: '700', color: colors.textInverse, marginBottom: spacing.xs },
  actionLabel: { ...typography.textStyles.buttonSmall, color: colors.textInverse, textAlign: 'center' },
  lessonCard: { marginBottom: spacing.sm, paddingHorizontal: spacing.card.padding },
  lessonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lessonInfo: { flex: 1, marginRight: spacing.sm },
  lessonTitle: { ...typography.textStyles.body, fontWeight: '600', color: colors.textPrimary },
  lessonMeta: { ...typography.textStyles.bodySmall, color: colors.textSecondary, marginTop: 2 },
  lessonCourse: { ...typography.textStyles.caption, color: colors.textTertiary, marginTop: 2 },
  actItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  actDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: spacing.sm },
  actContent: { flex: 1 },
  actMsg: { ...typography.textStyles.body, color: colors.textPrimary },
  actTime: { ...typography.textStyles.caption, color: colors.textTertiary, marginTop: 2 },
  empty: { paddingVertical: spacing['3xl'], alignItems: 'center' },
  emptyText: { ...typography.textStyles.body, color: colors.textTertiary },
});

export default TeacherHomeScreen;
