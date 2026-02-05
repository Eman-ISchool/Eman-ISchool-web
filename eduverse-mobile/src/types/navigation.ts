/**
 * Navigation parameter types for React Navigation
 * Type-safe navigation across all screens
 */

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Auth stack screens
export type AuthStackParamList = {
  SignIn: undefined;
  BiometricUnlock: undefined;
};

// Student tab screens
export type StudentTabParamList = {
  StudentHome: undefined;
  StudentReels: undefined;
  StudentCalendar: undefined;
  StudentProfile: undefined;
};

// Student stack screens
export type StudentStackParamList = {
  ReelDetail: {
    reelId: string;
  };
};

// Teacher tab screens
export type TeacherTabParamList = {
  TeacherHome: undefined;
  TeacherClasses: undefined;
  TeacherAttendance: undefined;
  TeacherSubmissions: undefined;
  TeacherProfile: undefined;
};

// Teacher stack screens
export type TeacherStackParamList = {
  ClassDetail: {
    classId: string;
  };
};

// Parent tab screens
export type ParentTabParamList = {
  ParentHome: undefined;
  ChildProgress: {
    childId: string;
  };
  ParentAnnouncements: undefined;
  ParentProfile: undefined;
};

// Admin tab screens
export type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminModeration: undefined;
  AdminProfile: undefined;
};

// Settings screens
export type SettingsParamList = {
  Settings: undefined;
  LanguageSettings: undefined;
};

// Root navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Combined main tabs (role-based)
export type MainTabParamList =
  | StudentTabParamList
  | TeacherTabParamList
  | ParentTabParamList
  | AdminTabParamList;

// Generic navigator screen params
export type NavigatorScreenParams<T extends object> = {
  screen: keyof T;
  params: T[keyof T];
};

// Navigation prop types
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type StudentTabNavigationProp = NativeStackNavigationProp<StudentTabParamList>;
export type TeacherTabNavigationProp = NativeStackNavigationProp<TeacherTabParamList>;
export type ParentTabNavigationProp = NativeStackNavigationProp<ParentTabParamList>;
export type AdminTabNavigationProp = NativeStackNavigationProp<AdminTabParamList>;
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
