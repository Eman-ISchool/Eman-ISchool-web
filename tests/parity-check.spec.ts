import { test, expect } from '@playwright/test';

test('Capture Screenshots for Parity Check', async ({ page }) => {
    // 1. Capture Login
    await page.goto('http://127.0.0.1:3000/ar/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'parity-login.png', fullPage: true });

    // 2. Perform Login to reach Dashboard
    await page.fill('input[inputmode="tel"]', '790320149');
    await page.fill('input[type="password"]', '12345678');
    await page.click('button[type="submit"]');

    // Wait a bit to see what happens after click
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'parity-post-submit.png', fullPage: true });

    try {
        // Wait for Dashboard to load
        await page.waitForURL('**/admin/home', { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // 3. Capture Dashboard
        await page.screenshot({ path: 'parity-dashboard.png', fullPage: true });
    } catch (e) {
        console.error("Failed to navigate to dashboard");
        await page.screenshot({ path: 'parity-error.png', fullPage: true });
    }
});
