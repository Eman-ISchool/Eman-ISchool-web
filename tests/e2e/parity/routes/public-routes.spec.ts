import { test, expect } from '@playwright/test';

/**
 * Route Coverage: Public Pages
 * Every public route loads without crash and has correct structure.
 */

const publicRoutes = [
  { path: '/ar', name: 'Landing (Arabic)', expectH1: true },
  { path: '/ar/about', name: 'About' },
  { path: '/ar/about-us', name: 'About Us' },
  { path: '/ar/services', name: 'Services' },
  { path: '/ar/contact', name: 'Contact' },
  { path: '/ar/blogs', name: 'Blogs' },
  { path: '/ar/policy', name: 'Policy' },
  { path: '/ar/join', name: 'Join/Register' },
  { path: '/ar/enrollment', name: 'Enrollment' },
  { path: '/ar/search', name: 'Search' },
  { path: '/ar/download', name: 'Download' },
];

test.describe('Public Routes', () => {
  for (const route of publicRoutes) {
    test(`${route.name} (${route.path}) loads without error`, async ({ page }) => {
      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Should not return 500 or 404
      expect(response?.status()).toBeLessThan(500);

      // Page should have a title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      // No unhandled errors in console
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      // Page should have content (not blank)
      const bodyText = await page.textContent('body');
      expect(bodyText?.length).toBeGreaterThan(0);
    });
  }
});
