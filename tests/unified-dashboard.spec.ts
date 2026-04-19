import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3000';

interface RoleCreds {
  name: 'admin' | 'teacher' | 'student' | 'parent';
  email?: string;
  password?: string;
  expectedSidebar: string[];
  forbiddenSidebar: string[];
  forbiddenPath: string;
}

const roles: RoleCreds[] = [
  {
    name: 'admin',
    email: process.env.ADMIN_EMAIL ?? 'admin@eduverse.com',
    password: process.env.ADMIN_PASSWORD ?? 'password123',
    expectedSidebar: ['المستخدمون', 'النسخ الاحتياطي والاستعادة'],
    forbiddenSidebar: [],
    forbiddenPath: '/ar/dashboard/users',
  },
  {
    name: 'teacher',
    email: process.env.TEACHER_EMAIL,
    password: process.env.TEACHER_PASSWORD,
    expectedSidebar: ['المواد الدراسية', 'الاختبارات'],
    forbiddenSidebar: ['المستخدمون', 'النسخ الاحتياطي والاستعادة'],
    forbiddenPath: '/ar/dashboard/users',
  },
  {
    name: 'student',
    email: process.env.STUDENT_EMAIL,
    password: process.env.STUDENT_PASSWORD,
    expectedSidebar: ['المواد الدراسية'],
    forbiddenSidebar: ['المستخدمون', 'البنوك'],
    forbiddenPath: '/ar/dashboard/banks',
  },
  {
    name: 'parent',
    email: process.env.PARENT_EMAIL,
    password: process.env.PARENT_PASSWORD,
    expectedSidebar: ['المدفوعات'],
    forbiddenSidebar: ['البنوك'],
    forbiddenPath: '/ar/dashboard/banks',
  },
];

async function loginAs(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto(`${BASE}/ar/login`);
  await page.waitForLoadState('networkidle');
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await emailInput.fill(email);
  await passwordInput.fill(password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForLoadState('networkidle');
}

for (const role of roles) {
  test(`${role.name}: lands on /ar/dashboard with the right sidebar`, async ({ page }) => {
    test.skip(!role.email || !role.password, `${role.name.toUpperCase()}_EMAIL/PASSWORD not set in env`);

    await loginAs(page, role.email!, role.password!);
    await expect(page).toHaveURL(/\/ar\/dashboard$/);

    for (const item of role.expectedSidebar) {
      await expect(page.getByRole('link', { name: item })).toBeVisible();
    }
    for (const item of role.forbiddenSidebar) {
      await expect(page.getByRole('link', { name: item })).toHaveCount(0);
    }
  });

  test(`${role.name}: forbidden path renders AccessDenied`, async ({ page }) => {
    test.skip(!role.email || !role.password, `${role.name.toUpperCase()}_EMAIL/PASSWORD not set in env`);
    if (role.name === 'admin') return;

    await loginAs(page, role.email!, role.password!);
    await page.goto(`${BASE}${role.forbiddenPath}`);
    await expect(page.getByText('ليس لديك صلاحية')).toBeVisible();
  });
}

test('legacy /student/home redirects to /dashboard', async ({ page }) => {
  await page.goto(`${BASE}/ar/student/home`, { waitUntil: 'domcontentloaded' });
  expect(page.url()).toMatch(/\/ar\/dashboard($|\?)/);
});

test('legacy /teacher/courses redirects to /dashboard/courses', async ({ page }) => {
  await page.goto(`${BASE}/en/teacher/courses`, { waitUntil: 'domcontentloaded' });
  expect(page.url()).toMatch(/\/en\/dashboard\/courses($|\?)/);
});

test('legacy /parent/invoices redirects to /dashboard/payments', async ({ page }) => {
  await page.goto(`${BASE}/ar/parent/invoices`, { waitUntil: 'domcontentloaded' });
  expect(page.url()).toMatch(/\/ar\/dashboard\/payments($|\?)/);
});

test('legacy /admin/students redirects to /dashboard/students', async ({ page }) => {
  await page.goto(`${BASE}/ar/admin/students`, { waitUntil: 'domcontentloaded' });
  expect(page.url()).toMatch(/\/ar\/dashboard\/students($|\?)/);
});
