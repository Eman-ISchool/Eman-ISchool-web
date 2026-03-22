/**
 * Mock Data Factory Functions
 * 
 * This module exports all mock data generators for the admin dashboard.
 * All mock data is designed to match the shape of live API responses.
 * 
 * Usage:
 * ```typescript
 * import { mockCourses, mockCourseDetail } from '@/lib/mock-data'
 * 
 * // Get all courses
 * const courses = mockCourses
 * 
 * // Get specific course detail
 * const course = mockCourseDetail('course-1')
 * ```
 */

export { mockDashboardMetrics, mockDashboardCharts } from './dashboard-data'
export { mockCourses, mockCourseDetail } from './courses-data'
export { mockBundles, mockBundleDetail } from './bundles-data'
export { mockCategories } from './categories-data'
export { mockExams } from './exams-data'
export { mockQuizzes, mockQuizDetail, mockQuizStatistics } from './quizzes-data'
export { mockUsers } from './users-data'
export { mockApplications } from './applications-data'
export { mockLookups, mockLookupItems } from './lookups-data'
export { mockPayments, mockPaymentMetrics } from './payments-data'
export { mockMessages } from './messages-data'
export { mockSidebarData } from './sidebar-data'
