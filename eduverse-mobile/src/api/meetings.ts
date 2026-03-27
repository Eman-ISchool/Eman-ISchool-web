import { get, post } from './client';

/**
 * Meetings API module
 * Handles Google Meet integration for lessons
 */

/**
 * Create a new meeting for a lesson
 */
export async function createMeeting(data: {
  lessonId: string;
  title?: string;
  startTime?: string;
  endTime?: string;
}) {
  return await post<any>('/meetings/create', data);
}

/**
 * Get meeting details for a specific lesson
 */
export async function getLessonMeeting(lessonId: string) {
  return await get<any>(`/lessons/${lessonId}/meeting`);
}

/**
 * Join a lesson meeting
 */
export async function joinLesson(lessonId: string) {
  return await post<any>(`/lessons/${lessonId}/join`);
}

/**
 * Leave a lesson meeting
 */
export async function leaveLesson(lessonId: string) {
  return await post<any>(`/lessons/${lessonId}/leave`);
}

// Export as object for backward compatibility
export const meetingsApi = {
  createMeeting,
  getLessonMeeting,
  joinLesson,
  leaveLesson,
};

export default meetingsApi;
