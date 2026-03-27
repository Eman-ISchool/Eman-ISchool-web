/**
 * StudentCourseDetailScreen
 * Course detail view with tabs: Info, Lessons, Assessments, Materials
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Linking,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { colors, spacing, typography } from '@/theme';
import { getCourseById, getCourseLessons } from '@/api/courses';
import { getMaterials } from '@/api/materials';
import { assignmentsApi } from '@/api/assignments';
import { Tabs, type TabItem } from '@/components/common/Tabs';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import type { LessonResponse } from '@/types/api';

type RouteParams = { StudentCourseDetail: { courseId: string } };

interface CourseDetail {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  subject: string | null;
  gradeLevel: string | null;
  teacherName?: string;
  schedule?: string;
  durationHours: number | null;
  maxStudents: number;
}

interface MaterialItem {
  id: string;
  title: string;
  type: string;
  url: string;
  fileSize?: number;
  createdAt: string;
}

interface AssessmentItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  maxScore: number;
  courseName: string;
  submission: { submittedAt: string; score: number | null } | null;
}

type TabKey = 'info' | 'lessons' | 'assessments' | 'materials';

export function StudentCourseDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'StudentCourseDetail'>>();
  const { courseId } = route.params;
  const isRTL = I18nManager.isRTL;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs: TabItem[] = [
    { key: 'info', label: t('profile.personalInfo') },
    { key: 'lessons', label: t('lessons.lessons') },
    { key: 'assessments', label: t('tabs.assessments') },
    { key: 'materials', label: 'Materials' },
  ];

  const fetchCourseData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [courseRes, lessonsRes, assessmentsRes, materialsRes] =
        await Promise.allSettled([
          getCourseById(courseId),
          getCourseLessons(courseId),
          assignmentsApi.getCourseAssignments(courseId),
          getMaterials({ courseId }),
        ]);

      if (courseRes.status === 'fulfilled') setCourse(courseRes.value?.data || courseRes.value);
      if (lessonsRes.status === 'fulfilled') {
        const d = lessonsRes.value?.data || lessonsRes.value || [];
        setLessons(Array.isArray(d) ? d : []);
      }
      if (assessmentsRes.status === 'fulfilled') {
        const d = assessmentsRes.value?.data || assessmentsRes.value || [];
        setAssessments(Array.isArray(d) ? d : []);
      }
      if (materialsRes.status === 'fulfilled') {
        const d = materialsRes.value?.data || materialsRes.value || [];
        setMaterials(Array.isArray(d) ? d : []);
      }
      if (courseRes.status === 'rejected') throw courseRes.reason;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unknownError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseId, t]);

  useEffect(() => { fetchCourseData(); }, [fetchCourseData]);

  const handleLessonPress = useCallback((lessonId: string) => {
    navigation.navigate('StudentLessonDetail', { lessonId });
  }, [navigation]);

  const handleAssessmentPress = useCallback((assessmentId: string) => {
    navigation.navigate('StudentAssessmentTake', { assessmentId });
  }, [navigation]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(isRTL ? 'ar' : 'en', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getLessonBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'success' | 'info' | 'neutral' | 'error' }> = {
      live: { label: t('lessons.live'), variant: 'success' },
      scheduled: { label: t('lessons.scheduled'), variant: 'info' },
      completed: { label: t('lessons.completed'), variant: 'neutral' },
      cancelled: { label: t('lessons.cancelled'), variant: 'error' },
    };
    return map[status] || { label: status, variant: 'neutral' as const };
  };

  const getAssessmentBadge = (item: AssessmentItem) => {
    if (item.submission?.score != null) return { label: t('assignments.graded'), variant: 'success' as const };
    if (item.submission) return { label: t('assignments.submitted'), variant: 'info' as const };
    if (new Date(item.dueDate) < new Date()) return { label: t('assignments.overdue'), variant: 'error' as const };
    return { label: t('assignments.pending'), variant: 'warning' as const };
  };

  const renderInfoTab = () => {
    if (!course) return null;
    return (
      <View style={styles.tabContent}>
        {course.imageUrl && <Image source={{ uri: course.imageUrl }} style={styles.heroImage} />}
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, isRTL && styles.textRTL]}>{t('profile.name')}</Text>
          <Text style={[styles.infoValue, isRTL && styles.textRTL]}>{course.title}</Text>
        </View>
        {course.description && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, isRTL && styles.textRTL]}>{t('profile.bio')}</Text>
            <Text style={[styles.infoValue, isRTL && styles.textRTL]}>{course.description}</Text>
          </View>
        )}
        {course.teacherName && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, isRTL && styles.textRTL]}>{t('lessons.teacher')}</Text>
            <Text style={[styles.infoValue, isRTL && styles.textRTL]}>{course.teacherName}</Text>
          </View>
        )}
        {course.subject && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, isRTL && styles.textRTL]}>{t('reels.subject')}</Text>
            <Badge label={course.subject} variant="info" />
          </View>
        )}
        {course.gradeLevel && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, isRTL && styles.textRTL]}>{t('reels.gradeLevel')}</Text>
            <Text style={[styles.infoValue, isRTL && styles.textRTL]}>{course.gradeLevel}</Text>
          </View>
        )}
        {course.durationHours != null && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, isRTL && styles.textRTL]}>{t('reels.duration')}</Text>
            <Text style={[styles.infoValue, isRTL && styles.textRTL]}>{course.durationHours}h</Text>
          </View>
        )}
        {course.schedule && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, isRTL && styles.textRTL]}>{t('lessons.viewSchedule')}</Text>
            <Text style={[styles.infoValue, isRTL && styles.textRTL]}>{course.schedule}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderLessonsTab = () => (
    <View style={styles.tabContent}>
      {lessons.length === 0 ? <EmptyState title={t('lessons.noLessons')} /> : lessons.map((lesson, i) => {
        const badge = getLessonBadge(lesson.status);
        return (
          <TouchableOpacity key={lesson.id} style={styles.listRow} onPress={() => handleLessonPress(lesson.id)} activeOpacity={0.7}>
            <View style={styles.lessonNum}><Text style={styles.lessonNumText}>{i + 1}</Text></View>
            <View style={styles.listRowInfo}>
              <Text style={[styles.listRowTitle, isRTL && styles.textRTL]} numberOfLines={2}>{lesson.title}</Text>
              <Text style={[styles.listRowSub, isRTL && styles.textRTL]}>{formatDate(lesson.startDateTime)}</Text>
              <Badge label={badge.label} variant={badge.variant} size="sm" />
            </View>
            {lesson.status === 'live' && lesson.meetLink && (
              <TouchableOpacity style={styles.joinBtn} onPress={() => Linking.openURL(lesson.meetLink!).catch(() => {})}>
                <Text style={styles.joinBtnText}>{t('lessons.join')}</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderAssessmentsTab = () => (
    <View style={styles.tabContent}>
      {assessments.length === 0 ? <EmptyState title={t('assignments.noAssignments')} /> : assessments.map((a) => {
        const badge = getAssessmentBadge(a);
        return (
          <TouchableOpacity key={a.id} style={styles.listRow} onPress={() => handleAssessmentPress(a.id)} activeOpacity={0.7}>
            <View style={styles.listRowInfo}>
              <Text style={[styles.listRowTitle, isRTL && styles.textRTL]} numberOfLines={1}>{a.title}</Text>
              <Text style={[styles.listRowSub, isRTL && styles.textRTL]}>{t('assignments.due')}: {formatDate(a.dueDate)}</Text>
              <View style={styles.badgeRow}>
                <Badge label={badge.label} variant={badge.variant} size="sm" />
                {a.submission?.score != null && <Text style={styles.scoreText}>{a.submission.score}/{a.maxScore}</Text>}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderMaterialsTab = () => (
    <View style={styles.tabContent}>
      {materials.length === 0 ? <EmptyState title={t('dashboard.noItems')} /> : materials.map((m) => (
        <TouchableOpacity key={m.id} style={styles.listRow} onPress={() => Linking.openURL(m.url).catch(() => {})} activeOpacity={0.7}>
          <View style={styles.matIcon}><Text style={styles.matIconText}>{m.type === 'pdf' ? 'PDF' : m.type === 'video' ? 'VID' : 'DOC'}</Text></View>
          <View style={styles.listRowInfo}>
            <Text style={[styles.listRowTitle, isRTL && styles.textRTL]} numberOfLines={1}>{m.title}</Text>
            <Text style={[styles.listRowSub, isRTL && styles.textRTL]}>{m.type.toUpperCase()}{m.fileSize ? ` - ${(m.fileSize / 1024).toFixed(0)} KB` : ''}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading && !refreshing) return <SafeAreaView style={styles.container}><LoadingSpinner /></SafeAreaView>;
  if (error && !course) return <SafeAreaView style={styles.container}><ErrorState message={error} onRetry={() => fetchCourseData()} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{isRTL ? '>' : '<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{course?.title || t('tabs.courses')}</Text>
        <View style={{ width: 44 }} />
      </View>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(k) => setActiveTab(k as TabKey)} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchCourseData(true)} tintColor={colors.primary} />}>
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'lessons' && renderLessonsTab()}
        {activeTab === 'assessments' && renderAssessmentsTab()}
        {activeTab === 'materials' && renderMaterialsTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.screen.horizontal, paddingVertical: spacing.md, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { padding: spacing.sm, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  backBtnText: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  headerTitle: { ...typography.textStyles.h4, flex: 1, textAlign: 'center' },
  tabContent: { padding: spacing.screen.horizontal },
  heroImage: { width: '100%', height: 200, borderRadius: spacing.borderRadius.lg, marginBottom: spacing.lg },
  infoRow: { marginBottom: spacing.lg },
  infoLabel: { ...typography.textStyles.label, marginBottom: spacing.xs },
  infoValue: { ...typography.textStyles.body, color: colors.textPrimary },
  listRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: spacing.borderRadius.lg, padding: spacing.card.padding, marginBottom: spacing.sm, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  lessonNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.backgroundTertiary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  lessonNumText: { ...typography.textStyles.bodySmall, fontWeight: '600', color: colors.textSecondary },
  listRowInfo: { flex: 1 },
  listRowTitle: { ...typography.textStyles.body, fontWeight: '500', color: colors.textPrimary, marginBottom: spacing.xs },
  listRowSub: { ...typography.textStyles.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs },
  joinBtn: { backgroundColor: colors.success, paddingHorizontal: spacing.padding.lg, paddingVertical: spacing.padding.sm, borderRadius: spacing.borderRadius.md },
  joinBtnText: { ...typography.textStyles.buttonSmall, color: colors.textInverse },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.gap.sm },
  scoreText: { ...typography.textStyles.bodySmall, fontWeight: '600', color: colors.primary },
  matIcon: { width: 44, height: 44, borderRadius: spacing.borderRadius.md, backgroundColor: colors.infoLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  matIconText: { ...typography.textStyles.bodySmall, fontWeight: '700', color: colors.info },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
});

export default StudentCourseDetailScreen;
