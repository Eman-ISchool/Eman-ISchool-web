import { test, expect } from '@playwright/test';

/**
 * RBAC Coverage Tests
 * Unauthorized route access should redirect to login or show access denied.
 */

const protectedRoutes = [
  { path: '/ar/teacher', name: 'Teacher portal' },
  { path: '/ar/teacher/courses', name: 'Teacher courses' },
  { path: '/ar/teacher/grades', name: 'Teacher grades' },
  { path: '/ar/admin', name: 'Admin portal' },
  { path: '/ar/admin/home', name: 'Admin dashboard' },
  { path: '/ar/admin/students', name: 'Admin students' },
  { path: '/ar/student', name: 'Student portal' },
  { path: '/ar/student/home', name: 'Student home' },
  { path: '/ar/parent/home', name: 'Parent home' },
];

test.describe('RBAC — Unauthenticated Access', () => {
  for (const route of protectedRoutes) {
    test(`${route.name} redirects unauthenticated user`, async ({ page }) => {
      // Navigate without auth
      const response = await page.goto(route.path, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      // Should redirect to login or show access denied
      const finalUrl = page.url();
      const status = response?.status() ?? 0;

      const isRedirectedToLogin = finalUrl.includes('/login') || finalUrl.includes('/auth');
      const isAccessDenied = status === 403 || (await page.textContent('body'))?.includes('Access denied');
      const isOnOriginalPage = finalUrl.includes(route.path);

      // At least one of: redirect to login, 403, or access denied message
      expect(isRedirectedToLogin || isAccessDenied || !isOnOriginalPage).toBe(true);
    });
  }
});
