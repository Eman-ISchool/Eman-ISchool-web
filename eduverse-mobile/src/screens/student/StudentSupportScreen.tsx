/**
 * StudentSupportScreen
 * Support ticket list and creation
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, I18nManager, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { get, post } from '@/api/client';

export function StudentSupportScreen() {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get<any>('/support/tickets');
      setTickets(data.data || []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleCreate = async () => {
    if (!newSubject.trim() || !newMessage.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      setCreating(true);
      await post('/support/tickets', { subject: newSubject, message: newMessage, category: 'general' });
      setNewSubject('');
      setNewMessage('');
      setShowCreate(false);
      fetchTickets();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'open': return { bg: colors.infoLight, text: colors.info };
      case 'in_progress': return { bg: colors.warningLight, text: colors.warning };
      case 'resolved': case 'closed': return { bg: colors.successLight, text: colors.success };
      default: return { bg: colors.backgroundTertiary, text: colors.textTertiary };
    }
  };

  const renderTicket = ({ item }: { item: any }) => {
    const s = getStatusStyle(item.status);
    return (
      <TouchableOpacity style={styles.ticketCard} activeOpacity={0.7}>
        <View style={[styles.ticketHeader, isRTL && { flexDirection: 'row-reverse' }]}>
          <Text style={[styles.ticketSubject, isRTL && styles.textRTL, { flex: 1 }]} numberOfLines={1}>
            {item.subject}
          </Text>
          <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Text style={[styles.badgeText, { color: s.text }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={[styles.ticketDate, isRTL && styles.textRTL]}>
          {new Date(item.created_at || item.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>
          {t('support.title', 'Support')}
        </Text>
        <TouchableOpacity onPress={() => setShowCreate(!showCreate)} style={styles.addButton}>
          <Text style={styles.addText}>{showCreate ? '✕' : '+'}</Text>
        </TouchableOpacity>
      </View>

      {showCreate && (
        <View style={styles.createForm}>
          <TextInput
            style={[styles.input, isRTL && styles.textRTL]}
            placeholder={t('support.subject', 'Subject')}
            placeholderTextColor={colors.textTertiary}
            value={newSubject}
            onChangeText={setNewSubject}
            textAlign={isRTL ? 'right' : 'left'}
          />
          <TextInput
            style={[styles.input, styles.textArea, isRTL && styles.textRTL]}
            placeholder={t('support.message', 'Describe your issue...')}
            placeholderTextColor={colors.textTertiary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            numberOfLines={4}
            textAlign={isRTL ? 'right' : 'left'}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.submitButton, creating && { opacity: 0.6 }]}
            onPress={handleCreate}
            disabled={creating}
          >
            <Text style={styles.submitText}>
              {creating ? t('common.sending', 'Sending...') : t('support.submit', 'Submit Ticket')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={renderTicket}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTickets} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>{t('support.empty', 'No support tickets')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { padding: spacing.padding.md, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { ...typography.textStyles.h2, color: colors.textPrimary },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  addText: { color: colors.textInverse, fontSize: 20, fontWeight: '700' },
  createForm: { backgroundColor: colors.background, padding: spacing.padding.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  input: { backgroundColor: colors.backgroundSecondary, borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 15, color: colors.textPrimary },
  textArea: { minHeight: 80 },
  submitButton: { backgroundColor: colors.primary, padding: 14, borderRadius: 8, alignItems: 'center' },
  submitText: { color: colors.textInverse, fontWeight: '600', fontSize: 15 },
  list: { padding: spacing.padding.md },
  ticketCard: { backgroundColor: colors.background, borderRadius: 10, padding: 14, marginBottom: 8 },
  ticketHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  ticketSubject: { ...typography.textStyles.body, color: colors.textPrimary, fontWeight: '600' },
  ticketDate: { fontSize: 12, color: colors.textTertiary },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  emptyText: { ...typography.textStyles.body, color: colors.textTertiary },
  textRTL: { textAlign: 'right' },
});

export default StudentSupportScreen;
