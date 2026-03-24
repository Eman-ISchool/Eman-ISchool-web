import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://localhost:3000';

// ─── helpers ───────────────────────────────────────────────────────
async function login(page: Page, email = 'admin@eduverse.com', password = 'password123') {
  // Try credentials login via NextAuth
  const csrf = await page.request.get(`${BASE}/api/auth/csrf`);
  const { csrfToken } = await csrf.json();

  const res = await page.request.post(`${BASE}/api/auth/callback/credentials`, {
    form: {
      email,
      password,
      csrfToken,
      json: 'true',
    },
  });

  // Verify session
  const session = await page.request.get(`${BASE}/api/auth/session`);
  const sessionData = await session.json();
  return sessionData;
}

interface PageResult {
  url: string;
  status: 'ok' | 'error' | 'redirect' | 'empty';
  statusCode?: number;
  title?: string;
  errors: string[];
  consoleErrors: string[];
  networkErrors: string[];
  loadTime: number;
}

async function auditPage(page: Page, url: string, timeout = 15000): Promise<PageResult> {
  const result: PageResult = {
    url,
    status: 'ok',
    errors: [],
    consoleErrors: [],
    networkErrors: [],
    loadTime: 0,
  };

  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('response', (response) => {
    if (response.status() >= 500) {
      networkErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  const start = Date.now();
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout });
    result.loadTime = Date.now() - start;
    result.statusCode = response?.status();

    if (response && response.status() >= 400) {
      result.status = 'error';
      result.errors.push(`HTTP ${response.status()}`);
    }

    // Check for error patterns in page content
    const content = await page.content();
    if (content.includes('Application error') || content.includes('Internal Server Error')) {
      result.status = 'error';
      result.errors.push('Application error on page');
    }
    if (content.includes('404') && content.includes('not found')) {
      result.status = 'error';
      result.errors.push('404 not found');
    }

    // Check if page has meaningful content
    const bodyText = await page.locator('body').innerText().catch(() => '');
    if (bodyText.trim().length < 10) {
      result.status = 'empty';
      result.errors.push('Page appears empty');
    }

    result.title = await page.title().catch(() => '');
  } catch (e: any) {
    result.status = 'error';
    result.errors.push(e.message?.substring(0, 200) || 'Unknown error');
    result.loadTime = Date.now() - start;
  }

  result.consoleErrors = consoleErrors;
  result.networkErrors = networkErrors;
  return result;
}

// ─── PHASE 1: Login and Session ────────────────────────────────────
test.describe('Phase 1: Authentication', () => {
  test('can login as admin', async ({ page }) => {
    const session = await login(page);
    console.log('Session:', JSON.stringify(session, null, 2));
    expect(session.user).toBeTruthy();
  });
});

// ─── PHASE 2: Dashboard Pages Health ──────────────────────────────
test.describe('Phase 2: Dashboard Pages Audit', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  const dashboardPages = [
    { name: 'Overview', path: '/ar/dashboard' },
    { name: 'Courses', path: '/ar/dashboard/courses' },
    { name: 'Categories', path: '/ar/dashboard/categories' },
    { name: 'Bundles', path: '/ar/dashboard/bundles' },
    { name: 'Quizzes', path: '/ar/dashboard/quizzes' },
    { name: 'Users', path: '/ar/dashboard/users' },
    { name: 'Applications', path: '/ar/dashboard/applications' },
    { name: 'Lookups', path: '/ar/dashboard/lookups' },
    { name: 'Payments', path: '/ar/dashboard/payments' },
    { name: 'Salaries', path: '/ar/dashboard/salaries' },
    { name: 'Payslips', path: '/ar/dashboard/payslips' },
    { name: 'Banks', path: '/ar/dashboard/banks' },
    { name: 'Currencies', path: '/ar/dashboard/currencies' },
    { name: 'Expenses', path: '/ar/dashboard/expenses' },
    { name: 'Coupons', path: '/ar/dashboard/coupons' },
    { name: 'Messages', path: '/ar/dashboard/messages' },
    { name: 'Announcements', path: '/ar/dashboard/announcements' },
    { name: 'CMS', path: '/ar/dashboard/cms' },
    { name: 'Translations', path: '/ar/dashboard/translations' },
    { name: 'Reports', path: '/ar/dashboard/reports' },
    { name: 'Backup', path: '/ar/dashboard/backup' },
    { name: 'System Settings', path: '/ar/dashboard/system-settings' },
    { name: 'Profile', path: '/ar/dashboard/profile' },
  ];

  for (const pg of dashboardPages) {
    test(`Dashboard: ${pg.name} (${pg.path})`, async ({ page }) => {
      const result = await auditPage(page, `${BASE}${pg.path}`);
      console.log(`[${pg.name}] Status: ${result.status}, Load: ${result.loadTime}ms, Errors: ${result.errors.join('; ') || 'none'}`);
      if (result.consoleErrors.length > 0) {
        console.log(`  Console errors: ${result.consoleErrors.slice(0, 3).join('; ')}`);
      }
      if (result.networkErrors.length > 0) {
        console.log(`  Network errors: ${result.networkErrors.slice(0, 3).join('; ')}`);
      }
      expect(result.status, `Page ${pg.name} failed: ${result.errors.join(', ')}`).not.toBe('error');
    });
  }
});

// ─── PHASE 3: Admin Portal Pages ──────────────────────────────────
test.describe('Phase 3: Admin Portal Pages', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  const adminPages = [
    { name: 'Admin Courses', path: '/ar/admin/courses' },
    { name: 'Admin Bundles', path: '/ar/admin/bundles' },
    { name: 'Admin Quizzes', path: '/ar/admin/quizzes-exams' },
    { name: 'Admin Users', path: '/ar/admin/users' },
    { name: 'Admin Students', path: '/ar/admin/students' },
    { name: 'Admin Teachers', path: '/ar/admin/teachers' },
    { name: 'Admin Grades', path: '/ar/admin/grades' },
    { name: 'Admin Lessons', path: '/ar/admin/lessons' },
    { name: 'Admin Content', path: '/ar/admin/content' },
    { name: 'Admin Fees', path: '/ar/admin/fees' },
    { name: 'Admin Attendance', path: '/ar/admin/attendance' },
    { name: 'Admin Meetings', path: '/ar/admin/meetings' },
    { name: 'Admin Settings', path: '/ar/admin/settings' },
    { name: 'Admin Applications', path: '/ar/admin/enrollment-applications' },
    { name: 'Admin Support', path: '/ar/admin/support' },
    { name: 'Admin Coupons/Expenses', path: '/ar/admin/coupons-expenses' },
  ];

  for (const pg of adminPages) {
    test(`Admin: ${pg.name} (${pg.path})`, async ({ page }) => {
      const result = await auditPage(page, `${BASE}${pg.path}`);
      console.log(`[${pg.name}] Status: ${result.status}, Load: ${result.loadTime}ms, Errors: ${result.errors.join('; ') || 'none'}`);
      expect(result.status, `Page ${pg.name} failed: ${result.errors.join(', ')}`).not.toBe('error');
    });
  }
});

// ─── PHASE 4: Teacher Portal Pages ───────────────────────────────
test.describe('Phase 4: Teacher Portal Pages', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'teacher@eduverse.com', 'password123');
  });

  const teacherPages = [
    { name: 'Teacher Home', path: '/ar/teacher/home' },
    { name: 'Teacher Courses', path: '/ar/teacher/courses' },
    { name: 'Teacher Grades', path: '/ar/teacher/grades' },
    { name: 'Teacher Profile', path: '/ar/teacher/profile' },
    { name: 'Teacher Calendar', path: '/ar/teacher/calendar' },
    { name: 'Teacher Assessments', path: '/ar/teacher/assessments' },
  ];

  for (const pg of teacherPages) {
    test(`Teacher: ${pg.name} (${pg.path})`, async ({ page }) => {
      const result = await auditPage(page, `${BASE}${pg.path}`);
      console.log(`[${pg.name}] Status: ${result.status}, Load: ${result.loadTime}ms, Errors: ${result.errors.join('; ') || 'none'}`);
      expect(result.status, `Page ${pg.name} failed: ${result.errors.join(', ')}`).not.toBe('error');
    });
  }
});

// ─── PHASE 5: Student Portal Pages ───────────────────────────────
test.describe('Phase 5: Student Portal Pages', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'student@eduverse.com', 'password123');
  });

  const studentPages = [
    { name: 'Student Home', path: '/ar/student/home' },
    { name: 'Student Courses', path: '/ar/student/courses' },
    { name: 'Student Profile', path: '/ar/student/profile' },
    { name: 'Student Support', path: '/ar/student/support' },
  ];

  for (const pg of studentPages) {
    test(`Student: ${pg.name} (${pg.path})`, async ({ page }) => {
      const result = await auditPage(page, `${BASE}${pg.path}`);
      console.log(`[${pg.name}] Status: ${result.status}, Load: ${result.loadTime}ms, Errors: ${result.errors.join('; ') || 'none'}`);
      expect(result.status, `Page ${pg.name} failed: ${result.errors.join(', ')}`).not.toBe('error');
    });
  }
});

// ─── PHASE 6: API Endpoints Health ────────────────────────────────
test.describe('Phase 6: API Endpoints Health', () => {
  test('critical API endpoints return valid responses', async ({ request }) => {
    // Login first
    const csrf = await request.get(`${BASE}/api/auth/csrf`);
    const { csrfToken } = await csrf.json();
    await request.post(`${BASE}/api/auth/callback/credentials`, {
      form: { email: 'admin@eduverse.com', password: 'password123', csrfToken, json: 'true' },
    });

    const endpoints = [
      { name: 'Health', url: '/api/health', method: 'GET' },
      { name: 'Dashboard Stats', url: '/api/dashboard/stats', method: 'GET' },
      { name: 'Admin Stats', url: '/api/admin/stats', method: 'GET' },
      { name: 'Courses', url: '/api/courses', method: 'GET' },
      { name: 'Admin Categories', url: '/api/admin/categories', method: 'GET' },
      { name: 'Admin Bundles', url: '/api/admin/bundles', method: 'GET' },
      { name: 'Grade Levels', url: '/api/grade-levels', method: 'GET' },
      { name: 'Grades', url: '/api/grades', method: 'GET' },
      { name: 'Lessons', url: '/api/lessons', method: 'GET' },
      { name: 'Enrollments', url: '/api/enrollments', method: 'GET' },
      { name: 'Enrollment Applications', url: '/api/enrollment-applications', method: 'GET' },
      { name: 'Users', url: '/api/users', method: 'GET' },
      { name: 'Blogs', url: '/api/blogs', method: 'GET' },
      { name: 'Assessments', url: '/api/assessments', method: 'GET' },
    ];

    const results: { name: string; status: number; ok: boolean; error?: string }[] = [];

    for (const ep of endpoints) {
      try {
        const res = await request.get(`${BASE}${ep.url}`);
        results.push({ name: ep.name, status: res.status(), ok: res.ok() });
        if (!res.ok()) {
          const body = await res.text().catch(() => '');
          results[results.length - 1].error = body.substring(0, 200);
        }
      } catch (e: any) {
        results.push({ name: ep.name, status: 0, ok: false, error: e.message?.substring(0, 200) });
      }
    }

    console.log('\n=== API HEALTH REPORT ===');
    for (const r of results) {
      const icon = r.ok ? 'PASS' : 'FAIL';
      console.log(`[${icon}] ${r.name}: ${r.status}${r.error ? ` - ${r.error}` : ''}`);
    }

    const failures = results.filter(r => !r.ok);
    if (failures.length > 0) {
      console.log(`\n${failures.length} API failures detected`);
    }
  });
});

// ─── PHASE 7: Dashboard Interactive Elements ─────────────────────
test.describe('Phase 7: Dashboard Interactive Audit', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Dashboard sidebar navigation works', async ({ page }) => {
    await page.goto(`${BASE}/ar/dashboard`);
    await page.waitForLoadState('networkidle');

    // Check sidebar exists
    const sidebar = page.locator('nav, [role="navigation"], aside').first();
    const sidebarVisible = await sidebar.isVisible().catch(() => false);
    console.log(`Sidebar visible: ${sidebarVisible}`);

    // Find all navigation links in sidebar
    const navLinks = await page.locator('nav a, aside a, [role="navigation"] a').all();
    console.log(`Navigation links found: ${navLinks.length}`);

    for (const link of navLinks.slice(0, 30)) {
      const href = await link.getAttribute('href').catch(() => null);
      const text = await link.innerText().catch(() => '');
      if (href) {
        console.log(`  Link: ${text.trim().substring(0, 40)} -> ${href}`);
      }
    }
  });

  test('Dashboard Overview loads stats', async ({ page }) => {
    await page.goto(`${BASE}/ar/dashboard`);
    await page.waitForLoadState('networkidle');

    // Check for stat cards
    const cards = await page.locator('[class*="card"], [class*="stat"], [class*="metric"]').all();
    console.log(`Stat cards found: ${cards.length}`);

    // Check for charts
    const charts = await page.locator('svg.recharts-surface, [class*="chart"], canvas').all();
    console.log(`Charts found: ${charts.length}`);

    // Check for loading states
    const skeletons = await page.locator('[class*="skeleton"], [class*="loading"], [class*="spinner"]').all();
    console.log(`Loading indicators: ${skeletons.length}`);

    // Check for error states
    const errors = await page.locator('[class*="error"], [role="alert"]').all();
    console.log(`Error indicators: ${errors.length}`);

    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/dashboard-overview.png', fullPage: true });
  });

  test('Categories page - CRUD operations', async ({ page }) => {
    await page.goto(`${BASE}/ar/dashboard/categories`);
    await page.waitForLoadState('networkidle');

    // Check table exists
    const table = page.locator('table').first();
    const tableVisible = await table.isVisible().catch(() => false);
    console.log(`Categories table visible: ${tableVisible}`);

    if (tableVisible) {
      const rows = await page.locator('table tbody tr').all();
      console.log(`Table rows: ${rows.length}`);

      // Check table headers
      const headers = await page.locator('table thead th').allInnerTexts();
      console.log(`Table headers: ${headers.join(' | ')}`);
    }

    // Check create button
    const createBtn = page.locator('button:has-text("إنشاء"), button:has-text("create"), button:has-text("إضافة"), a:has-text("إنشاء")').first();
    const createBtnVisible = await createBtn.isVisible().catch(() => false);
    console.log(`Create button visible: ${createBtnVisible}`);

    // Check search
    const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"], input[placeholder*="search"]').first();
    const searchVisible = await searchInput.isVisible().catch(() => false);
    console.log(`Search input visible: ${searchVisible}`);

    await page.screenshot({ path: 'tests/screenshots/categories-page.png', fullPage: true });
  });

  test('Courses page structure', async ({ page }) => {
    await page.goto(`${BASE}/ar/dashboard/courses`);
    await page.waitForLoadState('networkidle');

    const content = await page.locator('main, [role="main"]').first().innerText().catch(() => '');
    console.log(`Courses page content length: ${content.length}`);
    console.log(`Courses page preview: ${content.substring(0, 500)}`);

    // Check for course cards or table
    const cards = await page.locator('[class*="card"]').all();
    console.log(`Course cards/sections: ${cards.length}`);

    // Create button
    const createBtn = page.locator('button:has-text("إنشاء"), a:has-text("إنشاء"), button:has-text("إضافة")').first();
    console.log(`Create button: ${await createBtn.isVisible().catch(() => false)}`);

    await page.screenshot({ path: 'tests/screenshots/courses-page.png', fullPage: true });
  });

  test('Bundles page structure', async ({ page }) => {
    await page.goto(`${BASE}/ar/dashboard/bundles`);
    await page.waitForLoadState('networkidle');

    const content = await page.locator('main, [role="main"]').first().innerText().catch(() => '');
    console.log(`Bundles page content length: ${content.length}`);
    console.log(`Bundles page preview: ${content.substring(0, 500)}`);

    await page.screenshot({ path: 'tests/screenshots/bundles-page.png', fullPage: true });
  });

  test('Applications page structure', async ({ page }) => {
    await page.goto(`${BASE}/ar/dashboard/applications`);
    await page.waitForLoadState('networkidle');

    const content = await page.locator('main, [role="main"]').first().innerText().catch(() => '');
    console.log(`Applications page content length: ${content.length}`);
    console.log(`Applications page preview: ${content.substring(0, 500)}`);

    // Check for filter tabs
    const tabs = await page.locator('[role="tab"], button[class*="tab"]').all();
    console.log(`Filter tabs: ${tabs.length}`);

    // Check table
    const tableRows = await page.locator('table tbody tr').all();
    console.log(`Table rows: ${tableRows.length}`);

    await page.screenshot({ path: 'tests/screenshots/applications-page.png', fullPage: true });
  });

  test('Users page structure', async ({ page }) => {
    await page.goto(`${BASE}/ar/dashboard/users`);
    await page.waitForLoadState('networkidle');

    const content = await page.locator('main, [role="main"]').first().innerText().catch(() => '');
    console.log(`Users page content length: ${content.length}`);
    console.log(`Users page preview: ${content.substring(0, 500)}`);

    await page.screenshot({ path: 'tests/screenshots/users-page.png', fullPage: true });
  });

  test('Payments page structure', async ({ page }) => {
    await page.goto(`${BASE}/ar/dashboard/payments`);
    await page.waitForLoadState('networkidle');

    const content = await page.locator('main, [role="main"]').first().innerText().catch(() => '');
    console.log(`Payments page content length: ${content.length}`);
    console.log(`Payments page preview: ${content.substring(0, 500)}`);

    await page.screenshot({ path: 'tests/screenshots/payments-page.png', fullPage: true });
  });

  test('Quizzes page structure', async ({ page }) => {
    await page.goto(`${BASE}/ar/dashboard/quizzes`);
    await page.waitForLoadState('networkidle');

    const content = await page.locator('main, [role="main"]').first().innerText().catch(() => '');
    console.log(`Quizzes page content length: ${content.length}`);
    console.log(`Quizzes page preview: ${content.substring(0, 500)}`);

    await page.screenshot({ path: 'tests/screenshots/quizzes-page.png', fullPage: true });
  });
});

// ─── PHASE 8: Finance Section Audit ──────────────────────────────
test.describe('Phase 8: Finance Pages', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  const financePages = [
    'payments', 'salaries', 'payslips', 'banks', 'currencies', 'expenses', 'coupons'
  ];

  for (const pg of financePages) {
    test(`Finance: ${pg}`, async ({ page }) => {
      await page.goto(`${BASE}/ar/dashboard/${pg}`);
      await page.waitForLoadState('networkidle');

      const content = await page.locator('main, [role="main"], body').first().innerText().catch(() => '');
      const hasTable = await page.locator('table').isVisible().catch(() => false);
      const hasCards = (await page.locator('[class*="card"]').all()).length;
      const hasCreateBtn = await page.locator('button:has-text("إنشاء"), button:has-text("إضافة"), a:has-text("إنشاء")').first().isVisible().catch(() => false);

      console.log(`[${pg}] Content: ${content.length} chars, Table: ${hasTable}, Cards: ${hasCards}, Create: ${hasCreateBtn}`);
      console.log(`[${pg}] Preview: ${content.substring(0, 300)}`);

      await page.screenshot({ path: `tests/screenshots/finance-${pg}.png`, fullPage: true });
    });
  }
});
