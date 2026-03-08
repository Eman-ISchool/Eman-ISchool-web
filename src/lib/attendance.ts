/**
 * Attendance Utilities
 * 
 * This module provides functions for computing attendance status
 * and triggering attendance computation for lessons.
 */

import type { AttendanceStatus } from '../types/database';

// ===== ATTENDANCE COMPUTATION =====

/**
 * Compute attendance status based on join time and lesson start time.
 * 
 * Rules:
 * - If join_time is null: absent (student never joined)
 * - If join_time <= lesson_start_time + late_threshold: present
 * - If join_time > lesson_start_time + late_threshold: late
 * - If leave_time < lesson_end_time - early_exit_threshold: early_exit
 * 
 * @param joinTime - ISO timestamp when student joined (or null)
 * @param lessonStartTime - ISO timestamp when lesson started
 * @param lessonEndTime - ISO timestamp when lesson ended (optional, for early_exit detection)
 * @param lateThresholdMinutes - Minutes after start time to consider "late" (default: 10)
 * @param earlyExitThresholdMinutes - Minutes before end time to consider "early_exit" (default: 10)
 * @returns AttendanceStatus
 */
export function computeAttendanceStatus(
  joinTime: string | null,
  lessonStartTime: string,
  lessonEndTime?: string,
  lateThresholdMinutes: number = 10,
  earlyExitThresholdMinutes: number = 10
): AttendanceStatus {
  // If student never joined, mark as absent
  if (!joinTime) {
    return 'absent';
  }

  const joinDate = new Date(joinTime);
  const startDate = new Date(lessonStartTime);
  
  // Calculate time difference in milliseconds
  const timeDiff = joinDate.getTime() - startDate.getTime();
  const lateThresholdMs = lateThresholdMinutes * 60 * 1000;
  
  // If student joined within the late threshold, mark as present
  if (timeDiff <= lateThresholdMs) {
    // Check for early exit if lesson end time is provided
    if (lessonEndTime) {
      const endDate = new Date(lessonEndTime);
      // We need leave_time to check for early exit
      // This is a simplified version - in practice, we'd need leave_time
      // For now, just return 'present' if they joined on time
      return 'present';
    }
    return 'present';
  }
  
  // Student joined after the late threshold, mark as late
  return 'late';
}

/**
 * Compute attendance status with leave time for early exit detection.
 * 
 * @param joinTime - ISO timestamp when student joined (or null)
 * @param leaveTime - ISO timestamp when student left (or null)
 * @param lessonStartTime - ISO timestamp when lesson started
 * @param lessonEndTime - ISO timestamp when lesson ended
 * @param lateThresholdMinutes - Minutes after start time to consider "late" (default: 10)
 * @param earlyExitThresholdMinutes - Minutes before end time to consider "early_exit" (default: 10)
 * @returns AttendanceStatus
 */
export function computeAttendanceStatusWithLeaveTime(
  joinTime: string | null,
  leaveTime: string | null,
  lessonStartTime: string,
  lessonEndTime: string,
  lateThresholdMinutes: number = 10,
  earlyExitThresholdMinutes: number = 10
): AttendanceStatus {
  // If student never joined, mark as absent
  if (!joinTime) {
    return 'absent';
  }

  const joinDate = new Date(joinTime);
  const startDate = new Date(lessonStartTime);
  const endDate = new Date(lessonEndTime);
  
  // Calculate time difference in milliseconds
  const timeDiff = joinDate.getTime() - startDate.getTime();
  const lateThresholdMs = lateThresholdMinutes * 60 * 1000;
  
  // Check for early exit
  if (leaveTime) {
    const leaveDate = new Date(leaveTime);
    const earlyExitThresholdMs = earlyExitThresholdMinutes * 60 * 1000;
    const timeUntilEnd = endDate.getTime() - leaveDate.getTime();
    
    // If student left more than early_exit_threshold before end time
    if (timeUntilEnd > earlyExitThresholdMs) {
      return 'early_exit';
    }
  }
  
  // If student joined within the late threshold, mark as present
  if (timeDiff <= lateThresholdMs) {
    return 'present';
  }
  
  // Student joined after the late threshold, mark as late
  return 'late';
}

// ===== ATTENDANCE TRIGGER =====

/**
 * Trigger attendance computation for a lesson.
 * 
 * This function would typically be called when a lesson ends
 * to compute attendance status for all students who joined.
 * 
 * In a real implementation, this would:
 * 1. Query all attendance records for the lesson
 * 2. Get the lesson start and end times
 * 3. For each attendance record, compute the status based on join_time and leave_time
 * 4. Update the attendance_status field in the database
 * 
 * @param lessonId - The ID of the lesson to compute attendance for
 * @returns Promise<void>
 */
export async function triggerAttendanceComputation(lessonId: string): Promise<void> {
  // In a real implementation, this would query the database:
  /*
  const supabase = createSupabaseClient();
  
  // Get lesson details
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('start_date_time, end_date_time')
    .eq('id', lessonId)
    .single();
  
  if (lessonError || !lesson) {
    console.error('Failed to fetch lesson:', lessonError);
    return;
  }
  
  // Get all attendance records for this lesson
  const { data: attendanceRecords, error: attendanceError } = await supabase
    .from('attendance')
    .select('*')
    .eq('lesson_id', lessonId);
  
  if (attendanceError) {
    console.error('Failed to fetch attendance records:', attendanceError);
    return;
  }
  
  // Compute and update attendance status for each record
  for (const record of attendanceRecords) {
    const status = computeAttendanceStatusWithLeaveTime(
      record.join_time,
      record.leave_time,
      lesson.start_date_time,
      lesson.end_date_time
    );
    
    await supabase
      .from('attendance')
      .update({ attendance_status: status })
      .eq('id', record.id);
  }
  */
  
  console.log(`Attendance computation triggered for lesson ${lessonId}`);
  // Placeholder - actual implementation would query and update database
}

// ===== ATTENDANCE HELPERS =====

/**
 * Calculate attendance duration in seconds.
 * 
 * @param joinTime - ISO timestamp when student joined
 * @param leaveTime - ISO timestamp when student left (or null if still in lesson)
 * @returns Duration in seconds (or null if leave_time is null)
 */
export function calculateAttendanceDuration(
  joinTime: string,
  leaveTime: string | null
): number | null {
  if (!leaveTime) {
    return null; // Student is still in the lesson
  }
  
  const joinDate = new Date(joinTime);
  const leaveDate = new Date(leaveTime);
  
  return Math.floor((leaveDate.getTime() - joinDate.getTime()) / 1000);
}

/**
 * Format duration in seconds to human-readable format.
 * 
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "1h 30m 45s")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

/**
 * Check if a student is currently in a lesson.
 * 
 * @param joinTime - ISO timestamp when student joined
 * @param leaveTime - ISO timestamp when student left (or null)
 * @returns True if student is currently in the lesson
 */
export function isStudentInLesson(joinTime: string, leaveTime: string | null): boolean {
  return !!joinTime && !leaveTime;
}
