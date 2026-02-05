import { get, post } from './client';
import type { AssignmentResponse, AssignmentsResponse, AssignmentsParams } from '@/types/api';

/**
 * Assignments API module
 * Handles assignments and submissions
 */

export const assignmentsApi = {
  /**
   * Get all assignments with optional filtering
   */
  async getAssignments(params?: AssignmentsParams): Promise<AssignmentsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.courseId) queryParams.append('courseId', params.courseId);
    if (params?.due) queryParams.append('due', params.due);
    
    const queryString = queryParams.toString();
    const endpoint = `/assignments${queryString ? `?${queryString}` : ''}`;
    
    return await get<AssignmentsResponse>(endpoint);
  },

  /**
   * Get upcoming assignments
   */
  async getUpcomingAssignments(): Promise<AssignmentsResponse> {
    return await get<AssignmentsResponse>('/assignments/upcoming');
  },

  /**
   * Get overdue assignments
   */
  async getOverdueAssignments(): Promise<AssignmentsResponse> {
    return await get<AssignmentsResponse>('/assignments/overdue');
  },

  /**
   * Get assignment by ID
   */
  async getAssignmentById(assignmentId: string): Promise<AssignmentResponse> {
    return await get<AssignmentResponse>(`/assignments/${assignmentId}`);
  },

  /**
   * Submit assignment
   */
  async submitAssignment(
    assignmentId: string,
    submissionData: {
      text?: string;
      files?: string[];
    }
  ): Promise<AssignmentResponse> {
    return await post<AssignmentResponse>(`/assignments/${assignmentId}/submit`, submissionData);
  },

  /**
   * Get assignments for a specific course
   */
  async getCourseAssignments(courseId: string, params?: AssignmentsParams): Promise<AssignmentsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.due) queryParams.append('due', params.due);
    
    const queryString = queryParams.toString();
    const endpoint = `/courses/${courseId}/assignments${queryString ? `?${queryString}` : ''}`;
    
    return await get<AssignmentsResponse>(endpoint);
  },
};

export default assignmentsApi;
