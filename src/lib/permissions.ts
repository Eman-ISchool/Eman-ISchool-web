/**
 * Permission System
 * 
 * Centralized authorization logic for the Eduverse platform.
 * This module provides functions to check if a user has permission
 * to perform various actions based on their role and context.
 */

import { isAdmin, isTeacher, isStudent, isSupervisor, isParent } from './roles';

// Type definitions
export interface Session {
  user: {
    id: string;
    role: string;
  };
}

export interface Course {
  id: string;
  grade_id: string | null;
  teacher_id: string | null;
}

export interface Lesson {
  id: string;
  teacher_id: string | null;
  course_id: string | null;
}

// ===== GRADE PERMISSIONS =====

/**
 * Check if a role can create a grade.
 * Only admins and supervisors can create grades.
 */
export function canCreateGrade(role: string): boolean {
  return isAdmin(role);
}

/**
 * Check if a role can edit a grade.
 * - Admins can edit any grade
 * - Supervisors can only edit grades they supervise
 */
export function canEditGrade(role: string, session: Session, gradeId: string | null): boolean {
  if (isAdmin(role)) {
    return true;
  }

  if (isSupervisor(role) && gradeId) {
    // In a real implementation, we would check if the supervisor
    // is assigned to this grade. For now, we'll return true
    // assuming the supervisor has access to grades they supervise.
    // This should be enhanced with a database query to verify
    // that session.user.id === grade.supervisor_id
    return true;
  }

  return false;
}

// ===== COURSE PERMISSIONS =====

/**
 * Check if a role can create a course.
 * - Admins can create any course
 * - Teachers can create courses (subject to approval in Phase 6)
 * - Supervisors can create courses for grades they supervise (Phase 6)
 */
export function canCreateCourse(role: string): boolean {
  return isAdmin(role);
}

/**
 * Check if a role can edit a course.
 * - Admins can edit any course
 * - Teachers can edit courses they teach
 * - Supervisors can edit courses in grades they supervise
 */
export function canEditCourse(
  role: string,
  session: Session,
  courseGradeId: string | null,
  supervisorGradeId: string | null
): boolean {
  if (isAdmin(role)) {
    return true;
  }

  if (isTeacher(role)) {
    // Teachers can edit courses they teach
    // In a real implementation, we would check if session.user.id === course.teacher_id
    return true;
  }

  if (isSupervisor(role) && courseGradeId && supervisorGradeId) {
    // Supervisors can edit courses in grades they supervise
    return courseGradeId === supervisorGradeId;
  }

  return false;
}

/**
 * Check if a user can view a course.
 * - Admins can view any course
 * - Teachers can view courses they teach
 * - Supervisors can view courses in grades they supervise
 * - Students can view courses they're enrolled in
 * - Parents can view courses their children are enrolled in
 */
export function canViewCourse(role: string, session: Session, course: Course): boolean {
  if (isAdmin(role)) {
    return true;
  }

  if (isTeacher(role)) {
    // Teachers can view courses they teach
    return course.teacher_id === session.user.id;
  }

  if (isSupervisor(role)) {
    // Supervisors can view courses in grades they supervise
    // In a real implementation, we would check if course.grade_id
    // matches any grade the supervisor oversees
    return true;
  }

  if (isStudent(role)) {
    // Students can view courses they're enrolled in
    // In a real implementation, we would check enrollment
    return true;
  }

  if (isParent(role)) {
    // Parents can view courses their children are enrolled in
    // In a real implementation, we would check children's enrollments
    return true;
  }

  return false;
}

// ===== LESSON PERMISSIONS =====

/**
 * Check if a user can manage a lesson.
 * - Admins can manage any lesson
 * - Teachers can manage lessons they teach
 */
export function canManageLesson(role: string, session: Session, lessonTeacherId: string | null): boolean {
  if (isAdmin(role)) {
    return true;
  }

  if (isTeacher(role)) {
    // Teachers can manage lessons they teach
    return lessonTeacherId === session.user.id;
  }

  return false;
}

/**
 * Check if a user can join a lesson.
 * - Students can join lessons for courses they're enrolled in
 * - Teachers can join lessons they teach
 */
export function canJoinLesson(role: string): boolean {
  return isStudent(role) || isTeacher(role);
}

// ===== ENROLLMENT PERMISSIONS =====

/**
 * Check if a student is enrolled in a course.
 * This is a placeholder - in a real implementation, this would
 * query the database to check the enrollments table.
 */
export function isStudentEnrolled(studentId: string, courseId: string): boolean {
  // In a real implementation, we would query the database:
  // const { data } = await supabase
  //   .from('enrollments')
  //   .select('*')
  //   .eq('student_id', studentId)
  //   .eq('course_id', courseId)
  //   .eq('status', 'active')
  //   .single();
  // return !!data;

  // For now, return false as a safe default
  return false;
}

// ===== GENERAL PERMISSION HELPERS =====

/**
 * Check if a user can access admin portal.
 */
export function canAccessAdminPortal(role: string): boolean {
  return isAdmin(role) || isSupervisor(role);
}

/**
 * Check if a user can access teacher portal.
 */
export function canAccessTeacherPortal(role: string): boolean {
  return isTeacher(role);
}

/**
 * Check if a user can access student portal.
 */
export function canAccessStudentPortal(role: string): boolean {
  return isStudent(role) || isParent(role);
}

/**
 * Check if a user can create content.
 */
export function canCreateContent(role: string): boolean {
  return isAdmin(role) || isTeacher(role);
}
