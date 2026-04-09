import { test, expect } from '@playwright/test';

test.describe('Join/Enrollment Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ar/join');
    await page.waitForLoadState('networkidle');
  });

  test('displays page title', async ({ page }) => {
    await expect(page.getByText('التقديم للمدرسة')).toBeVisible();
    await expect(page.getByText('طلب التحاق للطالب')).toBeVisible();
  });

  test('has public navigation bar', async ({ page }) => {
    await expect(page.getByText('Future Labs Academy')).toBeVisible();
    await expect(page.getByText('حولنا')).toBeVisible();
    await expect(page.getByText('اتصل بنا')).toBeVisible();
    await expect(page.getByText('خدماتنا')).toBeVisible();
  });

  test('has bundle/class selection', async ({ page }) => {
    await expect(page.getByText('اختر الفصل')).toBeVisible();
    const select = page.locator('select').first();
    await expect(select).toBeVisible();
  });

  test('has personal information section', async ({ page }) => {
    await expect(page.getByText('المعلومات الشخصية')).toBeVisible();
    await expect(page.getByText('الاسم الكامل')).toBeVisible();
    await expect(page.getByText('تاريخ الميلاد')).toBeVisible();
    await expect(page.getByText('النوع')).toBeVisible();
  });

  test('has contact information section', async ({ page }) => {
    await expect(page.getByText('معلومات الاتصال')).toBeVisible();
    await expect(page.getByText('العنوان')).toBeVisible();
  });

  test('has educational information section', async ({ page }) => {
    await expect(page.getByText('المعلومات التعليمية')).toBeVisible();
    await expect(page.getByText('التعليم السابق')).toBeVisible();
  });

  test('has guardian information section', async ({ page }) => {
    await expect(page.getByText('معلومات ولي الامر')).toBeVisible();
    await expect(page.getByText('اسم ولي الامر')).toBeVisible();
    await expect(page.getByText('رقم هاتف ولي الامر')).toBeVisible();
  });

  test('has document upload sections', async ({ page }) => {
    await expect(page.getByText('رقم جواز السفر (اختياري)')).toBeVisible();
    await expect(page.getByText('الرقم الوطني (اختياري)')).toBeVisible();
  });

  test('has student image upload', async ({ page }) => {
    await expect(page.getByText('صورة الطالب')).toBeVisible();
  });

  test('has submit button', async ({ page }) => {
    await expect(page.getByText('إرسال الطلب')).toBeVisible();
  });

  test('gender dropdown has correct options', async ({ page }) => {
    const genderSelect = page.locator('select').nth(1);
    await expect(genderSelect).toBeVisible();
    const options = await genderSelect.locator('option').allTextContents();
    expect(options).toContain('أنثى');
    expect(options).toContain('ذكر');
  });

  test('RTL direction is set', async ({ page }) => {
    const dir = await page.locator('div').first().getAttribute('dir');
    expect(dir).toBe('rtl');
  });
});
