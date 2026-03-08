/**
 * Role Constants
 * 
 * This module defines role constants and utilities for the Eduverse platform.
 * Extended to include supervisor role for LMS Grade-Course-Lesson Hierarchy.
 */

// All available roles in the system
export const ALL_ROLES = ['admin', 'teacher', 'student', 'supervisor', 'parent'];

// Roles that can access admin portal
export const ADMIN_PORTAL_ROLES = ['admin', 'supervisor'];

// Roles that can access teacher portal
export const TEACHER_PORTAL_ROLES = ['teacher'];

// Roles that can access student portal
export const STUDENT_PORTAL_ROLES = ['student', 'parent'];

// Roles that can create content
export const CREATOR_ROLES = ['admin', 'teacher'];

// Check if a role is in a specific group
export function isAdmin(role: string): boolean {
  return role === 'admin';
}

export function isTeacher(role: string): boolean {
  return role === 'teacher';
}

export function isStudent(role: string): boolean {
  return role === 'student';
}

export function isSupervisor(role: string): boolean {
  return role === 'supervisor';
}

export function isParent(role: string): boolean {
  return role === 'parent';
}

// Check if user can access a specific portal
export function canAccessAdminPortal(role: string): boolean {
  return ADMIN_PORTAL_ROLES.includes(role);
}

export function canAccessTeacherPortal(role: string): boolean {
  return TEACHER_PORTAL_ROLES.includes(role);
}

export function canAccessStudentPortal(role: string): boolean {
  return STUDENT_PORTAL_ROLES.includes(role);
}

// Check if user can create content
export function canCreateContent(role: string): boolean {
  return CREATOR_ROLES.includes(role);
}
