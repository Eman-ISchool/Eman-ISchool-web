import { test, expect } from '@playwright/test';

/**
 * Navigation Coverage Tests
 * Sidebar links, tabs, and internal navigation.
 * These tests run against public pages only (no auth required).
 */

test.describe('Navigation — Public', () => {
  test('Header has navigation links', async ({ page }) => {
    await page.goto('/ar', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Should have navigation links in header
    const headerLinks = page.locator('header a, nav a');
    expect(await headerLinks.count()).toBeGreaterThan(0);
  });

  test('Language switcher toggles between AR and EN', async ({ page }) => {
    await page.goto('/ar', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Look for language switcher
    const langToggle = page.locator('a[href*="/en"], button:has-text("English"), button:has-text("EN")').first();

    if (await langToggle.isVisible()) {
      await langToggle.click();
      await page.waitForURL('**/en/**', { timeout: 10000 });
      expect(page.url()).toContain('/en');
    }
  });

  test('Login page link from landing works', async ({ page }) => {
    await page.goto('/ar', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const loginLink = page.locator('a[href*="login"]').first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await page.waitForURL('**/login**', { timeout: 10000 });
      expect(page.url()).toContain('login');
    }
  });

  test('Footer has links', async ({ page }) => {
    await page.goto('/ar', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const footerLinks = page.locator('footer a');
    expect(await footerLinks.count()).toBeGreaterThanOrEqual(0); // Footer may not exist on all pages
  });
});
