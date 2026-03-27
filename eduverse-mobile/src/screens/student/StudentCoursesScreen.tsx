/**
 * StudentCoursesScreen
 * List of enrolled courses with search, filter, pull-to-refresh
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '@/theme';
import { getCourses, type CoursesParams } from '@/api/courses';
import { SearchBar } from '@/components/common/SearchBar';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';

interface CourseItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  subject: string | null;
  gradeLevel: string | null;
  teacherName?: string;
  teacherId: string | null;
  progressPercent?: number;
  grade?: number | null;
  enrollmentStatus?: string;
}

interface CoursesResponse {
  data: CourseItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export function StudentCoursesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const isRTL = I18nManager.isRTL;

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);

  const fetchCourses = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params: CoursesParams = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedSubject) params.subjectId = selectedSubject;

      const response = await getCourses(params) as CoursesResponse;
      const courseData = response?.data || response || [];
      const courseList = Array.isArray(courseData) ? courseData : [];
      setCourses(courseList);

      // Extract unique subjects for filter
      const uniqueSubjects = [
        ...new Set(courseList.map((c: CourseItem) => c.subject).filter(Boolean)),
      ] as string[];
      setSubjects(uniqueSubjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unknownError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedSubject, t]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleRefresh = useCallback(() => {
    fetchCourses(true);
  }, [fetchCourses]);

  const handleCoursePress = useCallback(
    (courseId: string) => {
      navigation.navigate('StudentCourseDetail', { courseId });
    },
    [navigation],
  );

  const handleSubjectFilter = useCallback((subject: string | null) => {
    setSelectedSubject((prev) => (prev === subject ? null : subject));
  }, []);

  const filteredCourses = courses.filter((course) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        course.title.toLowerCase().includes(query) ||
        (course.subject && course.subject.toLowerCase().includes(query)) ||
        (course.teacherName && course.teacherName.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const renderCourseCard = useCallback(
    ({ item }: { item: CourseItem }) => {
      const progress = item.progressPercent ?? 0;

      return (
        <TouchableOpacity
          style={styles.courseCard}
          onPress={() => handleCoursePress(item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.courseCardInner, isRTL && styles.courseCardInnerRTL]}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.courseImage} />
            ) : (
              <View style={[styles.courseImage, styles.courseImagePlaceholder]}>
                <Text style={styles.courseImagePlaceholderText}>
                  {item.title.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.courseInfo}>
              <Text style={[styles.courseTitle, isRTL && styles.textRTL]} numberOfLines={2}>
                {item.title}
              </Text>
              {item.teacherName && (
                <Text style={[styles.courseTeacher, isRTL && styles.textRTL]} numberOfLines={1}>
                  {item.teacherName}
                </Text>
              )}
              {item.subject && (
                <Badge
                  label={item.subject}
                  variant="info"
                  size="sm"
                  style={styles.subjectBadge}
                />
              )}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(progress, 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
              {item.grade != null && (
                <Text style={styles.gradeText}>
                  {t('assignments.score')}: {item.grade}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handleCoursePress, isRTL, t],
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (error && courses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState message={error} onRetry={() => fetchCourses()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>
          {t('tabs.courses')}
        </Text>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t('common.search')}
        style={styles.searchBar}
      />

      {subjects.length > 0 && (
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            data={subjects}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
            inverted={isRTL}
            keyExtractor={(item) => item}
            renderItem={({ item: subject }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedSubject === subject && styles.filterChipActive,
                ]}
                onPress={() => handleSubjectFilter(subject)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedSubject === subject && styles.filterChipTextActive,
                  ]}
                >
                  {subject}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={renderCourseCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title={t('dashboard.noItems')}
            message={t('tabs.courses')}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    paddingHorizontal: spacing.screen.horizontal,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.textStyles.h3,
    color: colors.textPrimary,
  },
  searchBar: {
    marginHorizontal: spacing.screen.horizontal,
    marginBottom: spacing.sm,
  },
  filterContainer: {
    marginBottom: spacing.sm,
  },
  filterList: {
    paddingHorizontal: spacing.screen.horizontal,
    gap: spacing.gap.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.padding.lg,
    paddingVertical: spacing.padding.sm,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  listContent: {
    paddingHorizontal: spacing.screen.horizontal,
    paddingBottom: spacing['3xl'],
  },
  courseCard: {
    backgroundColor: colors.background,
    borderRadius: spacing.card.borderRadius,
    marginBottom: spacing.card.margin,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  courseCardInner: {
    flexDirection: 'row',
    padding: spacing.card.padding,
  },
  courseCardInnerRTL: {
    flexDirection: 'row-reverse',
  },
  courseImage: {
    width: 80,
    height: 80,
    borderRadius: spacing.borderRadius.md,
  },
  courseImagePlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseImagePlaceholderText: {
    ...typography.textStyles.h3,
    color: colors.textInverse,
  },
  courseInfo: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.md,
  },
  courseTitle: {
    ...typography.textStyles.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  courseTeacher: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  subjectBadge: {
    marginBottom: spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: spacing.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.full,
  },
  progressText: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    minWidth: 32,
    textAlign: 'right',
  },
  gradeText: {
    ...typography.textStyles.bodySmall,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xs,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default StudentCoursesScreen;
