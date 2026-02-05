/**
 * API response types for Eduverse mobile application
 * Mapped to REST API endpoints
 */

import { User, Reel, ReelProgress, Lesson, Attendance, Assignment, AssignmentSubmission } from './models';

// Authentication requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
}

export interface OAuthRequest {
  provider: 'google';
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// Authentication responses
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SessionResponse {
  user: User;
  expires: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  expiresIn: number;
}

// User profile responses
export interface UserResponse extends User {}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  bio?: string;
}

// Reels responses
export interface ReelFeedItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number;
  subject: string | null;
  gradeLevel: string | null;
  teacherName: string;
  viewCount: number;
  progress: {
    watchedSeconds: number;
    isCompleted: boolean;
    isBookmarked: boolean;
  };
}

export interface ReelFeedResponse {
  data: ReelFeedItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ReelDetailResponse extends Reel {
  isBookmarked?: boolean;
  isUnderstood?: boolean;
  watchedSeconds?: number;
}

export interface UpdateReelProgressRequest {
  watchedSeconds: number;
  lastPosition: number;
}

export interface UpdateReelProgressResponse {
  id: string;
  reelId: string;
  watchedSeconds: number;
  isCompleted: boolean;
  lastPosition: number;
  updatedAt: string;
}

export interface BookmarkReelResponse {
  isBookmarked: boolean;
}

export interface MarkUnderstoodResponse {
  markedUnderstood: boolean;
  understoodAt: string;
}

// Dashboard responses
export interface DashboardStatsResponse {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalLessons: number;
  upcomingLessons: number;
  completedLessons: number;
  todayLessons: number;
  thisWeekLessons: number;
  activeEnrollments: number;
}

export interface AdminStatsResponse {
  userStats: {
    totalUsers: number;
    activeToday: number;
    newThisWeek: number;
  };
  contentStats: {
    totalReels: number;
    pendingReview: number;
    flaggedContent: number;
  };
  attendanceStats: {
    averageRate: number;
    todayRate: number;
  };
}

// Announcements responses
export interface AnnouncementResponse {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  targetAudience: string;
  isRead: boolean;
}

export interface AnnouncementsResponse {
  data: AnnouncementResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Lessons responses
export interface LessonResponse {
  id: string;
  title: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string;
  status: string;
  meetLink: string | null;
  courseName: string;
  teacherName: string;
}

export interface LessonsResponse {
  data: LessonResponse[];
}

// Attendance responses
export interface AttendanceSummary {
  totalLessons: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
}

export interface AttendanceRecord {
  id: string;
  lessonId: string;
  lessonTitle: string;
  date: string;
  status: string;
  joinedAt: string | null;
  durationMinutes: number;
}

export interface AttendanceResponse {
  summary: AttendanceSummary;
  records: AttendanceRecord[];
}

// Assignments responses
export interface AssignmentResponse {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  maxScore: number;
  courseName: string;
  submission: AssignmentSubmission | null;
}

export interface AssignmentsResponse {
  data: AssignmentResponse[];
}

// Parent-specific responses
export interface ChildResponse {
  id: string;
  name: string;
  email: string;
  image: string;
  gradeLevel: string;
}

export interface ChildrenResponse {
  children: ChildResponse[];
}

export interface ChildProgressResponse {
  student: User;
  enrollments: Array<{
    courseId: string;
    courseName: string;
    progressPercent: number;
    lastAccessed: string;
  }>;
  attendance: {
    overallRate: number;
    thisWeek: number;
    thisMonth: number;
  };
  recentGrades: Array<{
    assignmentTitle: string;
    score: number;
    maxScore: number;
    gradedAt: string;
  }>;
}

// Admin moderation responses
export interface FlaggedReelResponse {
  id: string;
  titleEn: string;
  status: string;
  flagReason: string;
  flaggedAt: string;
  flaggedBy: string;
}

export interface FlaggedReelsResponse {
  data: FlaggedReelResponse[];
}

export interface ModerateReelRequest {
  action: 'approve' | 'reject';
  reason: string;
}

export interface ModerateReelResponse {
  id: string;
  status: string;
  moderatedAt: string;
  moderatedBy: string;
}

// Push notifications
export interface RegisterDeviceRequest {
  token: string;
  platform: 'ios' | 'android';
  deviceId: string;
}

export interface RegisterDeviceResponse {
  registered: boolean;
}

export interface UpdateNotificationPreferencesRequest {
  pushEnabled?: boolean;
  classRemindersEnabled?: boolean;
  gradeUpdatesEnabled?: boolean;
  announcementsEnabled?: boolean;
}

// Generic API response wrapper
export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

// Pagination params
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Query params for various endpoints
export interface ReelFeedParams extends PaginationParams {
  subject?: string;
  gradeLevel?: string;
}

export interface LessonsParams extends PaginationParams {
  upcoming?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface AssignmentsParams extends PaginationParams {
  courseId?: string;
  due?: 'upcoming' | 'overdue' | 'all';
}

export interface AttendanceParams {
  userId?: string;
  courseId?: string;
  lessonId?: string;
}
