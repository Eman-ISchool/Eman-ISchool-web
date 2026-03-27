import { get } from './client';

/**
 * Subjects API module
 * Handles subject/discipline data
 */

/**
 * Get all subjects
 */
export async function getSubjects() {
  return await get<any>('/subjects');
}

/**
 * Get subject by ID
 */
export async function getSubjectById(id: string) {
  return await get<any>(`/subjects/${id}`);
}

// Export as object for backward compatibility
export const subjectsApi = {
  getSubjects,
  getSubjectById,
};

export default subjectsApi;
