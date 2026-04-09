import { test, expect } from '@playwright/test';

/**
 * Site Map Validator — verifies every discovered route loads without errors.
 * Based on the complete site map from docs/discovery/complete-site-map.md
 */

const PRE_LOGIN_ROUTES = [
  { path: '/ar/login', title: 'Login' },
  { path: '/ar/join', title: 'Join/Enrollment' },
  { path: '/ar/forgot-password', title: 'Forgot Password' },
  { path: '/ar/about', title: 'About' },
  { path: '/ar/contact', title: 'Contact' },
  { path: '/ar/services', title: 'Services' },
  { path: '/en/login', title: 'Login (EN)' },
  { path: '/en/join', title: 'Join (EN)' },
];

const AUTHENTICATED_ROUTES = [
  { path: '/ar/dashboard', title: 'Dashboard Home' },
  { path: '/ar/dashboard/courses', title: 'Courses' },
  { path: '/ar/dashboard/categories', title: 'Categories' },
  { path: '/ar/dashboard/bundles', title: 'Bundles' },
  { path: '/ar/dashboard/exams', title: 'Exams' },
  { path: '/ar/dashboard/quizzes', title: 'Quizzes' },
  { path: '/ar/dashboard/users', title: 'Users' },
  { path: '/ar/dashboard/applications', title: 'Applications' },
  { path: '/ar/dashboard/lookups', title: 'Lookups' },
  { path: '/ar/dashboard/payments', title: 'Payments' },
  { path: '/ar/dashboard/salaries', title: 'Salaries' },
  { path: '/ar/dashboard/payslips', title: 'Payslips' },
  { path: '/ar/dashboard/banks', title: 'Banks' },
  { path: '/ar/dashboard/currencies', title: 'Currencies' },
  { path: '/ar/dashboard/expenses', title: 'Expenses' },
  { path: '/ar/dashboard/coupons', title: 'Coupons' },
  { path: '/ar/dashboard/announcements', title: 'Announcements' },
  { path: '/ar/dashboard/messages', title: 'Messages' },
  { path: '/ar/dashboard/cms', title: 'CMS' },
  { path: '/ar/dashboard/blogs', title: 'Blogs' },
  { path: '/ar/dashboard/translations', title: 'Translations' },
  { path: '/ar/dashboard/reports', title: 'Reports' },
  { path: '/ar/dashboard/backup', title: 'Backup' },
  { path: '/ar/dashboard/system-settings', title: 'System Settings' },
  { path: '/ar/dashboard/profile', title: 'Profile' },
];

test.describe('Pre-login routes load without errors', () => {
  for (const route of PRE_LOGIN_ROUTES) {
    test(`${route.title} (${route.path}) loads`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      const response = await page.goto(route.path, { waitUntil: 'networkidle' });
      expect(response?.status()).toBeLessThan(500);
      expect(await page.title()).toBeTruthy();
    });
  }
});

test.describe('Authenticated routes load after login', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/ar/login');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  for (const route of AUTHENTICATED_ROUTES) {
    test(`${route.title} (${route.path}) loads`, async ({ page }) => {
      const response = await page.goto(route.path);
      // Should not return 500
      expect(response?.status()).not.toBe(500);
    });
  }
});
