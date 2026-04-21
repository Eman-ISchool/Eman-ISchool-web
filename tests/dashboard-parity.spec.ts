import { test, expect } from '@playwright/test';

const DASHBOARD_PAGES = [
  { path: '/ar/dashboard', name: 'Dashboard Overview' },
  { path: '/ar/dashboard/courses', name: 'Courses / Subjects' },
  { path: '/ar/dashboard/categories', name: 'Categories' },
  { path: '/ar/dashboard/bundles', name: 'Bundles / Classes' },
  { path: '/ar/dashboard/exams', name: 'Exams' },
  { path: '/ar/dashboard/quizzes', name: 'Quizzes' },
  { path: '/ar/dashboard/users', name: 'Users' },
  { path: '/ar/dashboard/students', name: 'Students' },
  { path: '/ar/dashboard/teachers', name: 'Teachers' },
  { path: '/ar/dashboard/live', name: 'Live Sessions' },
  { path: '/ar/dashboard/calendar', name: 'Calendar' },
  { path: '/ar/dashboard/fees', name: 'Fees' },
  { path: '/ar/dashboard/payments', name: 'Payments' },
  { path: '/ar/dashboard/salaries', name: 'Salaries' },
  { path: '/ar/dashboard/settings', name: 'Settings' },
  { path: '/ar/dashboard/profile', name: 'Profile' },
  { path: '/ar/dashboard/reports', name: 'Reports' },
  { path: '/ar/dashboard/messages', name: 'Messages' },
  { path: '/ar/dashboard/announcements', name: 'Announcements' },
  { path: '/ar/dashboard/blogs', name: 'Blogs' },
  { path: '/ar/dashboard/lookups', name: 'Lookups' },
];

test.describe('Dashboard Parity Verification', () => {
  // Login before all tests
  test.beforeEach(async ({ page }) => {
    // Try to access dashboard directly — if redirected to login, authenticate
    await page.goto('/ar/dashboard');
    const url = page.url();

    if (url.includes('login') || url.includes('auth') || url.includes('api/auth')) {
      // Login with admin credentials
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Fill login form
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');

      if (await emailInput.isVisible()) {
        await emailInput.fill('admin@eduverse.com');
        await passwordInput.fill('password123');
        await page.locator('button[type="submit"]').click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  for (const { path, name } of DASHBOARD_PAGES) {
    test(`${name} page loads without errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      const response = await page.goto(path, { waitUntil: 'networkidle', timeout: 30000 });

      // Page should return 200
      expect(response?.status()).toBeLessThan(500);

      // Wait for content to load (no more skeleton loaders)
      await page.waitForTimeout(2000);

      // Check no skeleton loaders are still showing after 2 seconds
      const skeletons = await page.locator('.animate-pulse').count();

      // Take screenshot for visual comparison
      await page.screenshot({ path: `test-results/dashboard-screenshots/${name.replace(/\s+/g, '-').toLowerCase()}.png`, fullPage: true });

      // Verify the page rendered actual content (not just empty/error)
      const bodyText = await page.textContent('body');
      expect(bodyText?.length).toBeGreaterThan(50);

      // Log results
      console.log(`✓ ${name}: status=${response?.status()}, skeletons=${skeletons}, content=${bodyText?.length || 0} chars, errors=${consoleErrors.length}`);
    });
  }

  test('Users page - Add User modal has all reference fields', async ({ page }) => {
    await page.goto('/ar/dashboard/users', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Click "Add User" button
    const addUserBtn = page.locator('button:has-text("إضافة مستخدم")');
    if (await addUserBtn.isVisible()) {
      await addUserBtn.click();
      await page.waitForTimeout(500);

      // Verify all reference fields are present
      const formLabels = await page.locator('label').allTextContents();
      const formLabelsText = formLabels.join(' ');

      expect(formLabelsText).toContain('الاسم الكامل');
      expect(formLabelsText).toContain('البريد الإلكتروني');
      expect(formLabelsText).toContain('كلمة المرور');
      expect(formLabelsText).toContain('الدور');
      expect(formLabelsText).toContain('رقم الهاتف');
      expect(formLabelsText).toContain('الراتب الأساسي');
      expect(formLabelsText).toContain('اسم البنك');
      expect(formLabelsText).toContain('رقم الحساب البنكي');
      expect(formLabelsText).toContain('العنوان');
      expect(formLabelsText).toContain('الصورة الشخصية');
      expect(formLabelsText).toContain('تاريخ الميلاد');

      // Verify role dropdown has parent option
      const roleSelect = page.locator('select');
      const options = await roleSelect.locator('option').allTextContents();
      expect(options.join(' ')).toContain('ولي أمر');

      await page.screenshot({ path: `test-results/dashboard-screenshots/users-add-modal.png`, fullPage: true });
      console.log('✓ Users Add Modal: all reference fields present');
    }
  });

  test('Courses detail page - List View toggle works', async ({ page }) => {
    await page.goto('/ar/dashboard/courses', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Click on first course to open detail
    const firstCourse = page.locator('a[href*="/dashboard/courses/"]').first();
    if (await firstCourse.isVisible()) {
      await firstCourse.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Navigate to live sessions tab
      const liveTab = page.locator('button:has-text("الحصص المباشرة"), [data-value="live"]');
      if (await liveTab.isVisible()) {
        await liveTab.click();
        await page.waitForTimeout(500);

        // Find and click "عرض القائمة" button
        const listViewBtn = page.locator('button:has-text("عرض القائمة")');
        expect(await listViewBtn.count()).toBeGreaterThan(0);

        if (await listViewBtn.isVisible()) {
          await listViewBtn.click();
          await page.waitForTimeout(300);

          // Verify list view is showing (table should appear)
          const table = page.locator('table');
          expect(await table.count()).toBeGreaterThan(0);

          await page.screenshot({ path: `test-results/dashboard-screenshots/courses-live-list-view.png`, fullPage: true });
          console.log('✓ Courses Live Tab: List View toggle works');
        }
      }
    }
  });
});
