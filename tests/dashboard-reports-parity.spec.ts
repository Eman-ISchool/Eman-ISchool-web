/**
 * Regression spec for the dashboard reports-route consolidation.
 *
 * Before the 2026-04-17 fix the sidebar "التقارير" item linked to /dashboard/reports
 * (a placeholder with dead buttons) while the home-page "View Reports" CTA linked
 * to /dashboard/admin/reports (the rich workspace). These now resolve to the same
 * page: /dashboard/reports renders the full workspace, /dashboard/admin/reports
 * 301-redirects to it, and the home-page CTA points at the canonical sidebar target.
 */
import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@eduverse.com';
const ADMIN_PASSWORD = 'password123';

async function loginIfNeeded(page: import('@playwright/test').Page) {
  await page.goto('/ar/dashboard', { waitUntil: 'domcontentloaded' });
  if (!/\/dashboard(\/|$)/.test(page.url())) {
    // Redirected to login — authenticate as admin
    await page.goto('/ar/login', { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="email"], input[name="email"]').first().fill(ADMIN_EMAIL);
    await page.locator('input[type="password"], input[name="password"]').first().fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  }
}

test.describe('Dashboard reports route parity', () => {
  test.beforeEach(async ({ page }) => {
    await loginIfNeeded(page);
  });

  test('/ar/dashboard/reports renders the full reports workspace', async ({ page }) => {
    const response = await page.goto('/ar/dashboard/reports', { waitUntil: 'networkidle' });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('text=/التقارير/')).toBeVisible();
    // Sanity: page is substantive (not the old 4-card placeholder)
    const bodyLen = (await page.textContent('body'))?.length ?? 0;
    expect(bodyLen).toBeGreaterThan(800);
  });

  test('/ar/dashboard/admin/reports redirects to /ar/dashboard/reports', async ({ page }) => {
    await page.goto('/ar/dashboard/admin/reports', { waitUntil: 'networkidle' });
    expect(page.url()).toMatch(/\/ar\/dashboard\/reports(\/|$|\?)/);
  });

  test('home-page "View Reports" CTA navigates to /dashboard/reports', async ({ page }) => {
    await page.goto('/ar/dashboard', { waitUntil: 'networkidle' });
    const reportsLink = page
      .locator('a[href*="/dashboard/reports"]')
      .filter({ hasText: /عرض التقارير|View Reports/ })
      .first();
    await expect(reportsLink).toBeVisible();
    const href = await reportsLink.getAttribute('href');
    expect(href).toContain('/dashboard/reports');
    expect(href).not.toContain('/dashboard/admin/reports');
  });

  test('home-page date-range indicator is non-interactive (read-only)', async ({ page }) => {
    await page.goto('/ar/dashboard', { waitUntil: 'networkidle' });
    // The old <button> with an empty onClick is gone; the date range is now a
    // role=status element that does not look clickable.
    const dateRange = page.locator('[role="status"][aria-label*="النطاق"], [role="status"][aria-label*="date range" i]').first();
    await expect(dateRange).toBeVisible();
    // And there should be no button exposing the same text
    const clickableDateBtn = page
      .locator('button')
      .filter({ hasText: /-\s*\d{4}$/ })
      .first();
    await expect(clickableDateBtn).toHaveCount(0);
  });
});

test.describe('Dashboard sidebar coverage', () => {
  test.beforeEach(async ({ page }) => {
    await loginIfNeeded(page);
  });

  test('sidebar renders all 7 reference nav groups in Arabic', async ({ page }) => {
    await page.goto('/ar/dashboard', { waitUntil: 'networkidle' });

    const groupLabels = [
      'الأكاديمي',
      'الإدارة',
      'المالية',
      'التواصل',
      'المحتوى',
      'التحليلات',
      'إدارة البيانات',
    ];

    for (const label of groupLabels) {
      const locator = page.getByRole('button', { name: label }).first();
      await expect(locator, `sidebar group "${label}" should render`).toBeVisible();
    }

    // Footer destinations present
    await expect(page.getByRole('link', { name: /الإعدادات/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /الملف الشخصي/ })).toBeVisible();
  });
});
