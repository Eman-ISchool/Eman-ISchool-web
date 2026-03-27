import { get, post, patch } from './client';

/**
 * Enrollments API module
 * Handles student enrollment in courses
 */

export interface EnrollmentsParams {
  page?: number;
  limit?: number;
  courseId?: string;
  studentId?: string;
  status?: string;
}

/**
 * Get enrollments with optional filters
 */
export async function getEnrollments(params?: EnrollmentsParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.courseId) queryParams.append('courseId', params.courseId);
  if (params?.studentId) queryParams.append('studentId', params.studentId);
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const endpoint = `/enrollments${queryString ? `?${queryString}` : ''}`;

  return await get<any>(endpoint);
}

/**
 * Create a new enrollment
 */
export async function createEnrollment(data: {
  courseId: string;
  studentId: string;
}) {
  return await post<any>('/enrollments', data);
}

/**
 * Update an existing enrollment (e.g., change status)
 */
export async function updateEnrollment(data: {
  id: string;
  status?: string;
  notes?: string;
}) {
  return await patch<any>('/enrollments', data);
}

/**
 * Get enrollment by ID
 */
export async function getEnrollmentById(id: string) {
  return await get<any>(`/enrollments/${id}`);
}

// Export as object for backward compatibility
export const enrollmentsApi = {
  getEnrollments,
  createEnrollment,
  updateEnrollment,
  getEnrollmentById,
};

export default enrollmentsApi;
