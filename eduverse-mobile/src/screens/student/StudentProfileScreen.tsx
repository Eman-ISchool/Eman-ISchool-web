import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { LoadingSpinner, ErrorState, Button, Input, Modal } from '@/components/common';
import { Header } from '@/components/layout';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { getProfile, updateProfile, uploadAvatar, deleteAccount } from '@/api/users';
import type { User } from '@/types/models';
import { useLanguage } from '@/hooks/useLanguage';

export function StudentProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { language } = useLanguage();
  const { user, logout } = useAuthStore();
  const { settings, updateSettings } = useUserStore();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const profile = await getProfile();
      setName(profile.name);
      setPhone(profile.phone || '');
      setBio(profile.bio || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      setError(null);
      await updateProfile({ name, phone, bio });
      setEditMode(false);
      Alert.alert(t('profile.saved'), t('profile.savedMessage'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = useCallback(() => {
    setShowLogoutModal(false);
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'SignIn' as any }],
    });
  }, [logout, navigation]);

  const handleDeleteAccount = useCallback(async () => {
    if (!user) return;
    
    try {
      setShowDeleteModal(false);
      await deleteAccount();
      logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' as any }],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.deleteFailed'));
    }
  }, [user, logout, navigation, t]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          message={error}
          onRetry={loadProfile}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header
        title={t('profile.title')}
        showBackButton={false}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              {user?.image ? (
                <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              ) : (
                <Text style={styles.avatarText}>{user?.name.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
            
            <Input
              label={t('profile.name')}
              value={name}
              onChangeText={setName}
              editable={editMode}
              placeholder={t('profile.namePlaceholder')}
              style={styles.input}
            />
            
            <Input
              label={t('profile.phone')}
              value={phone}
              onChangeText={setPhone}
              editable={editMode}
              placeholder={t('profile.phonePlaceholder')}
              keyboardType="phone-pad"
              style={styles.input}
            />
            
            <Input
              label={t('profile.bio')}
              value={bio}
              onChangeText={setBio}
              editable={editMode}
              placeholder={t('profile.bioPlaceholder')}
              multiline
              numberOfLines={4}
              style={styles.input}
            />
          </View>

          <View style={styles.actions}>
            {editMode ? (
              <>
                <Button
                  title={t('common.save')}
                  onPress={handleSaveProfile}
                  loading={saving}
                  style={styles.actionButton}
                />
                <Button
                  title={t('common.cancel')}
                  onPress={() => setEditMode(false)}
                  variant="secondary"
                  style={styles.actionButton}
                />
              </>
            ) : (
              <Button
                title={t('profile.edit')}
                onPress={() => setEditMode(true)}
                style={styles.actionButton}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                // Navigate to language settings when implemented
                console.log('Navigate to language settings');
              }}
            >
              <Text style={styles.settingLabel}>{t('profile.language')}</Text>
              <Text style={styles.settingValue}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                // Navigate to notifications settings when implemented
                console.log('Navigate to notifications settings');
              }}
            >
              <Text style={styles.settingLabel}>{t('profile.notifications')}</Text>
              <Text style={styles.settingValue}>
                {settings.notificationsEnabled ? t('common.on') : t('common.off')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dangerZone}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={() => setShowLogoutModal(true)}
            >
              <Text style={styles.dangerButtonText}>{t('profile.logout')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={() => setShowDeleteModal(true)}
            >
              <Text style={styles.dangerButtonText}>{t('profile.deleteAccount')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showLogoutModal}
        title={t('profile.logout')}
        onClose={() => setShowLogoutModal(false)}
        footer={
          <>
            <Button
              title={t('common.cancel')}
              onPress={() => setShowLogoutModal(false)}
              variant="secondary"
              style={styles.modalButton}
            />
            <Button
              title={t('common.confirm')}
              onPress={handleLogout}
              style={styles.modalButton}
            />
          </>
        }
      >
        <Text style={styles.modalMessage}>{t('profile.logoutConfirmation')}</Text>
      </Modal>

      <Modal
        visible={showDeleteModal}
        title={t('profile.deleteAccount')}
        onClose={() => setShowDeleteModal(false)}
        footer={
          <>
            <Button
              title={t('common.cancel')}
              onPress={() => setShowDeleteModal(false)}
              variant="secondary"
              style={styles.modalButton}
            />
            <Button
              title={t('common.delete')}
              onPress={handleDeleteAccount}
              variant="danger"
              style={styles.modalButton}
            />
          </>
        }
      >
        <Text style={styles.modalMessage}>{t('profile.deleteAccountConfirmation')}</Text>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  actions: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  dangerZone: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 24,
  },
  dangerButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
  },
});
