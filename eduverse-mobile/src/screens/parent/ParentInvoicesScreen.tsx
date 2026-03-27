/**
 * ParentInvoicesScreen
 * Invoice list with payment status and pay action
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, I18nManager, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { get, post } from '@/api/client';

export function ParentInvoicesScreen() {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get<any>('/invoices');
      setInvoices(data.data || []);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handlePay = async (invoice: any) => {
    try {
      const data = await post<any>('/payments/checkout', {
        checkouts: [{ enrollmentId: invoice.enrollmentId, courseId: invoice.courseId, studentId: invoice.studentId }],
      });
      if (data.url) {
        await Linking.openURL(data.url);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to start payment');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return { bg: colors.successLight, text: colors.success };
      case 'pending': return { bg: colors.warningLight, text: colors.warning };
      case 'overdue': return { bg: colors.errorLight, text: colors.error };
      default: return { bg: colors.backgroundTertiary, text: colors.textTertiary };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const s = getStatusStyle(item.status);
    return (
      <View style={styles.card}>
        <View style={[styles.cardRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, isRTL && styles.textRTL]} numberOfLines={1}>
              {item.description || item.title || 'Invoice'}
            </Text>
            <Text style={[styles.cardDate, isRTL && styles.textRTL]}>
              {new Date(item.created_at || item.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.amount}>
              {item.currency || 'AED'} {(item.amount || 0).toLocaleString()}
            </Text>
            <View style={[styles.badge, { backgroundColor: s.bg }]}>
              <Text style={[styles.badgeText, { color: s.text }]}>{item.status}</Text>
            </View>
          </View>
        </View>
        {item.status === 'pending' && (
          <TouchableOpacity style={styles.payButton} onPress={() => handlePay(item)}>
            <Text style={styles.payText}>{t('parent.payNow', 'Pay Now')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>
          {t('parent.invoices', 'Invoices')}
        </Text>
      </View>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchInvoices} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>{t('parent.noInvoices', 'No invoices')}</Text>
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
  list: { padding: spacing.padding.md },
  card: { backgroundColor: colors.background, borderRadius: 12, padding: 16, marginBottom: 12 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { ...typography.textStyles.body, color: colors.textPrimary, fontWeight: '600' },
  cardDate: { fontSize: 12, color: colors.textTertiary, marginTop: 4 },
  amount: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  payButton: { backgroundColor: colors.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  payText: { color: colors.textInverse, fontWeight: '600' },
  emptyText: { color: colors.textTertiary },
  textRTL: { textAlign: 'right' },
});

export default ParentInvoicesScreen;
