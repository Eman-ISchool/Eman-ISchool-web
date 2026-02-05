import { get } from './client';
import type { DashboardStatsResponse } from '@/types/api';

/**
 * Dashboard API module
 * Handles dashboard statistics and overview data
 */

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStatsResponse> {
    return await get<DashboardStatsResponse>('/dashboard/stats');
  },

  /**
   * Get student-specific dashboard data
   */
  async getStudentDashboard(): Promise<DashboardStatsResponse> {
    return await get<DashboardStatsResponse>('/dashboard/student');
  },

  /**
   * Get teacher-specific dashboard data
   */
  async getTeacherDashboard(): Promise<DashboardStatsResponse> {
    return await get<DashboardStatsResponse>('/dashboard/teacher');
  },

  /**
   * Get parent-specific dashboard data
   */
  async getParentDashboard(): Promise<DashboardStatsResponse> {
    return await get<DashboardStatsResponse>('/dashboard/parent');
  },
};

export default dashboardApi;
