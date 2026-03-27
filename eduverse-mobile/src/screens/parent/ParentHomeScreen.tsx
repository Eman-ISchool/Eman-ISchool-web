/**
 * ParentHomeScreen
 * Dashboard showing children overview, stats, and recent activity
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
import { useAuthStore } from '@/store/authStore';

export function ParentHomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const isRTL = I18nManager.isRTL;

  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get<any>(`/parents/${user?.id}/children/summary`);
      setChildren(data.data || data.children || []);
    } catch (err) {
      console.error('Failed to fetch children:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.greeting, isRTL && styles.textRTL]}>
          {t('parent.welcome', 'Welcome')}, {user?.name || ''}
        </Text>
        <Text style={[styles.subGreeting, isRTL && styles.textRTL]}>
          {t('parent.childrenOverview', "Here's how your children are doing")}
        </Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{children.length}</Text>
            <Text style={styles.statLabel}>{t('parent.children', 'Children')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.info }]}>
              {children.reduce((sum: number, c: any) => sum + (c.coursesCount || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>{t('parent.activeCourses', 'Courses')}</Text>
          </View>
        </View>

        {/* Children List */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          {t('parent.myChildren', 'My Children')}
        </Text>

        {children.length === 0 && !loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('parent.noChildren', 'No linked children')}</Text>
          </View>
        ) : (
          children.map((child: any, index: number) => (
            <TouchableOpacity
              key={child.id || index}
              style={styles.childCard}
              onPress={() => navigation.navigate('ChildProgress', { childId: child.id })}
              activeOpacity={0.7}
            >
              <View style={styles.childAvatar}>
                <Text style={styles.childInitial}>
                  {(child.name || 'S').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.childName, isRTL && styles.textRTL]}>{child.name}</Text>
                <Text style={[styles.childGrade, isRTL && styles.textRTL]}>
                  {child.grade || child.gradeName || t('parent.student', 'Student')}
                </Text>
              </View>
              <Text style={styles.chevron}>{isRTL ? '‹' : '›'}</Text>
            </TouchableOpacity>
          ))
        )}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          {t('parent.quickActions', 'Quick Actions')}
        </Text>
        <View style={styles.actionsRow}>
          {[
            { label: t('parent.viewCourses', 'Courses'), icon: '📚', screen: 'Courses' },
            { label: t('parent.invoices', 'Invoices'), icon: '💳', screen: 'Invoices' },
            { label: t('parent.support', 'Support'), icon: '💬', screen: 'Support' },
          ].map((action) => (
            <TouchableOpacity
              key={action.screen}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
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
  header: { backgroundColor: colors.primary, padding: spacing.padding.lg, paddingBottom: 24 },
  greeting: { ...typography.textStyles.h2, color: colors.textInverse },
  subGreeting: { ...typography.textStyles.body, color: colors.textInverse, opacity: 0.85, marginTop: 4 },
  scrollContent: { padding: spacing.padding.md },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  sectionTitle: { ...typography.textStyles.h3, color: colors.textPrimary, marginBottom: 12, marginTop: 8 },
  emptyCard: { backgroundColor: colors.background, borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText: { color: colors.textTertiary },
  childCard: { backgroundColor: colors.background, borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  childAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  childInitial: { color: colors.textInverse, fontSize: 20, fontWeight: '700' },
  childName: { ...typography.textStyles.body, color: colors.textPrimary, fontWeight: '600' },
  childGrade: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 24, color: colors.textTertiary },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 16, alignItems: 'center' },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' },
  textRTL: { textAlign: 'right' },
});

export default ParentHomeScreen;
