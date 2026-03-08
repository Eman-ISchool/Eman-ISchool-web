import { test, expect } from '@playwright/test';
const BASE_URL = 'http://localhost:3000';

test('Diagnose Meet Failure', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/auth/login`);
    await page.fill('input[name="email"]', 'teacher@eduverse.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Go to subjects
    await page.goto(`${BASE_URL}/en/teacher/subjects`, { waitUntil: 'networkidle' });

    const subjectLink = page.locator('a[href*="/teacher/subjects/"]').first();
    await subjectLink.click();
    await page.waitForLoadState('networkidle');

    const lessonCard = page.locator('div.border.cursor-pointer').first();
    await lessonCard.click();
    await page.waitForLoadState('networkidle');

    // Generate the meet
    const generateBtn = page.locator('button', { hasText: 'Generate Google Meet' }).first();
    if (await generateBtn.isVisible({ timeout: 2000 })) {
        await generateBtn.click();
        await page.waitForTimeout(2000);
    }

    const joinBtn = page.locator('a', { hasText: 'Join Meeting' }).first();
    await expect(joinBtn).toBeVisible({ timeout: 5000 });

    const meetUrl = await joinBtn.getAttribute('href');
    console.log("Found meet URL:", meetUrl);

    const [newTab] = await Promise.all([
        page.context().waitForEvent('page'),
        joinBtn.click()
    ]);

    await newTab.waitForLoadState('networkidle');
    await newTab.waitForTimeout(5000); // Wait for meet to load and show the error

    await newTab.screenshot({ path: 'meet-error.png', fullPage: true });

});
