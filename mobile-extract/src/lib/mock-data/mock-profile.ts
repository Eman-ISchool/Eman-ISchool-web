export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  avatarUrl?: string;
  locale: 'ar' | 'en';
  createdAt: string;
  lastLoginAt?: string;
}

export interface ProfileSettings {
  notificationEmail: boolean;
  notificationPush: boolean;
  notificationSms: boolean;
  language: 'ar' | 'en';
  timezone: string;
  theme: 'light' | 'dark' | 'system';
}

export interface ProfileWithSettings extends UserProfile {
  settings: ProfileSettings;
}

export const mockUserProfile: UserProfile = {
  id: 'user-1',
  name: 'أحمد محمد',
  email: 'ahmed@example.com',
  phone: '791234567',
  countryCode: '962',
  role: 'student',
  avatarUrl: '/images/avatars/user-1.jpg',
  locale: 'ar',
  createdAt: '2024-01-01',
  lastLoginAt: '2024-04-04T08:00:00',
};

export const mockProfileSettings: ProfileSettings = {
  notificationEmail: true,
  notificationPush: true,
  notificationSms: false,
  language: 'ar',
  timezone: 'Asia/Amman',
  theme: 'light',
};

export const mockProfileWithSettings: ProfileWithSettings = {
  ...mockUserProfile,
  settings: mockProfileSettings,
};

