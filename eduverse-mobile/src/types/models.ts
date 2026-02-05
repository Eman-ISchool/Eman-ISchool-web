/**
 * Domain model types for Eduverse mobile application
 * Mapped directly to existing Supabase database schema
 */

export type UserRole = 'student' | 'teacher' | 'admin' | 'parent';

export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: UserRole;
  googleId: string | null;
  phone: string | null;
  bio: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ReelStatus = 'draft' | 'pending_review' | 'published' | 'unpublished' | 'rejected';

export interface Reel {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number;
  status: ReelStatus;
  teacherId: string;
  subject: string | null;
  gradeLevel: string | null;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReelProgress {
  id: string;
  reelId: string;
  studentId: string;
  watchedSeconds: number;
  isCompleted: boolean;
  isSaved: boolean;
  isBookmarked: boolean;
  markedUnderstood: boolean;
  understoodAt: string | null;
  replayCount: number;
  lastPosition: number;
  lastWatchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  durationHours: number | null;
  imageUrl: string | null;
  subject: string | null;
  gradeLevel: string | null;
  teacherId: string | null;
  isPublished: boolean;
  maxStudents: number;
  createdAt: string;
  updatedAt: string;
}

export type LessonStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string;
  meetLink: string | null;
  status: LessonStatus;
  courseId: string | null;
  teacherId: string | null;
  recordingUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'early_exit';

export interface Attendance {
  id: string;
  lessonId: string;
  userId: string;
  status: AttendanceStatus;
  joinedAt: string | null;
  leftAt: string | null;
  durationMinutes: number;
  isTeacher: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  dueDate: string;
  maxScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  score: number | null;
  feedback: string | null;
  gradedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EnrollmentStatus = 'active' | 'completed' | 'dropped' | 'pending';

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  progressPercent: number;
  lastAccessed: string | null;
  completedAt: string | null;
}

export interface ParentChild {
  id: string;
  parentId: string;
  childId: string;
  createdAt: string;
}

export type NotificationType =
  | 'class_reminder'
  | 'grade_update'
  | 'announcement'
  | 'cancellation'
  | 'assignment_due'
  | 'exam_reminder';

export type NotificationChannel = 'email' | 'push' | 'sms' | 'in_app';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  digestFrequency: 'instant' | 'daily' | 'weekly';
  quietHoursEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  timezone: string;
  classRemindersEnabled: boolean;
  gradeUpdatesEnabled: boolean;
  announcementsEnabled: boolean;
  cancellationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mobile-specific types
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  biometricsEnabled: boolean;
  lastAuthTime: string | null;
}

export type SupportedLanguage = 'ar' | 'en' | 'fr';

export interface AppSettings {
  language: SupportedLanguage;
  biometricsEnabled: boolean;
  notificationsEnabled: boolean;
  autoPlayVideos: boolean;
  videoQuality: 'auto' | 'high' | 'medium' | 'low';
  pushToken: string | null;
}

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: 'wifi' | 'cellular' | 'none' | 'unknown';
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  retryable: boolean;
}
