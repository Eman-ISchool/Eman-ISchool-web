/**
 * Role check helpers
 */

export function isAdmin(role: string | undefined): boolean {
  return !!role && role.toLowerCase() === 'admin';
}

export function isSupervisor(role: string | undefined): boolean {
  return !!role && role.toLowerCase() === 'supervisor';
}

export function isTeacher(role: string | undefined): boolean {
  return !!role && role.toLowerCase() === 'teacher';
}

export function isStudent(role: string | undefined): boolean {
  return !!role && role.toLowerCase() === 'student';
}

export function isParent(role: string | undefined): boolean {
  return !!role && role.toLowerCase() === 'parent';
}
