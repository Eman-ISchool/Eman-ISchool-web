import { get } from './client';

/**
 * Materials API module
 * Handles course materials and learning resources
 */

export interface MaterialsParams {
  page?: number;
  limit?: number;
  courseId?: string;
  lessonId?: string;
  type?: string;
}

/**
 * Get materials with optional filters
 */
export async function getMaterials(params?: MaterialsParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.courseId) queryParams.append('courseId', params.courseId);
  if (params?.lessonId) queryParams.append('lessonId', params.lessonId);
  if (params?.type) queryParams.append('type', params.type);

  const queryString = queryParams.toString();
  const endpoint = `/materials${queryString ? `?${queryString}` : ''}`;

  return await get<any>(endpoint);
}

/**
 * Get material by ID
 */
export async function getMaterialById(id: string) {
  return await get<any>(`/materials/${id}`);
}

// Export as object for backward compatibility
export const materialsApi = {
  getMaterials,
  getMaterialById,
};

export default materialsApi;
