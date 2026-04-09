import { test, expect } from '@playwright/test';

/**
 * Dashboard tests — verifies sidebar navigation, page titles, and basic functionality
 * Note: These tests require authentication. Configure auth state in playwright.config.ts
 * or use a storageState fixture for pre-authenticated sessions.
 */

test.describe('Dashboard Sidebar Navigation', () => {
  // Skip if no auth — these tests need a logged-in session
  test.skip(({ browserName }) => !process.env.AUTH_COOKIE, 'Requires authenticated session');

  test('sidebar has all main navigation groups', async ({ page }) => {
    await page.goto('/ar/dashboard/courses');
    await page.waitForLoadState('networkidle');

    // Check all sidebar groups exist
    await expect(page.getByText('الرئيسية')).toBeVisible();
    await expect(page.getByText('الأكاديمي')).toBeVisible();
    await expect(page.getByText('الإدارة')).toBeVisible();
    await expect(page.getByText('المالية')).toBeVisible();
    await expect(page.getByText('التواصل')).toBeVisible();
    await expect(page.getByText('المحتوى')).toBeVisible();
    await expect(page.getByText('التحليلات')).toBeVisible();
    await expect(page.getByText('إدارة البيانات')).toBeVisible();
    await expect(page.getByText('الإعدادات')).toBeVisible();
    await expect(page.getByText('الملف الشخصي')).toBeVisible();
  });

  test('academic section expands with correct sub-items', async ({ page }) => {
    await page.goto('/ar/dashboard/courses');
    await page.waitForLoadState('networkidle');

    // Academic section should be expanded (since we're on courses)
    await expect(page.getByText('المواد الدراسية')).toBeVisible();
    await expect(page.getByText('الفئات')).toBeVisible();
    await expect(page.getByText('الفصول')).toBeVisible();
    await expect(page.getByText('الامتحانات')).toBeVisible();
    await expect(page.getByText('الاختبارات')).toBeVisible();
  });

  test('courses page shows course cards', async ({ page }) => {
    await page.goto('/ar/dashboard/courses');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'المواد الدراسية' })).toBeVisible();
    // Should have a create button
    await expect(page.getByText('إنشاء مادة دراسية')).toBeVisible();
    // Should have a search field
    await expect(page.getByPlaceholder('بحث')).toBeVisible();
  });

  test('users page shows user table', async ({ page }) => {
    await page.goto('/ar/dashboard/users');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'المستخدمون' })).toBeVisible();
    await expect(page.getByText('إضافة مستخدم')).toBeVisible();
  });
});

test.describe('Course Detail Page', () => {
  test.skip(({ browserName }) => !process.env.AUTH_COOKIE, 'Requires authenticated session');

  test('has all 5 tabs', async ({ page }) => {
    await page.goto('/ar/dashboard/courses/1');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('المعلومات')).toBeVisible();
    await expect(page.getByText('الدروس')).toBeVisible();
    await expect(page.getByText('الواجبات')).toBeVisible();
    await expect(page.getByText('الامتحانات')).toBeVisible();
    await expect(page.getByText('الحصص المباشرة')).toBeVisible();
  });

  test('has save button and back button', async ({ page }) => {
    await page.goto('/ar/dashboard/courses/1');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('حفظ')).toBeVisible();
    await expect(page.getByText('رجوع')).toBeVisible();
  });
});

test.describe('Lesson Detail Page', () => {
  test.skip(({ browserName }) => !process.env.AUTH_COOKIE, 'Requires authenticated session');

  test('has all 3 tabs', async ({ page }) => {
    await page.goto('/ar/dashboard/lessons/19');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('عنوان الدرس')).toBeVisible();
    await expect(page.getByText('مواد الدرس')).toBeVisible();
    await expect(page.getByText('حضور الطلاب')).toBeVisible();
  });

  test('has save button', async ({ page }) => {
    await page.goto('/ar/dashboard/lessons/19');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('حفظ التغييرات')).toBeVisible();
  });
});
