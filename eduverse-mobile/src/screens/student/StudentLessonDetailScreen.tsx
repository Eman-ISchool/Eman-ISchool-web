/**
 * StudentLessonDetailScreen
 * Lesson detail with meeting join, materials, homework
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Linking, I18nManager, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { get, post } from '@/api/client';
import type { Lesson } from '@/types/models';

export function StudentLessonDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { lessonId } = route.params || {};
  const isRTL = I18nManager.isRTL;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const fetchLesson = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await get<any>(`/lessons/${lessonId}`);
      setLesson(data.data || data);
      const mats = await get<any>(`/lessons/${lessonId}/materials`).catch(() => ({ data: [] }));
      setMaterials(mats.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => { fetchLesson(); }, [fetchLesson]);

  const handleJoinMeeting = async () => {
    if (!lesson?.meetLink) return;
    try {
      setJoining(true);
      await post(`/lessons/${lessonId}/join`, {});
      await Linking.openURL(lesson.meetLink);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to join lesson');
    } finally {
      setJoining(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return colors.success;
      case 'scheduled': return colors.info;
      case 'completed': return colors.textSecondary;
      case 'cancelled': return colors.error;
      default: return colors.textTertiary;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || 'Lesson not found'}</Text>
          <TouchableOpacity onPress={fetchLesson} style={styles.retryButton}>
            <Text style={styles.retryText}>{t('common.retry', 'Retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchLesson} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{isRTL ? '→' : '←'} {t('common.back', 'Back')}</Text>
        </TouchableOpacity>

        {/* Lesson Info */}
        <View style={styles.card}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lesson.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(lesson.status) }]}>
              {lesson.status.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{lesson.title}</Text>
          {lesson.description && (
            <Text style={[styles.description, isRTL && styles.textRTL]}>{lesson.description}</Text>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('lessons.date', 'Date')}:</Text>
            <Text style={styles.metaValue}>{formatDate(lesson.startDateTime)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('lessons.time', 'Time')}:</Text>
            <Text style={styles.metaValue}>
              {formatTime(lesson.startDateTime)} - {formatTime(lesson.endDateTime)}
            </Text>
          </View>
        </View>

        {/* Join Meeting Button */}
        {lesson.status === 'live' && lesson.meetLink && (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinMeeting}
            disabled={joining}
          >
            <Text style={styles.joinText}>
              {joining ? t('lessons.joining', 'Joining...') : t('lessons.joinMeeting', 'Join Meeting')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Materials Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            {t('lessons.materials', 'Materials')}
          </Text>
          {materials.length === 0 ? (
            <Text style={styles.emptyText}>{t('lessons.noMaterials', 'No materials available')}</Text>
          ) : (
            materials.map((mat: any) => (
              <TouchableOpacity key={mat.id} style={styles.materialItem}>
                <Text style={styles.materialIcon}>📄</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.materialTitle, isRTL && styles.textRTL]}>{mat.title}</Text>
                  <Text style={styles.materialType}>{mat.type}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.padding.lg },
  loadingText: { ...typography.textStyles.body, color: colors.textSecondary },
  errorText: { ...typography.textStyles.body, color: colors.error, textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: colors.textInverse, fontWeight: '600' },
  scrollContent: { padding: spacing.padding.md },
  backButton: { paddingVertical: 8, marginBottom: 8 },
  backText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  card: { backgroundColor: colors.background, borderRadius: 12, padding: spacing.padding.lg, marginBottom: 16 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  title: { ...typography.textStyles.h2, color: colors.textPrimary, marginBottom: 8 },
  description: { ...typography.textStyles.body, color: colors.textSecondary, marginBottom: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metaLabel: { ...typography.textStyles.body, color: colors.textSecondary },
  metaValue: { ...typography.textStyles.body, color: colors.textPrimary, fontWeight: '600' },
  joinButton: { backgroundColor: colors.success, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16, minHeight: 52 },
  joinText: { color: colors.textInverse, fontSize: 18, fontWeight: '700' },
  section: { backgroundColor: colors.background, borderRadius: 12, padding: spacing.padding.lg, marginBottom: 16 },
  sectionTitle: { ...typography.textStyles.h3, color: colors.textPrimary, marginBottom: 12 },
  emptyText: { ...typography.textStyles.body, color: colors.textTertiary, textAlign: 'center', paddingVertical: 16 },
  materialItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  materialIcon: { fontSize: 24, marginRight: 12 },
  materialTitle: { ...typography.textStyles.body, color: colors.textPrimary, fontWeight: '500' },
  materialType: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  textRTL: { textAlign: 'right' },
});

export default StudentLessonDetailScreen;
