/**
 * StudentAssessmentsScreen
 * List of all assessments/assignments for the student
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { get } from '@/api/client';
import type { Assignment } from '@/types/models';

export function StudentAssessmentsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const isRTL = I18nManager.isRTL;

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await get<any>('/assignments');
      setAssignments(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const getDueStatus = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    if (due < now) return { label: 'Overdue', color: colors.error };
    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 2) return { label: `${daysLeft}d left`, color: colors.warning };
    return { label: `${daysLeft}d left`, color: colors.success };
  };

  const renderItem = ({ item }: { item: any }) => {
    const status = getDueStatus(item.dueDate || item.due_date);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AssessmentTake', { assessmentId: item.id })}
        activeOpacity={0.7}
      >
        <View style={[styles.cardHeader, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, isRTL && styles.textRTL]} numberOfLines={2}>
              {item.title}
            </Text>
            {item.courseName && (
              <Text style={[styles.cardSubtitle, isRTL && styles.textRTL]}>{item.courseName}</Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <View style={[styles.cardFooter, isRTL && { flexDirection: 'row-reverse' }]}>
          <Text style={styles.metaText}>
            {t('assignments.maxScore', 'Max')}: {item.maxScore || item.max_score || '-'}
          </Text>
          <Text style={styles.metaText}>
            {new Date(item.dueDate || item.due_date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && assignments.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>
          {t('assignments.title', 'Assessments')}
        </Text>
      </View>
      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAssignments} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>{t('assignments.empty', 'No assessments yet')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { ...typography.textStyles.body, color: colors.textSecondary },
  header: { padding: spacing.padding.md, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { ...typography.textStyles.h2, color: colors.textPrimary },
  list: { padding: spacing.padding.md },
  card: { backgroundColor: colors.background, borderRadius: 12, padding: spacing.padding.md, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { ...typography.textStyles.h4, color: colors.textPrimary, flex: 1, marginRight: 8 },
  cardSubtitle: { ...typography.textStyles.caption, color: colors.textSecondary, marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borderLight },
  metaText: { ...typography.textStyles.caption, color: colors.textTertiary },
  emptyText: { ...typography.textStyles.body, color: colors.textTertiary },
  textRTL: { textAlign: 'right' },
});

export default StudentAssessmentsScreen;
