/**
 * AdminStudentsScreen
 * Student management list with search
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { get } from '@/api/client';
import { SearchBar } from '@/components/common/SearchBar';

export function AdminStudentsScreen() {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const [students, setStudents] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get<any>('/admin/users?role=student');
      const list = data.data || [];
      setStudents(list);
      setFiltered(list);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(students);
    } else {
      const q = search.toLowerCase();
      setFiltered(students.filter((s: any) =>
        (s.name || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q)
      ));
    }
  }, [search, students]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={[styles.row, isRTL && { flexDirection: 'row-reverse' }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.name || '?').charAt(0)}</Text>
        </View>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={[styles.name, isRTL && styles.textRTL]}>{item.name}</Text>
          <Text style={[styles.email, isRTL && styles.textRTL]}>{item.email}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: item.isActive !== false ? colors.success : colors.error }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>
          {t('admin.students', 'Students')} ({filtered.length})
        </Text>
      </View>
      <View style={styles.searchWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('admin.searchStudents', 'Search students...')}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStudents} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>{t('admin.noStudents', 'No students found')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { padding: spacing.padding.md, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { ...typography.textStyles.h2, color: colors.textPrimary },
  searchWrap: { padding: spacing.padding.sm, backgroundColor: colors.background },
  list: { padding: spacing.padding.sm },
  card: { backgroundColor: colors.background, borderRadius: 10, padding: 14, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.info, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.textInverse, fontWeight: '700', fontSize: 16 },
  name: { ...typography.textStyles.body, color: colors.textPrimary, fontWeight: '600' },
  email: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  emptyText: { color: colors.textTertiary },
  textRTL: { textAlign: 'right' },
});

export default AdminStudentsScreen;
