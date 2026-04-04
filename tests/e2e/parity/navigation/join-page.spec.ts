import { test, expect } from '@playwright/test';

/**
 * Join Page — Marketing sections + form
 * Verifies the join page has hero, features, stats, and application form.
 */

test.describe('Join Page', () => {
  test('has hero section with heading', async ({ page }) => {
    await page.goto('/ar/join', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Should have a main heading
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text!.length).toBeGreaterThan(0);
  });

  test('has feature cards section', async ({ page }) => {
    await page.goto('/ar/join', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Should have at least 3 feature cards
    const featureCards = page.locator('[class*="grid"] [class*="rounded"]');
    expect(await featureCards.count()).toBeGreaterThanOrEqual(3);
  });

  test('has stats section', async ({ page }) => {
    await page.goto('/ar/join', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Look for stats numbers
    const body = await page.textContent('body');
    expect(body).toContain('500+');
  });

  test('has application form', async ({ page }) => {
    await page.goto('/ar/join', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Should have a form
    const form = page.locator('form');
    expect(await form.count()).toBeGreaterThanOrEqual(1);

    // Should have submit button
    const submitBtn = page.locator('button[type="submit"]');
    expect(await submitBtn.count()).toBeGreaterThanOrEqual(1);
  });

  test('form has required fields', async ({ page }) => {
    await page.goto('/ar/join', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Should have name, phone, and other input fields
    const inputs = page.locator('form input, form select, form textarea');
    expect(await inputs.count()).toBeGreaterThanOrEqual(5);
  });
});
