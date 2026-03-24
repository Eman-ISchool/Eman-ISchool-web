import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test('auth and basic page audit', async ({ page, request }) => {
  // Step 1: Try to get CSRF token
  console.log('--- Step 1: CSRF token ---');
  let csrfToken: string;
  try {
    const csrf = await request.get(`${BASE}/api/auth/csrf`);
    console.log(`CSRF status: ${csrf.status()}`);
    const csrfBody = await csrf.json();
    csrfToken = csrfBody.csrfToken;
    console.log(`CSRF token: ${csrfToken ? 'obtained' : 'missing'}`);
  } catch (e: any) {
    console.log(`CSRF error: ${e.message}`);
    throw e;
  }

  // Step 2: Login
  console.log('--- Step 2: Login ---');
  try {
    const loginRes = await request.post(`${BASE}/api/auth/callback/credentials`, {
      form: {
        email: 'admin@eduverse.com',
        password: 'password123',
        csrfToken: csrfToken!,
        json: 'true',
      },
    });
    console.log(`Login status: ${loginRes.status()}`);
    console.log(`Login URL: ${loginRes.url()}`);
  } catch (e: any) {
    console.log(`Login error: ${e.message}`);
  }

  // Step 3: Check session
  console.log('--- Step 3: Session ---');
  try {
    const session = await request.get(`${BASE}/api/auth/session`);
    console.log(`Session status: ${session.status()}`);
    const sessionData = await session.json();
    console.log(`Session data: ${JSON.stringify(sessionData)}`);
  } catch (e: any) {
    console.log(`Session error: ${e.message}`);
  }

  // Step 4: Navigate to dashboard
  console.log('--- Step 4: Dashboard ---');
  await page.goto(`${BASE}/ar/dashboard`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  console.log(`Dashboard URL: ${page.url()}`);
  console.log(`Dashboard title: ${await page.title()}`);

  // Check if redirected to login
  const currentUrl = page.url();
  if (currentUrl.includes('login') || currentUrl.includes('signin')) {
    console.log('REDIRECTED TO LOGIN - need to login via browser');

    // Try browser login
    await page.goto(`${BASE}/ar/login/admin`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    console.log(`Login page URL: ${page.url()}`);

    // Look for login form
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"], input[placeholder*="البريد"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"], button:has-text("تسجيل"), button:has-text("Login"), button:has-text("دخول")');

    const hasEmail = await emailInput.isVisible().catch(() => false);
    const hasPassword = await passwordInput.isVisible().catch(() => false);
    const hasSubmit = await submitBtn.isVisible().catch(() => false);
    console.log(`Login form: email=${hasEmail}, password=${hasPassword}, submit=${hasSubmit}`);

    if (hasEmail && hasPassword) {
      await emailInput.fill('admin@eduverse.com');
      await passwordInput.fill('password123');
      if (hasSubmit) await submitBtn.click();
      await page.waitForTimeout(3000);
      console.log(`After login URL: ${page.url()}`);
    }
  }

  // Step 5: Take screenshot
  const bodyText = await page.locator('body').innerText().catch(() => '');
  console.log(`Page content (first 500 chars): ${bodyText.substring(0, 500)}`);

  // Step 6: Quick page scan
  console.log('\n--- Step 6: Quick page scan ---');
  const pages = [
    '/ar/dashboard',
    '/ar/dashboard/categories',
    '/ar/dashboard/courses',
    '/ar/dashboard/bundles',
    '/ar/dashboard/applications',
    '/ar/dashboard/users',
    '/ar/dashboard/payments',
    '/ar/dashboard/quizzes',
  ];

  for (const p of pages) {
    try {
      const res = await page.goto(`${BASE}${p}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const url = page.url();
      const status = res?.status() || 0;
      const text = await page.locator('body').innerText().catch(() => '');
      const hasError = text.includes('error') || text.includes('Error') || status >= 400;
      console.log(`[${hasError ? 'FAIL' : 'OK'}] ${p} -> status=${status}, url=${url.substring(0, 80)}, content=${text.length} chars`);
    } catch (e: any) {
      console.log(`[FAIL] ${p} -> ${e.message.substring(0, 100)}`);
    }
  }
});
