import { get, post } from './client';
import type { LessonResponse, LessonsResponse, LessonsParams } from '@/types/api';

/**
 * Lessons API module
 * Handles lessons and class sessions
 */

/**
 * Get all lessons with optional filtering
 */
export async function getLessons(params?: LessonsParams): Promise<LessonsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.upcoming !== undefined) queryParams.append('upcoming', params.upcoming.toString());
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  
  const queryString = queryParams.toString();
  const endpoint = `/lessons${queryString ? `?${queryString}` : ''}`;
  
  return await get<LessonsResponse>(endpoint);
}

/**
 * Get upcoming lessons
 */
export async function getUpcomingLessons(): Promise<LessonsResponse> {
  return await get<LessonsResponse>('/lessons/upcoming');
}

/**
 * Get today's lessons
 */
export async function getTodayLessons(): Promise<LessonsResponse> {
  return await get<LessonsResponse>('/lessons/today');
}

/**
 * Get lesson by ID
 */
export async function getLessonById(lessonId: string): Promise<LessonResponse> {
  return await get<LessonResponse>(`/lessons/${lessonId}`);
}

/**
 * Join a lesson (for online sessions)
 */
export async function joinLesson(lessonId: string): Promise<{ meetLink: string }> {
  return await post<{ meetLink: string }>(`/lessons/${lessonId}/join`);
}

/**
 * Leave a lesson
 */
export async function leaveLesson(lessonId: string): Promise<void> {
  await post<void>(`/lessons/${lessonId}/leave`);
}

/**
 * Get lessons for a specific course
 */
export async function getCourseLessons(courseId: string, params?: LessonsParams): Promise<LessonsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.upcoming !== undefined) queryParams.append('upcoming', params.upcoming.toString());
  
  const queryString = queryParams.toString();
  const endpoint = `/courses/${courseId}/lessons${queryString ? `?${queryString}` : ''}`;
  
  return await get<LessonsResponse>(endpoint);
}

// Export as object for backward compatibility
export const lessonsApi = {
  getLessons,
  getUpcomingLessons,
  getTodayLessons,
  getLessonById,
  joinLesson,
  leaveLesson,
  getCourseLessons,
};

export default lessonsApi;
