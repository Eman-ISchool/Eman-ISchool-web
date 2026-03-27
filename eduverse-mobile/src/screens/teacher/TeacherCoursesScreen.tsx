/**
 * TeacherCoursesScreen
 * Lists teacher's courses with search, pull-to-refresh, and a FAB.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TextInput, TouchableOpacity, I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { LoadingSpinner, ErrorState, EmptyState, Card, Badge } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { getCourses } from '@/api/courses';
import { colors, spacing, typography } from '@/theme';
import type { Course } from '@/types/models';

export function TeacherCoursesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const isRTL = I18nManager.isRTL;

  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      setError(null);
      const res = await getCourses({ teacherId: user?.id });
      const list: Course[] = res?.data ?? res ?? [];
      setCourses(list);
      applySearch(list, search);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally { setLoading(false); setRefreshing(false); }
  }, [user?.id, search]);

  useEffect(() => { fetchCourses(); }, []);

  const applySearch = (list: Course[], q: string) => {
    if (!q.trim()) { setFiltered(list); return; }
    const lq = q.toLowerCase();
    setFiltered(list.filter(c =>
      c.title.toLowerCase().includes(lq) ||
      (c.subject ?? '').toLowerCase().includes(lq)
    ));
  };

  const handleSearch = (text: string) => { setSearch(text); applySearch(courses, text); };

  const renderCourse = ({ item }: { item: Course }) => (
    <Card style={st.courseCard} onPress={() => navigation.navigate('TeacherCourseDetail', { courseId: item.id })}>
      <View style={st.cardBody}>
        <View style={st.cardTop}>
          <Text style={[st.courseTitle, isRTL && st.rtl]} numberOfLines={1}>{item.title}</Text>
          <Badge label={item.isPublished ? 'Published' : 'Draft'} variant={item.isPublished ? 'success' : 'warning'} size="sm" />
        </View>
        <View style={st.metaRow}>
          {item.gradeLevel && <Text style={st.metaText}>Grade: {item.gradeLevel}</Text>}
          {item.subject && <Text style={st.metaText}>Subject: {item.subject}</Text>}
        </View>
        <View style={st.cardBottom}>
          <Text style={st.studentCount}>{item.maxStudents} max students</Text>
          <Text style={st.priceText}>{item.price > 0 ? `$${item.price}` : 'Free'}</Text>
        </View>
      </View>
    </Card>
  );

  if (loading) return <SafeAreaView style={st.container}><LoadingSpinner /></SafeAreaView>;
  if (error) return <SafeAreaView style={st.container}><ErrorState message={error} onRetry={() => fetchCourses()} /></SafeAreaView>;

  return (
    <SafeAreaView style={st.container} edges={['bottom']}>
      <View style={st.searchWrap}>
        <TextInput style={[st.searchInput, isRTL && st.rtl]} placeholder="Search courses..." placeholderTextColor={colors.textTertiary} value={search} onChangeText={handleSearch} returnKeyType="search" />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderCourse}
        contentContainerStyle={st.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchCourses(true)} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState title="No Courses" message="Create your first course to get started." actionLabel="Create Course" onAction={() => navigation.navigate('CreateCourse')} />}
      />
      <TouchableOpacity style={st.fab} activeOpacity={0.85} onPress={() => navigation.navigate('CreateCourse')}>
        <Text style={st.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  searchWrap: { paddingHorizontal: spacing.screen.horizontal, paddingVertical: spacing.sm, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchInput: { ...typography.textStyles.body, backgroundColor: colors.backgroundTertiary, borderRadius: spacing.borderRadius.md, paddingHorizontal: spacing.input.paddingHorizontal, paddingVertical: spacing.input.paddingVertical, minHeight: 44 },
  listContent: { padding: spacing.screen.horizontal, paddingBottom: 80 },
  courseCard: { marginBottom: spacing.md, paddingHorizontal: spacing.card.padding },
  cardBody: { gap: spacing.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  courseTitle: { ...typography.textStyles.body, fontWeight: '600', color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  metaRow: { flexDirection: 'row', gap: spacing.md },
  metaText: { ...typography.textStyles.bodySmall, color: colors.textSecondary },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  studentCount: { ...typography.textStyles.caption, color: colors.textTertiary },
  priceText: { ...typography.textStyles.body, fontWeight: '600', color: colors.primary },
  fab: { position: 'absolute', bottom: 32, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  fabIcon: { fontSize: 28, fontWeight: '400', color: colors.textInverse, lineHeight: 30 },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});

export default TeacherCoursesScreen;
