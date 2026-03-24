/**
 * API response types — extracted from mock data definitions during mock elimination.
 */

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export interface CourseUser {
  id: string
  name: string
  avatar?: string
  email?: string
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  content: string
  videoLink?: string
  materials: Material[]
  createdAt: Date
}

export interface Material {
  id: string
  name: string
  type: 'pdf' | 'video' | 'document' | 'image'
  url: string
}

export interface Assignment {
  id: string
  courseId: string
  title: string
  description: string
  dueDate: Date
  rubric?: string
  submissions: number
  createdAt: Date
}

export interface CourseExam {
  id: string
  courseId: string
  name: string
  schedule?: Date
  attempts: number
  status: 'active' | 'inactive'
}

export interface LiveClass {
  id: string
  courseId: string
  date: Date
  time: string
  duration: number
  meetingLink?: string
}

export interface CourseDetail {
  id: string
  title: string
  description: string
  category: string
  instructor: CourseUser
  enrollmentCount: number
  status: 'active' | 'inactive' | 'draft'
  thumbnail?: string
  meetingLink?: string
  lessons: Lesson[]
  assignments: Assignment[]
  exams: CourseExam[]
  liveClasses: LiveClass[]
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------------------------------
// Bundles
// ---------------------------------------------------------------------------

export interface BundleSubject {
  id: string
  bundleId: string
  name: string
  instructor: CourseUser
  meetingLink?: string
  liveCallStartTime?: string
}

export interface ScheduleEntry {
  id: string
  bundleId: string
  dayOfWeek: string
  time: string
  duration: number
}

export interface Fee {
  id: string
  bundleId: string
  amount: number
  dueDate: Date
  description?: string
}

export interface BundleStudent {
  id: string
  name: string
  email: string
  phone: string
  enrollmentDate: Date
  joinedDate: Date
  acceptedDate?: Date
  status: 'active' | 'inactive' | 'pending'
}

export interface BundleDetail {
  id: string
  name: string
  description: string
  category: string
  instructor: CourseUser
  status: 'active' | 'inactive'
  startDate: Date
  endDate: Date
  subjects: BundleSubject[]
  schedule: ScheduleEntry[]
  fees: Fee[]
  students: BundleStudent[]
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface DashboardMetrics {
  totalStudents: number
  totalTeachers: number
  totalRevenue: number
  pendingPayments: number
  dateRange?: { start: Date; end: Date }
}

export interface ChartDataPoint {
  label: string
  value: number
  timestamp?: Date
}

export interface DashboardChart {
  id: string
  title: string
  type: 'bar' | 'line' | 'pie' | 'area'
  data: ChartDataPoint[]
  xAxisLabel?: string
  yAxisLabel?: string
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface User {
  id: string
  avatar: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'teacher' | 'student' | 'parent'
  status: 'active' | 'inactive'
  registrationDate: Date
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export interface Payment {
  id: string
  studentName: string
  amount: number
  method: 'card' | 'bank_transfer' | 'cash'
  status: 'confirmed' | 'pending' | 'cancelled' | 'refunded'
  date: Date
  description?: string
}

export interface PaymentMetrics {
  totalConfirmed: number
  totalPending: number
  totalAmount: number
  totalCount: number
}

// ---------------------------------------------------------------------------
// Exams
// ---------------------------------------------------------------------------

export interface Exam {
  id: string
  name: string
  description: string
  schedule?: Date
  attemptsCount: number
  status: 'active' | 'inactive' | 'draft'
  createdAt: Date
}

// ---------------------------------------------------------------------------
// Quizzes
// ---------------------------------------------------------------------------

export interface Question {
  id: string
  quizId: string
  text: string
  type: 'multiple-choice' | 'short-answer' | 'essay'
  options?: string[]
  correctAnswer?: string
  points: number
}

export interface QuizAttempt {
  id: string
  quizId: string
  studentId: string
  studentName: string
  startedAt: Date
  completedAt?: Date
  score?: number
}

export interface QuizStatistics {
  totalResponses: number
  averageScore: number
  completionRate: number
  responsesByScore: Record<number, number>
  attempts: QuizAttempt[]
}

export interface Quiz {
  id: string
  name: string
  description: string
  category: string
  status: 'draft' | 'published'
  responseCount: number
  lastModified: Date
  createdAt: Date
}
