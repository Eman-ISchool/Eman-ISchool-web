import { get, post } from './client';

/**
 * Courses API module
 * Full CRUD for courses matching the web endpoints
 */

export interface CoursesParams {
  page?: number;
  limit?: number;
  gradeId?: string;
  subjectId?: string;
  teacherId?: string;
  status?: string;
  search?: string;
}

/**
 * Get courses with optional filters
 */
export async function getCourses(params?: CoursesParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.gradeId) queryParams.append('gradeId', params.gradeId);
  if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
  if (params?.teacherId) queryParams.append('teacherId', params.teacherId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const endpoint = `/courses${queryString ? `?${queryString}` : ''}`;

  return await get<any>(endpoint);
}

/**
 * Get course by ID
 */
export async function getCourseById(id: string) {
  return await get<any>(`/courses/${id}`);
}

/**
 * Create a new course
 */
export async function createCourse(data: {
  name: string;
  description?: string;
  gradeId: string;
  subjectId: string;
  teacherId?: string;
}) {
  return await post<any>('/courses', data);
}

/**
 * Get lessons for a specific course
 */
export async function getCourseLessons(courseId: string, params?: { page?: number; limit?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = `/courses/${courseId}/lessons${queryString ? `?${queryString}` : ''}`;

  return await get<any>(endpoint);
}

/**
 * Get students enrolled in a course
 */
export async function getCourseStudents(courseId: string, params?: { page?: number; limit?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = `/courses/${courseId}/students${queryString ? `?${queryString}` : ''}`;

  return await get<any>(endpoint);
}

// Export as object for backward compatibility
export const coursesApi = {
  getCourses,
  getCourseById,
  createCourse,
  getCourseLessons,
  getCourseStudents,
};

export default coursesApi;
