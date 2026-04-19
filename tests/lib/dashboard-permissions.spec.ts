import { describe, expect, it } from '@jest/globals';
import { hasAccess, legacyRedirectFor, ROUTE_ACCESS } from '@/lib/dashboard-permissions';

describe('hasAccess', () => {
  it('admin can access every listed route', () => {
    for (const route of Object.keys(ROUTE_ACCESS)) {
      expect(hasAccess('admin', route)).toBe(true);
    }
  });

  it('student can access /dashboard/courses but not /dashboard/users', () => {
    expect(hasAccess('student', '/dashboard/courses')).toBe(true);
    expect(hasAccess('student', '/dashboard/users')).toBe(false);
  });

  it('teacher can access /dashboard/quizzes and /dashboard/lessons', () => {
    expect(hasAccess('teacher', '/dashboard/quizzes')).toBe(true);
    expect(hasAccess('teacher', '/dashboard/lessons')).toBe(true);
  });

  it('parent can access /dashboard/payments but not /dashboard/quizzes', () => {
    expect(hasAccess('parent', '/dashboard/payments')).toBe(true);
    expect(hasAccess('parent', '/dashboard/quizzes')).toBe(false);
  });

  it('unlisted route defaults to admin-only', () => {
    expect(hasAccess('teacher', '/dashboard/secret-path-not-listed')).toBe(false);
    expect(hasAccess('admin', '/dashboard/secret-path-not-listed')).toBe(true);
  });

  it('longest-prefix wins: /dashboard/courses/123 inherits /dashboard/courses', () => {
    expect(hasAccess('student', '/dashboard/courses/123')).toBe(true);
  });

  it('unknown role denied', () => {
    expect(hasAccess('guest', '/dashboard')).toBe(false);
    expect(hasAccess(undefined, '/dashboard')).toBe(false);
  });
});

describe('legacyRedirectFor', () => {
  it('maps /student/home to /dashboard', () => {
    expect(legacyRedirectFor('/ar/student/home')).toBe('/ar/dashboard');
  });
  it('maps /teacher/courses to /dashboard/courses', () => {
    expect(legacyRedirectFor('/en/teacher/courses')).toBe('/en/dashboard/courses');
  });
  it('maps /parent/invoices to /dashboard/payments', () => {
    expect(legacyRedirectFor('/ar/parent/invoices')).toBe('/ar/dashboard/payments');
  });
  it('returns null for non-legacy paths', () => {
    expect(legacyRedirectFor('/ar/dashboard/courses')).toBeNull();
    expect(legacyRedirectFor('/ar/about')).toBeNull();
  });
});
