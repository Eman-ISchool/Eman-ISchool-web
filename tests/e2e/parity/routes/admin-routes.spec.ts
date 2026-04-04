import { test, expect } from '@playwright/test';

/**
 * Route Coverage: Admin Portal
 * All admin routes should redirect unauthenticated users to login.
 */

const adminRoutes = [
  { path: '/ar/admin', name: 'Admin root' },
  { path: '/ar/admin/home', name: 'Admin dashboard' },
  { path: '/ar/admin/students', name: 'Admin students' },
  { path: '/ar/admin/teachers', name: 'Admin teachers' },
  { path: '/ar/admin/grades', name: 'Admin grades' },
  { path: '/ar/admin/lessons', name: 'Admin lessons' },
  { path: '/ar/admin/attendance', name: 'Admin attendance' },
  { path: '/ar/admin/meetings', name: 'Admin meetings' },
  { path: '/ar/admin/fees', name: 'Admin fees' },
  { path: '/ar/admin/quizzes-exams', name: 'Admin quizzes' },
  { path: '/ar/admin/content', name: 'Admin content' },
  { path: '/ar/admin/settings', name: 'Admin settings' },
  { path: '/ar/admin/support', name: 'Admin support' },
  { path: '/ar/admin/enrollment-applications', name: 'Admin enrollment' },
  { path: '/ar/admin/calendar', name: 'Admin calendar' },
  { path: '/ar/admin/reels', name: 'Admin reels' },
];

test.describe('Admin Routes — Unauthenticated', () => {
  for (const route of adminRoutes) {
    test(`${route.name} (${route.path}) — redirects to login`, async ({ page }) => {
      const response = await page.goto(route.path, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      expect(response?.status()).toBeLessThan(500);

      const url = page.url();
      const redirectedToLogin = url.includes('/login');
      const hasAccessDenied = (await page.textContent('body'))?.includes('Access');
      expect(redirectedToLogin || hasAccessDenied).toBeTruthy();
    });
  }
});
