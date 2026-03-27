/**
 * ParentProfileScreen
 * Parent profile display, edit, children management, settings, logout
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, I18nManager, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { get, put } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

export function ParentProfileScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const isRTL = I18nManager.isRTL;

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [children, setChildren] = useState<any[]>([]);

  const fetchChildren = useCallback(async () => {
    try {
      const data = await get<any>(`/parents/${user?.id}/students`);
      setChildren(data.data || []);
    } catch (err) {
      console.error('Failed to fetch children:', err);
    }
  }, [user?.id]);

  useEffect(() => { fetchChildren(); }, [fetchChildren]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await put('/users', { name, phone });
      setEditing(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutConfirm', 'Logout?'),
      t('profile.logoutMessage', 'Are you sure you want to logout?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        { text: t('profile.logout', 'Logout'), style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || 'P').charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.nameText}>{user?.name}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
          <Text style={styles.roleText}>{t('parent.role', 'Parent')}</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {t('profile.info', 'Profile Information')}
            </Text>
            <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)}>
              <Text style={styles.editButton}>
                {editing ? (saving ? '...' : t('common.save', 'Save')) : t('common.edit', 'Edit')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('profile.name', 'Name')}</Text>
            {editing ? (
              <TextInput style={styles.input} value={name} onChangeText={setName} textAlign={isRTL ? 'right' : 'left'} />
            ) : (
              <Text style={[styles.fieldValue, isRTL && styles.textRTL]}>{user?.name}</Text>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('profile.email', 'Email')}</Text>
            <Text style={[styles.fieldValue, isRTL && styles.textRTL]}>{user?.email}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('profile.phone', 'Phone')}</Text>
            {editing ? (
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" textAlign={isRTL ? 'right' : 'left'} />
            ) : (
              <Text style={[styles.fieldValue, isRTL && styles.textRTL]}>{user?.phone || '-'}</Text>
            )}
          </View>
        </View>

        {/* Children */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            {t('parent.linkedChildren', 'Linked Children')}
          </Text>
          {children.map((child: any) => (
            <View key={child.id} style={styles.childRow}>
              <View style={styles.childAvatar}>
                <Text style={styles.childInitial}>{(child.name || '?').charAt(0)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childEmail}>{child.email}</Text>
              </View>
            </View>
          ))}
          {children.length === 0 && (
            <Text style={styles.emptyText}>{t('parent.noLinkedChildren', 'No linked children')}</Text>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('profile.logout', 'Logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: spacing.padding.md },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: colors.textInverse, fontSize: 32, fontWeight: '700' },
  nameText: { ...typography.textStyles.h3, color: colors.textPrimary },
  emailText: { color: colors.textSecondary, marginTop: 2 },
  roleText: { color: colors.primary, fontWeight: '600', marginTop: 4 },
  section: { backgroundColor: colors.background, borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { ...typography.textStyles.h4, color: colors.textPrimary },
  editButton: { color: colors.primary, fontWeight: '600' },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  fieldValue: { ...typography.textStyles.body, color: colors.textPrimary },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, fontSize: 15, color: colors.textPrimary },
  childRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  childAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.info, alignItems: 'center', justifyContent: 'center' },
  childInitial: { color: colors.textInverse, fontWeight: '700' },
  childName: { fontWeight: '600', color: colors.textPrimary },
  childEmail: { fontSize: 12, color: colors.textTertiary },
  emptyText: { color: colors.textTertiary, textAlign: 'center', paddingVertical: 12 },
  logoutButton: { backgroundColor: colors.error, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  logoutText: { color: colors.textInverse, fontWeight: '700', fontSize: 16 },
  textRTL: { textAlign: 'right' },
});

export default ParentProfileScreen;
