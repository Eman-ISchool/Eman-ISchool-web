import { test, expect } from '@playwright/test';

/**
 * Route Coverage: Teacher Portal
 * Tests that all teacher routes load (most will redirect to login since no auth).
 */

const teacherRoutes = [
  { path: '/ar/teacher', name: 'Teacher root' },
  { path: '/ar/teacher/home', name: 'Teacher dashboard' },
  { path: '/ar/teacher/courses', name: 'Teacher courses' },
  { path: '/ar/teacher/subjects', name: 'Teacher subjects' },
  { path: '/ar/teacher/grades', name: 'Teacher grades' },
  { path: '/ar/teacher/assessments', name: 'Teacher assessments' },
  { path: '/ar/teacher/calendar', name: 'Teacher calendar' },
  { path: '/ar/teacher/materials', name: 'Teacher materials' },
  { path: '/ar/teacher/reels', name: 'Teacher reels' },
  { path: '/ar/teacher/chat', name: 'Teacher chat' },
  { path: '/ar/teacher/profile', name: 'Teacher profile' },
];

test.describe('Teacher Routes — Unauthenticated', () => {
  for (const route of teacherRoutes) {
    test(`${route.name} (${route.path}) — redirects to login or loads`, async ({ page }) => {
      const response = await page.goto(route.path, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      // Should not return 500
      expect(response?.status()).toBeLessThan(500);

      // Should redirect to login (RBAC) or render
      const url = page.url();
      const redirectedToLogin = url.includes('/login');
      const stayedOnPage = url.includes('/teacher');
      expect(redirectedToLogin || stayedOnPage).toBe(true);
    });
  }
});
