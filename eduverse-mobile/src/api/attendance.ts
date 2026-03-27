import { get, post } from './client';

/**
 * Attendance API module
 * Handles attendance tracking, recording, and reports
 */

export interface AttendanceParams {
  page?: number;
  limit?: number;
  courseId?: string;
  lessonId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface AttendanceReportParams {
  courseId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Get attendance records with optional filters
 */
export async function getAttendance(params?: AttendanceParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.courseId) queryParams.append('courseId', params.courseId);
  if (params?.lessonId) queryParams.append('lessonId', params.lessonId);
  if (params?.studentId) queryParams.append('studentId', params.studentId);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const endpoint = `/attendance${queryString ? `?${queryString}` : ''}`;

  return await get<any>(endpoint);
}

/**
 * Record attendance for a batch of students
 */
export async function recordAttendance(data: {
  lessonId: string;
  records: AttendanceRecord[];
}) {
  return await post<any>('/attendance', data);
}

/**
 * Get attendance report with aggregated stats
 */
export async function getAttendanceReport(params?: AttendanceReportParams) {
  const queryParams = new URLSearchParams();
  if (params?.courseId) queryParams.append('courseId', params.courseId);
  if (params?.studentId) queryParams.append('studentId', params.studentId);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const endpoint = `/attendance/report${queryString ? `?${queryString}` : ''}`;

  return await get<any>(endpoint);
}

// Export as object for backward compatibility
export const attendanceApi = {
  getAttendance,
  recordAttendance,
  getAttendanceReport,
};

export default attendanceApi;
