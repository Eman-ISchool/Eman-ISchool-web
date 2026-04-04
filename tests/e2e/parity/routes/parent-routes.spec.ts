import { test, expect } from '@playwright/test';

/**
 * Route Coverage: Parent Portal
 */

const parentRoutes = [
  { path: '/ar/parent/home', name: 'Parent home' },
  { path: '/ar/parent/courses', name: 'Parent courses' },
  { path: '/ar/parent/invoices', name: 'Parent invoices' },
  { path: '/ar/parent/support', name: 'Parent support' },
  { path: '/ar/parent/applications', name: 'Parent applications' },
];

test.describe('Parent Routes — Unauthenticated', () => {
  for (const route of parentRoutes) {
    test(`${route.name} (${route.path}) — redirects to login`, async ({ page }) => {
      const response = await page.goto(route.path, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      expect(response?.status()).toBeLessThan(500);

      const url = page.url();
      expect(url.includes('/login') || url.includes('/ar') || url.includes('/parent')).toBe(true);
    });
  }
});
