import { test, expect } from '@playwright/test';

/**
 * Responsive Coverage Tests
 * Desktop (1440px), Tablet (768px), Mobile (390px) — check for overflow and clipping.
 */

const keyPages = [
  { path: '/ar', name: 'Landing' },
  { path: '/ar/login', name: 'Login' },
  { path: '/ar/join', name: 'Join' },
];

const breakpoints = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

for (const bp of breakpoints) {
  test.describe(`Responsive: ${bp.name} (${bp.width}px)`, () => {
    test.use({ viewport: { width: bp.width, height: bp.height } });

    for (const page_info of keyPages) {
      test(`${page_info.name} renders without overflow at ${bp.width}px`, async ({ page }) => {
        await page.goto(page_info.path, { waitUntil: 'domcontentloaded', timeout: 15000 });

        // No horizontal overflow
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth + 10;
        });
        expect(hasOverflow).toBe(false);

        // Page has visible content
        const bodyText = await page.textContent('body');
        expect(bodyText?.trim().length).toBeGreaterThan(0);
      });
    }
  });
}
