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

// Re-export client utilities
export { get, post, put, patch, del, fetchWithRetry, ApiError } from './client';
