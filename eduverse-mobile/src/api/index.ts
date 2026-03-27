/**
 * API module exports
 * Centralized export point for all API modules
 */

export { authApi, default as auth } from './auth';
export { usersApi, default as users } from './users';
export { reelsApi, default as reels } from './reels';
export { dashboardApi, default as dashboard } from './dashboard';
export { announcementsApi, default as announcements } from './announcements';
export { lessonsApi, default as lessons } from './lessons';
export { assignmentsApi, default as assignments } from './assignments';
export { coursesApi, default as courses } from './courses';
export { gradesApi, default as grades } from './grades';
export { attendanceApi, default as attendance } from './attendance';
export { enrollmentsApi, default as enrollments } from './enrollments';
export { paymentsApi, default as payments } from './payments';
export { supportApi, default as support } from './support';
export { notificationsApi, default as notifications } from './notifications';
export { meetingsApi, default as meetings } from './meetings';
export { subjectsApi, default as subjects } from './subjects';
export { materialsApi, default as materials } from './materials';

// Re-export client utilities
export { get, post, put, patch, del, fetchWithRetry, ApiError } from './client';
