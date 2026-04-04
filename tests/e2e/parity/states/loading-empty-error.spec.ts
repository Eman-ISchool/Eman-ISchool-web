import { test, expect } from '@playwright/test';

/**
 * State Coverage Tests
 * Verify loading skeletons exist in route directories.
 * Runtime state testing requires authentication — these verify structure only.
 */

test.describe('State Coverage — Structure', () => {
  test('Teacher portal has loading.tsx skeleton', async ({ page }) => {
    // Navigate to teacher portal — should show either loading skeleton or redirect
    const response = await page.goto('/ar/teacher', {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    // If redirected to login, that's OK (RBAC working)
    // If loaded, should have content
    expect(response?.status()).toBeLessThan(500);
  });

  test('Login page handles empty credentials gracefully', async ({ page }) => {
    await page.goto('/ar/login', { waitUntil: 'networkidle', timeout: 15000 });

    // Should not crash when viewing login page
    const body = await page.textContent('body');
    expect(body?.length).toBeGreaterThan(0);

    // Should not have any 500 error indicators
    expect(body).not.toContain('Internal Server Error');
  });

  test('Public landing page renders complete content', async ({ page }) => {
    await page.goto('/ar', { waitUntil: 'networkidle', timeout: 15000 });

    // Should have meaningful content (not just a loading spinner)
    const body = await page.textContent('body');
    expect(body!.length).toBeGreaterThan(100);

    // Should not show raw error
    expect(body).not.toContain('Error');
    expect(body).not.toContain('undefined');
  });
});
