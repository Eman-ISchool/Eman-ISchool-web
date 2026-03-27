/**
 * Navigation types for Eduverse mobile application
 * Type-safe navigation parameters and routes for all roles
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

// ──────────────────────────────────────────────
// Shared screen params (used across multiple roles)
// ──────────────────────────────────────────────

export type CourseDetailParams = { courseId: string };
export type LessonDetailParams = { lessonId: string };
export type AssessmentTakeParams = { assessmentId: string };

// ──────────────────────────────────────────────
// Auth stack
// ──────────────────────────────────────────────

export type AuthStackParamList = {
  SignIn: undefined;
  BiometricUnlock: undefined;
};

// ──────────────────────────────────────────────
// Student navigation
// ──────────────────────────────────────────────

/** Screens inside the Student Home tab stack */
export type StudentHomeStackParamList = {
  StudentHome: undefined;
  CourseDetail: CourseDetailParams;
  LessonDetail: LessonDetailParams;
  AssessmentTake: AssessmentTakeParams;
};

/** Screens inside the Student Courses tab stack */
export type StudentCoursesStackParamList = {
  CoursesList: undefined;
  CourseDetail: CourseDetailParams;
  LessonDetail: LessonDetailParams;
};

/** Screens inside the Student Reels tab stack */
export type StudentReelsStackParamList = {
  StudentReels: undefined;
  ReelDetail: { reelId: string };
};

/** Full student stack (all reachable screens) */
export type StudentStackParamList = {
  StudentHome: undefined;
  StudentReels: undefined;
  ReelDetail: { reelId: string };
  StudentCalendar: undefined;
  StudentProfile: undefined;
  CourseDetail: CourseDetailParams;
  LessonDetail: LessonDetailParams;
  AssessmentTake: AssessmentTakeParams;
  CoursesList: undefined;
  Notifications: undefined;
  Support: undefined;
  Documents: undefined;
};

/** Student bottom tab param list */
export type StudentTabParamList = {
  Home: NavigatorScreenParams<StudentHomeStackParamList>;
  Courses: NavigatorScreenParams<StudentCoursesStackParamList>;
  Calendar: undefined;
  Reels: NavigatorScreenParams<StudentReelsStackParamList>;
  Profile: undefined;
};

// ──────────────────────────────────────────────
// Teacher navigation
// ──────────────────────────────────────────────

/** Screens inside the Teacher Home tab stack */
export type TeacherHomeStackParamList = {
  TeacherHome: undefined;
  CourseDetail: CourseDetailParams;
};

/** Screens inside the Teacher Courses tab stack */
export type TeacherCoursesStackParamList = {
  TeacherCoursesList: undefined;
  CourseDetail: CourseDetailParams;
  LessonDetail: LessonDetailParams;
  CreateLesson: { courseId: string };
  ManageAttendance: { lessonId: string };
};

/** Screens inside the Teacher Assessments tab stack */
export type TeacherAssessmentsStackParamList = {
  AssessmentList: undefined;
  AssessmentDetail: { assessmentId: string };
  SubmissionReview: { submissionId: string };
};

/** Full teacher stack (all reachable screens) */
export type TeacherStackParamList = {
  TeacherHome: undefined;
  TeacherCoursesList: undefined;
  CourseDetail: CourseDetailParams;
  LessonDetail: LessonDetailParams;
  CreateLesson: { courseId: string };
  ManageAttendance: { lessonId: string };
  TeacherCalendar: undefined;
  AssessmentList: undefined;
  AssessmentDetail: { assessmentId: string };
  SubmissionReview: { submissionId: string };
  TeacherProfile: undefined;
  TeacherClasses: undefined;
  ClassDetail: { classId: string };
  TeacherAttendance: undefined;
  TeacherSubmissions: undefined;
};

/** Teacher bottom tab param list */
export type TeacherTabParamList = {
  Home: NavigatorScreenParams<TeacherHomeStackParamList>;
  Courses: NavigatorScreenParams<TeacherCoursesStackParamList>;
  Calendar: undefined;
  Assessments: NavigatorScreenParams<TeacherAssessmentsStackParamList>;
  Profile: undefined;
};

// ──────────────────────────────────────────────
// Parent navigation
// ──────────────────────────────────────────────

/** Screens inside the Parent Home tab stack */
export type ParentHomeStackParamList = {
  ParentHome: undefined;
  ChildProgress: { childId: string };
};

/** Screens inside the Parent Courses tab stack */
export type ParentCoursesStackParamList = {
  ParentCoursesList: undefined;
  CourseDetail: CourseDetailParams;
};

/** Screens inside the Parent Support tab stack */
export type ParentSupportStackParamList = {
  TicketList: undefined;
  TicketDetail: { ticketId: string };
  CreateTicket: undefined;
};

/** Full parent stack (all reachable screens) */
export type ParentStackParamList = {
  ParentHome: undefined;
  ChildProgress: { childId: string };
  ParentCoursesList: undefined;
  CourseDetail: CourseDetailParams;
  ParentInvoices: undefined;
  TicketList: undefined;
  TicketDetail: { ticketId: string };
  CreateTicket: undefined;
  ParentProfile: undefined;
  ParentAnnouncements: undefined;
};

/** Parent bottom tab param list */
export type ParentTabParamList = {
  Home: NavigatorScreenParams<ParentHomeStackParamList>;
  Courses: NavigatorScreenParams<ParentCoursesStackParamList>;
  Invoices: undefined;
  Support: NavigatorScreenParams<ParentSupportStackParamList>;
  Profile: undefined;
};

// ──────────────────────────────────────────────
// Admin navigation
// ──────────────────────────────────────────────

/** Screens inside the Admin Home tab stack */
export type AdminHomeStackParamList = {
  AdminDashboard: undefined;
};

/** Screens inside the Admin Students tab stack */
export type AdminStudentsStackParamList = {
  AdminStudentList: undefined;
  AdminStudentDetail: { studentId: string };
};

/** Screens inside the Admin Courses tab stack */
export type AdminCoursesStackParamList = {
  AdminCourseList: undefined;
  AdminCourseDetail: CourseDetailParams;
};

/** Full admin stack (all reachable screens) */
export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminStudentList: undefined;
  AdminStudentDetail: { studentId: string };
  AdminCourseList: undefined;
  AdminCourseDetail: CourseDetailParams;
  AdminReports: undefined;
  AdminSettings: undefined;
  AdminModeration: undefined;
  AdminProfile: undefined;
};

/** Admin bottom tab param list */
export type AdminTabParamList = {
  Home: NavigatorScreenParams<AdminHomeStackParamList>;
  Students: NavigatorScreenParams<AdminStudentsStackParamList>;
  Courses: NavigatorScreenParams<AdminCoursesStackParamList>;
  Reports: undefined;
  Settings: undefined;
};

// ──────────────────────────────────────────────
// Root navigation
// ──────────────────────────────────────────────

/** Root stack that wraps auth and the role-based main navigator */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  StudentMain: NavigatorScreenParams<StudentTabParamList>;
  TeacherMain: NavigatorScreenParams<TeacherTabParamList>;
  ParentMain: NavigatorScreenParams<ParentTabParamList>;
  AdminMain: NavigatorScreenParams<AdminTabParamList>;
  // Shared modal screens accessible from any role
  Notifications: undefined;
  CourseDetail: CourseDetailParams;
  LessonDetail: LessonDetailParams;
  AssessmentTake: AssessmentTakeParams;
};

// Keep backward compatibility
export type MainTabParamList = {
  Student: NavigatorScreenParams<StudentStackParamList>;
  Teacher: NavigatorScreenParams<TeacherStackParamList>;
  Parent: NavigatorScreenParams<ParentStackParamList>;
  Admin: NavigatorScreenParams<AdminStackParamList>;
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
  | keyof TeacherTabParamList
  | keyof ParentTabParamList
  | keyof AdminTabParamList
  | keyof RootStackParamList;
