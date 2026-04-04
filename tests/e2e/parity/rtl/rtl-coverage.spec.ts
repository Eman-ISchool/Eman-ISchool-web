import { test, expect } from '@playwright/test';

/**
 * RTL Coverage Tests
 * Verify dir="rtl" is present and no horizontal overflow on Arabic pages.
 */

const keyPages = [
  '/ar',
  '/ar/login',
  '/ar/join',
  '/ar/about',
  '/ar/services',
  '/ar/contact',
];

test.describe('RTL Coverage', () => {
  for (const path of keyPages) {
    test(`${path} has dir="rtl"`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Check for dir="rtl" on html, body, or a wrapper div
      const dirAttr = await page.locator('[dir="rtl"]').first().getAttribute('dir');
      expect(dirAttr).toBe('rtl');
    });

    test(`${path} has no horizontal overflow`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 });

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasOverflow).toBe(false);
    });
  }

  test('English page has dir="ltr"', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const dirAttr = await page.locator('[dir="ltr"]').first().getAttribute('dir');
    expect(dirAttr).toBe('ltr');
  });
});
