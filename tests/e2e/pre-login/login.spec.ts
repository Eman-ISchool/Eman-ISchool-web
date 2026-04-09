import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ar/login');
    await page.waitForLoadState('networkidle');
  });

  test('displays correct Arabic heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('تسجيل الدخول إلى حسابك');
  });

  test('has Login and Register tabs', async ({ page }) => {
    await expect(page.getByText('تسجيل الدخول')).toBeVisible();
    await expect(page.getByText('تسجيل', { exact: true })).toBeVisible();
  });

  test('has phone number field with country selector', async ({ page }) => {
    await expect(page.getByText('رقم الهاتف')).toBeVisible();
    // Country selector should show a flag
    await expect(page.getByText('+971')).toBeVisible();
  });

  test('has password field', async ({ page }) => {
    await expect(page.getByText('أدخل كلمة المرور')).toBeVisible();
  });

  test('has forgot password link', async ({ page }) => {
    await expect(page.getByText('نسيت كلمة المرور؟')).toBeVisible();
  });

  test('has submit button', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /تسجيل الدخول/ });
    await expect(submitButton).toBeVisible();
  });

  test('country selector opens dropdown with search', async ({ page }) => {
    // Click country code button
    await page.getByText('+971').click();
    // Search field should appear
    await expect(page.getByPlaceholder('ابحث')).toBeVisible();
    // Jordan should be in the list
    await expect(page.getByText('الأردن')).toBeVisible();
  });

  test('switches to Register tab', async ({ page }) => {
    await page.getByText('تسجيل', { exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('إنشاء حساب جديد');
    // Profile picture upload should be visible
    await expect(page.getByText('الصورة الشخصية')).toBeVisible();
    // Parent name field
    await expect(page.getByText('اسم ولي الأمر')).toBeVisible();
  });

  test('RTL direction is set', async ({ page }) => {
    const dir = await page.getAttribute('div', 'dir');
    expect(dir).toBe('rtl');
  });

  test('shows PWA install banner', async ({ page }) => {
    await expect(page.getByText('تثبيت التطبيق')).toBeVisible();
  });

  test('has split layout with image panel', async ({ page }) => {
    // The lime-green image panel should exist on desktop
    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 1024) {
      // Check the page has a two-column layout
      const mainContent = page.locator('.lg\\:w-1\\/2');
      expect(await mainContent.count()).toBeGreaterThanOrEqual(1);
    }
  });
});

test.describe('Login Page - English', () => {
  test('displays correct English heading', async ({ page }) => {
    await page.goto('/en/login');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Sign in to your account');
  });
});
