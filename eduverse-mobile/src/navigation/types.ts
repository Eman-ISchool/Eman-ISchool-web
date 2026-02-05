/**
 * Navigation types for Eduverse mobile application
 * Type-safe navigation parameters and routes
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

// Auth stack screens
export type AuthStackParamList = {
  SignIn: undefined;
  BiometricUnlock: undefined;
};

// Student stack screens
export type StudentStackParamList = {
  StudentHome: undefined;
  StudentReels: undefined;
  ReelDetail: { reelId: string };
  StudentCalendar: undefined;
  StudentProfile: undefined;
};

// Teacher stack screens
export type TeacherStackParamList = {
  TeacherHome: undefined;
  TeacherClasses: undefined;
  ClassDetail: { classId: string };
  TeacherAttendance: undefined;
  TeacherSubmissions: undefined;
  TeacherProfile: undefined;
};

// Parent stack screens
export type ParentStackParamList = {
  ParentHome: undefined;
  ChildProgress: { childId: string };
  ParentAnnouncements: undefined;
  ParentProfile: undefined;
};

// Admin stack screens
export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminModeration: undefined;
  AdminProfile: undefined;
};

// Root stack screens
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Main tab navigator
export type MainTabParamList = {
  Student: NavigatorScreenParams<StudentStackParamList>;
  Teacher: NavigatorScreenParams<TeacherStackParamList>;
  Parent: NavigatorScreenParams<ParentStackParamList>;
  Admin: NavigatorScreenParams<AdminStackParamList>;
};

// Student tab navigator
export type StudentTabParamList = {
  Home: undefined;
  Reels: undefined;
  Calendar: undefined;
  Profile: undefined;
};

// Global navigation type
export type RootNavigation = any;

// Screen names for type-safe navigation
export type ScreenName =
  | keyof AuthStackParamList
  | keyof StudentStackParamList
  | keyof TeacherStackParamList
  | keyof ParentStackParamList
  | keyof AdminStackParamList
  | keyof StudentTabParamList
  | keyof MainTabParamList
  | keyof RootStackParamList;
