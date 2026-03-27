import { get } from './client';

/**
 * Grades API module
 * Handles grade levels and their associated data
 */

/**
 * Get all grades
 */
export async function getGrades() {
  return await get<any>('/grades');
}

/**
 * Get grade by ID
 */
export async function getGradeById(id: string) {
  return await get<any>(`/grades/${id}`);
}

/**
 * Get courses for a specific grade
 */
export async function getGradeCourses(gradeId: string, params?: { page?: number; limit?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = `/grades/${gradeId}/courses${queryString ? `?${queryString}` : ''}`;

  return await get<any>(endpoint);
}

/**
 * Get students in a specific grade
 */
export async function getGradeStudents(gradeId: string, params?: { page?: number; limit?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = `/grades/${gradeId}/students${queryString ? `?${queryString}` : ''}`;

  return await get<any>(endpoint);
}

// Export as object for backward compatibility
export const gradesApi = {
  getGrades,
  getGradeById,
  getGradeCourses,
  getGradeStudents,
};

export default gradesApi;
