import { test, expect } from '@playwright/test';

/**
 * RTL Direction Tests — verifies Arabic locale pages have correct RTL attributes
 */

const ARABIC_ROUTES = [
  '/ar/login',
  '/ar/join',
  '/ar/forgot-password',
  '/ar/about',
  '/ar/contact',
  '/ar/services',
];

test.describe('RTL direction on Arabic pages', () => {
  for (const route of ARABIC_ROUTES) {
    test(`${route} has dir="rtl"`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      // Check that some container has dir="rtl"
      const rtlElement = page.locator('[dir="rtl"]').first();
      await expect(rtlElement).toBeAttached();
    });
  }
});

test.describe('LTR direction on English pages', () => {
  const ENGLISH_ROUTES = [
    '/en/login',
    '/en/join',
    '/en/about',
    '/en/contact',
    '/en/services',
  ];

  for (const route of ENGLISH_ROUTES) {
    test(`${route} has dir="ltr"`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const ltrElement = page.locator('[dir="ltr"]').first();
      await expect(ltrElement).toBeAttached();
    });
  }
});

test.describe('Language switch between AR and EN', () => {
  test('login page renders in both locales', async ({ page }) => {
    // Arabic
    await page.goto('/ar/login');
    await expect(page.getByText('تسجيل الدخول')).toBeVisible();

    // English
    await page.goto('/en/login');
    await expect(page.getByText('Sign in')).toBeVisible();
  });

  test('about page renders in both locales', async ({ page }) => {
    // Arabic
    await page.goto('/ar/about');
    await expect(page.getByText('حولنا')).toBeVisible();

    // English
    await page.goto('/en/about');
    await expect(page.getByText('About')).toBeVisible();
  });
});
