import { test, expect, BrowserContext } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEACHER_EMAIL = 'teacher@eduverse.com';
const TEACHER_PASSWORD = 'password123';

async function loginProgrammatically(context: BrowserContext) {
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/api/auth/csrf`, { waitUntil: 'networkidle' });

  const loginResult = await page.evaluate(async ({ base, email, password }) => {
    const csrfResponse = await fetch(`${base}/api/auth/csrf`);
    const { csrfToken } = await csrfResponse.json();

    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('csrfToken', csrfToken);
    formData.append('callbackUrl', `${base}/en/teacher/home`);
    formData.append('json', 'true');

    await fetch(`${base}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
      redirect: 'follow',
    });

    const sessionResponse = await fetch(`${base}/api/auth/session`);
    return sessionResponse.json();
  }, { base: BASE_URL, email: TEACHER_EMAIL, password: TEACHER_PASSWORD });

  await page.close();
  if (!loginResult?.user?.email) {
    throw new Error('Teacher login failed for grade tabs test.');
  }
}

test('Teacher grade details page renders all five horizontal tabs', async ({ browser }) => {
  test.setTimeout(120_000);
  const teacherContext = await browser.newContext();
  await loginProgrammatically(teacherContext);
  const page = await teacherContext.newPage();

  await page.goto(`${BASE_URL}/en/teacher/grades`, { waitUntil: 'networkidle' });

  const gradeCards = page.locator('a.group[href*="/teacher/grades/"]');
  if ((await gradeCards.count()) === 0) {
    await page.click('button:has-text("New Class")');
    await page.fill('#className', `Grade E2E ${Date.now()}`);
    await page.click('button[type="submit"]:has-text("Create")');
    await page.waitForLoadState('networkidle');
  }

  if (await page.locator('.fixed.inset-0.z-50').isVisible().catch(() => false)) {
    await page.keyboard.press('Escape').catch(() => {});
    if (await page.locator('.fixed.inset-0.z-50').isVisible().catch(() => false)) {
      await page.locator('.fixed.inset-0.z-50 button').first().click({ force: true }).catch(() => {});
    }
  }

  await expect(page.locator('a.group[href*="/teacher/grades/"]').first()).toBeVisible();
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes('/api/grades/') &&
        response.request().method() === 'GET' &&
        response.status() === 200,
      { timeout: 60000 }
    ),
    page.locator('a.group[href*="/teacher/grades/"]').first().click(),
  ]);

  await expect(page.locator('h1')).toBeVisible({ timeout: 60000 });

  const tabs = page.locator('button', { hasText: /Info|Courses|Schedule|Students|Fees/ });
  await expect(tabs).toHaveCount(5, { timeout: 60000 });

  await page.click('button:has-text("Courses")');
  await expect(page.locator('a:has-text("Create course")')).toBeVisible();

  await page.click('button:has-text("Schedule")');
  await expect(page.locator('text=Phase 8')).toBeVisible();

  await page.click('button:has-text("Students")');
  await expect(page.locator('button:has-text("Export CSV")')).toBeVisible();

  await page.click('button:has-text("Fees")');
  await expect(page.locator('button:has-text("Add Fee")')).toBeVisible();

  await page.screenshot({ path: 'tests/screenshots/grade-details-tabs-after.png', fullPage: true });
  await teacherContext.close();
});
