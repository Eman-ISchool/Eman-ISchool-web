/**
 * FULL E2E MULTI-PORTAL GOOGLE MEET EXECUTION AND VALIDATION
 *
 * Tests all three portals (Admin, Teacher, Student) with real browser execution,
 * real UI interaction, and real database validation.
 */
import { test, expect, Page, BrowserContext, Browser } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const LOCALE = 'en';

// Test accounts (from TEST_BYPASS in auth.ts)
const ACCOUNTS = {
  admin: { email: 'admin@eduverse.com', password: 'password123', role: 'admin', id: '00000000-0000-0000-0000-000000000003' },
  teacher: { email: 'teacher@eduverse.com', password: 'password123', role: 'teacher', id: '00000000-0000-0000-0000-000000000001' },
  student: { email: 'student@eduverse.com', password: 'password123', role: 'student', id: '00000000-0000-0000-0000-000000000002' },
};

// Evidence collector
interface Evidence {
  phase: string;
  step: string;
  url: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'BLOCKED';
  detail: string;
  consoleErrors: string[];
  networkErrors: string[];
  timestamp: string;
}

const evidence: Evidence[] = [];
const defects: { defect: string; rootCause: string; fix: string; retestResult: string }[] = [];

function record(phase: string, step: string, url: string, status: Evidence['status'], detail: string, consoleErrors: string[] = [], networkErrors: string[] = []) {
  evidence.push({ phase, step, url, status, detail, consoleErrors, networkErrors, timestamp: new Date().toISOString() });
}

// ─── Helper: Authenticate via NextAuth API ───────────────────────────────────
async function authenticateViaAPI(page: Page, email: string, password: string): Promise<boolean> {
  try {
    // Get CSRF token
    const csrfResponse = await page.request.get(`${BASE_URL}/api/auth/csrf`);
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;

    if (!csrfToken) {
      console.log('Failed to get CSRF token');
      return false;
    }

    // POST to credentials callback
    const authResponse = await page.request.post(`${BASE_URL}/api/auth/callback/credentials`, {
      form: {
        identifier: email,
        email: email,
        password: password,
        csrfToken: csrfToken,
        json: 'true',
      },
    });

    // Check if we got session cookies
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('next-auth'));
    return !!sessionCookie;
  } catch (error) {
    console.error('Auth error:', error);
    return false;
  }
}

// ─── Helper: Collect console errors on a page ────────────────────────────────
function setupConsoleCollector(page: Page): { errors: string[]; networkErrors: string[] } {
  const errors: string[] = [];
  const networkErrors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Skip noisy/expected errors
      if (!text.includes('favicon') && !text.includes('_next/static') && !text.includes('hydration')) {
        errors.push(text.substring(0, 200));
      }
    }
  });

  page.on('requestfailed', request => {
    const url = request.url();
    if (!url.includes('favicon') && !url.includes('_next/static')) {
      networkErrors.push(`${request.failure()?.errorText}: ${url.substring(0, 150)}`);
    }
  });

  return { errors, networkErrors };
}

// ─── Helper: Wait for page load and check basic health ───────────────────────
async function waitForPageReady(page: Page, timeout = 15000) {
  await page.waitForLoadState('domcontentloaded', { timeout });
  // Wait for Next.js hydration
  await page.waitForTimeout(1500);
}

// ─── Helper: Navigate and check ──────────────────────────────────────────────
async function navigateAndCheck(page: Page, path: string, description: string, phase: string): Promise<{ ok: boolean; consoleErrors: string[]; networkErrors: string[] }> {
  const collector = setupConsoleCollector(page);
  const url = `${BASE_URL}/${LOCALE}${path}`;

  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForPageReady(page);

    const status = response?.status() || 0;
    const ok = status >= 200 && status < 400;

    record(phase, description, url, ok ? 'PASS' : 'FAIL', `HTTP ${status}`, collector.errors, collector.networkErrors);
    return { ok, consoleErrors: collector.errors, networkErrors: collector.networkErrors };
  } catch (error) {
    record(phase, description, url, 'FAIL', `Navigation error: ${String(error).substring(0, 200)}`, collector.errors, collector.networkErrors);
    return { ok: false, consoleErrors: collector.errors, networkErrors: collector.networkErrors };
  }
}

// ─── Helper: Check all visible links/tabs in current page ────────────────────
async function checkTabsAndLinks(page: Page, phase: string, portalName: string) {
  // Find all tab triggers, nav links, and clickable buttons
  const tabs = await page.locator('[role="tab"], [data-state="active"], [data-state="inactive"]').all();

  for (let i = 0; i < tabs.length; i++) {
    try {
      const tab = tabs[i];
      const text = await tab.textContent();
      const isVisible = await tab.isVisible();
      if (!isVisible) continue;

      await tab.click();
      await page.waitForTimeout(1000);
      record(phase, `${portalName}: Tab click "${text?.trim()}"`, page.url(), 'PASS', 'Tab clicked successfully');
    } catch (error) {
      record(phase, `${portalName}: Tab click #${i}`, page.url(), 'FAIL', String(error).substring(0, 200));
    }
  }
}

// ─── Helper: Check sidebar navigation ────────────────────────────────────────
async function checkSidebarNavigation(page: Page, phase: string, portalName: string, navLinks: string[]) {
  for (const path of navLinks) {
    const collector = setupConsoleCollector(page);
    const url = `${BASE_URL}/${LOCALE}${path}`;
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await waitForPageReady(page);
      const status = response?.status() || 0;
      const ok = status >= 200 && status < 400;

      // Check for loading spinners stuck
      const hasInfiniteLoader = await page.locator('.animate-spin, [data-loading="true"]').count() > 0;
      await page.waitForTimeout(2000);
      const stillLoading = await page.locator('.animate-spin, [data-loading="true"]').count() > 0;

      if (hasInfiniteLoader && stillLoading) {
        record(phase, `${portalName}: ${path}`, url, 'WARN', `Possible infinite loading detected. HTTP ${status}`, collector.errors, collector.networkErrors);
      } else {
        record(phase, `${portalName}: ${path}`, url, ok ? 'PASS' : 'FAIL', `HTTP ${status}`, collector.errors, collector.networkErrors);
      }
    } catch (error) {
      record(phase, `${portalName}: ${path}`, url, 'FAIL', String(error).substring(0, 200), collector.errors, collector.networkErrors);
    }
  }
}

// =============================================================================
// PHASE 1: STARTUP AND HEALTH CHECK
// =============================================================================
test.describe('Phase 1: Startup and Health Check', () => {
  test('verify frontend, API, auth, and Google config', async ({ page }) => {
    const collector = setupConsoleCollector(page);

    // 1. Frontend loads
    const frontendResponse = await page.goto(`${BASE_URL}/${LOCALE}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForPageReady(page);
    const frontendOk = (frontendResponse?.status() || 0) < 400;
    record('Phase 1', 'Frontend loads', `${BASE_URL}/${LOCALE}`, frontendOk ? 'PASS' : 'FAIL', `HTTP ${frontendResponse?.status()}`);
    expect(frontendOk).toBeTruthy();

    // 2. API health check
    const healthResponse = await page.request.get(`${BASE_URL}/api/health`);
    const healthOk = healthResponse.status() < 400;
    let healthBody = '';
    try { healthBody = await healthResponse.text(); } catch {}
    record('Phase 1', 'API health', `${BASE_URL}/api/health`, healthOk ? 'PASS' : 'WARN', `HTTP ${healthResponse.status()} - ${healthBody.substring(0, 200)}`);

    // 3. Auth endpoint
    const csrfResponse = await page.request.get(`${BASE_URL}/api/auth/csrf`);
    const csrfOk = csrfResponse.status() === 200;
    let csrfData: any = {};
    try { csrfData = await csrfResponse.json(); } catch {}
    record('Phase 1', 'Auth CSRF endpoint', `${BASE_URL}/api/auth/csrf`, csrfOk ? 'PASS' : 'FAIL', `Has token: ${!!csrfData.csrfToken}`);
    expect(csrfOk).toBeTruthy();

    // 4. Session endpoint
    const sessionResponse = await page.request.get(`${BASE_URL}/api/auth/session`);
    record('Phase 1', 'Session endpoint', `${BASE_URL}/api/auth/session`, sessionResponse.status() === 200 ? 'PASS' : 'FAIL', `HTTP ${sessionResponse.status()}`);

    // 5. Login page loads
    const loginResult = await navigateAndCheck(page, '/login', 'Login page loads', 'Phase 1');
    expect(loginResult.ok).toBeTruthy();

    // 6. Check for visible form elements
    await page.goto(`${BASE_URL}/${LOCALE}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await waitForPageReady(page);
    const hasLoginForm = await page.locator('form').count() > 0;
    record('Phase 1', 'Login form present', page.url(), hasLoginForm ? 'PASS' : 'FAIL', `Forms found: ${await page.locator('form').count()}`);

    console.log('\n=== PHASE 1 RESULTS ===');
    evidence.filter(e => e.phase === 'Phase 1').forEach(e => {
      console.log(`[${e.status}] ${e.step} - ${e.detail}`);
      if (e.consoleErrors.length) console.log(`  Console errors: ${e.consoleErrors.join('; ')}`);
      if (e.networkErrors.length) console.log(`  Network errors: ${e.networkErrors.join('; ')}`);
    });
  });
});

// =============================================================================
// PHASE 2: ACCOUNT VALIDATION
// =============================================================================
test.describe('Phase 2: Account Validation', () => {
  test('authenticate all three roles via NextAuth API', async ({ page }) => {
    // Test admin login
    const adminAuth = await authenticateViaAPI(page, ACCOUNTS.admin.email, ACCOUNTS.admin.password);
    record('Phase 2', 'Admin login', `${BASE_URL}/api/auth`, adminAuth ? 'PASS' : 'FAIL', `Admin authenticated: ${adminAuth}`);

    if (adminAuth) {
      // Verify admin session
      const sessionResponse = await page.request.get(`${BASE_URL}/api/auth/session`);
      const session = await sessionResponse.json();
      const hasAdminRole = session?.user?.role === 'admin';
      record('Phase 2', 'Admin session role', `${BASE_URL}/api/auth/session`, hasAdminRole ? 'PASS' : 'WARN', `Role: ${session?.user?.role || 'undefined'}`);
    }

    // Clear cookies for next auth
    await page.context().clearCookies();

    // Test teacher login
    const teacherAuth = await authenticateViaAPI(page, ACCOUNTS.teacher.email, ACCOUNTS.teacher.password);
    record('Phase 2', 'Teacher login', `${BASE_URL}/api/auth`, teacherAuth ? 'PASS' : 'FAIL', `Teacher authenticated: ${teacherAuth}`);

    if (teacherAuth) {
      const sessionResponse = await page.request.get(`${BASE_URL}/api/auth/session`);
      const session = await sessionResponse.json();
      const hasTeacherRole = session?.user?.role === 'teacher';
      record('Phase 2', 'Teacher session role', `${BASE_URL}/api/auth/session`, hasTeacherRole ? 'PASS' : 'WARN', `Role: ${session?.user?.role || 'undefined'}`);
    }

    await page.context().clearCookies();

    // Test student login
    const studentAuth = await authenticateViaAPI(page, ACCOUNTS.student.email, ACCOUNTS.student.password);
    record('Phase 2', 'Student login', `${BASE_URL}/api/auth`, studentAuth ? 'PASS' : 'FAIL', `Student authenticated: ${studentAuth}`);

    if (studentAuth) {
      const sessionResponse = await page.request.get(`${BASE_URL}/api/auth/session`);
      const session = await sessionResponse.json();
      const hasStudentRole = session?.user?.role === 'student';
      record('Phase 2', 'Student session role', `${BASE_URL}/api/auth/session`, hasStudentRole ? 'PASS' : 'WARN', `Role: ${session?.user?.role || 'undefined'}`);
    }

    console.log('\n=== PHASE 2 RESULTS ===');
    evidence.filter(e => e.phase === 'Phase 2').forEach(e => {
      console.log(`[${e.status}] ${e.step} - ${e.detail}`);
    });

    expect(adminAuth).toBeTruthy();
    expect(teacherAuth).toBeTruthy();
    expect(studentAuth).toBeTruthy();
  });
});

// =============================================================================
// PHASE 3: MULTI-PORTAL LIVE TESTS (using isolated browser contexts)
// =============================================================================

test.describe('Phase 3: Admin Portal', () => {
  let adminContext: BrowserContext;
  let adminPage: Page;

  test.beforeAll(async ({ browser }) => {
    adminContext = await browser.newContext();
    adminPage = await adminContext.newPage();
    const authed = await authenticateViaAPI(adminPage, ACCOUNTS.admin.email, ACCOUNTS.admin.password);
    expect(authed).toBeTruthy();
  });

  test.afterAll(async () => {
    await adminContext?.close();
  });

  test('admin dashboard and all major pages', async () => {
    const page = adminPage;

    // Admin dashboard paths to test (legacy admin + portal admin)
    const adminPages = [
      '/dashboard',
      '/admin',
      '/admin/home',
      '/admin/users',
      '/admin/grades',
      '/admin/lessons',
      '/admin/calendar',
      '/admin/attendance',
      '/admin/content',
      '/admin/fees',
      '/admin/enrollment-applications',
      '/admin/enrollment-reports',
      '/admin/settings',
      '/admin/support',
      '/admin/live',
      '/admin/meetings',
      '/admin/reels',
      '/admin/coupons-expenses',
    ];

    await checkSidebarNavigation(page, 'Phase 3 Admin', 'Admin', adminPages);

    // Portal admin pages
    const portalAdminPages = [
      '/admin/courses',
      '/admin/quizzes',
      '/admin/bundles',
      '/admin/profile',
    ];

    // Try portal routes (might be under (portal) group)
    for (const path of portalAdminPages) {
      const collector = setupConsoleCollector(page);
      const url = `${BASE_URL}/${LOCALE}${path}`;
      try {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await waitForPageReady(page);
        const status = response?.status() || 0;
        record('Phase 3 Admin', `Admin Portal: ${path}`, url, status < 400 ? 'PASS' : 'FAIL', `HTTP ${status}`, collector.errors, collector.networkErrors);
      } catch (error) {
        record('Phase 3 Admin', `Admin Portal: ${path}`, url, 'FAIL', String(error).substring(0, 200), collector.errors, collector.networkErrors);
      }
    }

    // Check tabs on dashboard page
    await page.goto(`${BASE_URL}/${LOCALE}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await waitForPageReady(page);
    await checkTabsAndLinks(page, 'Phase 3 Admin', 'Admin Dashboard');

    console.log('\n=== PHASE 3 ADMIN RESULTS ===');
    evidence.filter(e => e.phase === 'Phase 3 Admin').forEach(e => {
      console.log(`[${e.status}] ${e.step} - ${e.detail}`);
      if (e.consoleErrors.length) console.log(`  Console: ${e.consoleErrors.join('; ')}`);
      if (e.networkErrors.length) console.log(`  Network: ${e.networkErrors.join('; ')}`);
    });
  });
});

test.describe('Phase 3: Teacher Portal', () => {
  let teacherContext: BrowserContext;
  let teacherPage: Page;

  test.beforeAll(async ({ browser }) => {
    teacherContext = await browser.newContext();
    teacherPage = await teacherContext.newPage();
    const authed = await authenticateViaAPI(teacherPage, ACCOUNTS.teacher.email, ACCOUNTS.teacher.password);
    expect(authed).toBeTruthy();
  });

  test.afterAll(async () => {
    await teacherContext?.close();
  });

  test('teacher dashboard and all major pages', async () => {
    const page = teacherPage;

    const teacherPages = [
      '/teacher/home',
      '/teacher/courses',
      '/teacher/lessons',
      '/teacher/grades',
      '/teacher/assessments',
      '/teacher/materials',
      '/teacher/subjects',
      '/teacher/calendar',
      '/teacher/chat',
      '/teacher/profile',
      '/teacher/reels',
    ];

    await checkSidebarNavigation(page, 'Phase 3 Teacher', 'Teacher', teacherPages);

    // Check tabs on teacher home
    await page.goto(`${BASE_URL}/${LOCALE}/teacher/home`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await waitForPageReady(page);
    await checkTabsAndLinks(page, 'Phase 3 Teacher', 'Teacher Home');

    // Check courses page for course listing
    await page.goto(`${BASE_URL}/${LOCALE}/teacher/courses`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await waitForPageReady(page);

    const courseCards = await page.locator('[class*="card"], [class*="course"], a[href*="courses/"]').count();
    record('Phase 3 Teacher', 'Teacher courses listing', page.url(), courseCards > 0 ? 'PASS' : 'WARN', `Course cards found: ${courseCards}`);

    // Try to navigate to create lesson page
    const createLessonResult = await navigateAndCheck(page, '/teacher/lessons/new', 'Create lesson page', 'Phase 3 Teacher');

    console.log('\n=== PHASE 3 TEACHER RESULTS ===');
    evidence.filter(e => e.phase === 'Phase 3 Teacher').forEach(e => {
      console.log(`[${e.status}] ${e.step} - ${e.detail}`);
      if (e.consoleErrors.length) console.log(`  Console: ${e.consoleErrors.join('; ')}`);
      if (e.networkErrors.length) console.log(`  Network: ${e.networkErrors.join('; ')}`);
    });
  });

  test('teacher: create lesson and trigger Meet link', async () => {
    const page = teacherPage;
    const collector = setupConsoleCollector(page);

    // First, check if there are any existing courses
    await page.goto(`${BASE_URL}/${LOCALE}/teacher/courses`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await waitForPageReady(page);

    // Look for course links to get a course ID
    const courseLinks = await page.locator('a[href*="/teacher/courses/"]').all();
    let courseId: string | null = null;

    if (courseLinks.length > 0) {
      const href = await courseLinks[0].getAttribute('href');
      const match = href?.match(/courses\/([^/]+)/);
      courseId = match?.[1] || null;
      record('Phase 3 Teacher', 'Found existing course', page.url(), 'PASS', `Course ID: ${courseId}`);
    } else {
      record('Phase 3 Teacher', 'No courses found for teacher', page.url(), 'WARN', 'No courses assigned to test teacher. Need admin to create/assign.');
    }

    // Try API-based course listing
    const coursesApiResponse = await page.request.get(`${BASE_URL}/api/courses`);
    let coursesData: any = [];
    try {
      const body = await coursesApiResponse.json();
      coursesData = body.courses || body.data || body || [];
      record('Phase 3 Teacher', 'Courses API', `${BASE_URL}/api/courses`, coursesApiResponse.status() < 400 ? 'PASS' : 'FAIL', `HTTP ${coursesApiResponse.status()}, courses: ${Array.isArray(coursesData) ? coursesData.length : 'N/A'}`);
    } catch {
      record('Phase 3 Teacher', 'Courses API', `${BASE_URL}/api/courses`, 'FAIL', `HTTP ${coursesApiResponse.status()}`);
    }

    // If we have a course, try to create a lesson and trigger Meet
    if (courseId) {
      // Navigate to course detail
      await page.goto(`${BASE_URL}/${LOCALE}/teacher/courses/${courseId}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await waitForPageReady(page);
      record('Phase 3 Teacher', 'Course detail page', page.url(), 'PASS', `Loaded course ${courseId}`);

      // Check tabs in course detail
      await checkTabsAndLinks(page, 'Phase 3 Teacher', 'Course Detail');

      // Look for lesson creation or existing lessons
      const lessonLinks = await page.locator('a[href*="lessons/"]').all();
      if (lessonLinks.length > 0) {
        const lessonHref = await lessonLinks[0].getAttribute('href');
        record('Phase 3 Teacher', 'Found lessons in course', page.url(), 'PASS', `Lesson link: ${lessonHref}`);

        // Navigate to the lesson
        await lessonLinks[0].click();
        await waitForPageReady(page);
        record('Phase 3 Teacher', 'Lesson detail page', page.url(), 'PASS', 'Navigated to lesson');

        // Look for Meet link button or existing Meet link
        const meetButton = page.locator('button:has-text("Meet"), button:has-text("meeting"), button:has-text("اجتماع"), a[href*="meet.google.com"]');
        const hasMeetButton = await meetButton.count() > 0;
        record('Phase 3 Teacher', 'Meet button/link in lesson', page.url(), hasMeetButton ? 'PASS' : 'WARN', `Meet elements found: ${await meetButton.count()}`);

        if (hasMeetButton) {
          // Try clicking the meet button
          try {
            await meetButton.first().click();
            await page.waitForTimeout(3000);
            record('Phase 3 Teacher', 'Meet button clicked', page.url(), 'PASS', 'Meet action triggered');
          } catch (error) {
            record('Phase 3 Teacher', 'Meet button click', page.url(), 'FAIL', String(error).substring(0, 200));
          }
        }
      } else {
        record('Phase 3 Teacher', 'No lessons found in course', page.url(), 'WARN', 'Need to create a lesson');
      }
    }

    // Try Meet creation via API directly
    if (courseId) {
      const lessonsApiResponse = await page.request.get(`${BASE_URL}/api/courses/${courseId}/lessons`);
      let lessonsData: any = [];
      try {
        const body = await lessonsApiResponse.json();
        lessonsData = body.lessons || body.data || body || [];
        record('Phase 3 Teacher', 'Lessons API', `${BASE_URL}/api/courses/${courseId}/lessons`, lessonsApiResponse.status() < 400 ? 'PASS' : 'FAIL', `HTTP ${lessonsApiResponse.status()}, lessons: ${Array.isArray(lessonsData) ? lessonsData.length : 'N/A'}`);

        // If we have a lesson, try to create/get Meet link
        if (Array.isArray(lessonsData) && lessonsData.length > 0) {
          const lessonId = lessonsData[0].id;
          const meetResponse = await page.request.post(`${BASE_URL}/api/lessons/${lessonId}/meeting`, {
            data: {}
          });
          let meetData: any = {};
          try { meetData = await meetResponse.json(); } catch {}
          record('Phase 4 Meet', `Create Meet for lesson ${lessonId}`, `${BASE_URL}/api/lessons/${lessonId}/meeting`, meetResponse.status() < 400 ? 'PASS' : 'FAIL', `HTTP ${meetResponse.status()} - ${JSON.stringify(meetData).substring(0, 300)}`);

          // Check if meet link was stored
          if (meetData.meetLink || meetData.meet_link || meetData.meeting?.meet_link) {
            const meetLink = meetData.meetLink || meetData.meet_link || meetData.meeting?.meet_link;
            record('Phase 4 Meet', 'Meet link generated', '', 'PASS', `Link: ${meetLink}`);

            // Validate link format
            const isValidMeetLink = meetLink.includes('meet.google.com');
            record('Phase 4 Meet', 'Meet link format validation', '', isValidMeetLink ? 'PASS' : 'FAIL', `Valid format: ${isValidMeetLink}, Link: ${meetLink}`);
          } else {
            record('Phase 4 Meet', 'Meet link generation', '', 'FAIL', `No meet link in response: ${JSON.stringify(meetData).substring(0, 300)}`);
          }
        }
      } catch {
        record('Phase 3 Teacher', 'Lessons API parse', '', 'FAIL', `HTTP ${lessonsApiResponse.status()}`);
      }
    }

    console.log('\n=== PHASE 3 TEACHER (Lesson/Meet) RESULTS ===');
    evidence.filter(e => e.phase === 'Phase 3 Teacher' || e.phase === 'Phase 4 Meet').forEach(e => {
      console.log(`[${e.status}] ${e.step} - ${e.detail}`);
    });
  });
});

test.describe('Phase 3: Student Portal', () => {
  let studentContext: BrowserContext;
  let studentPage: Page;

  test.beforeAll(async ({ browser }) => {
    studentContext = await browser.newContext();
    studentPage = await studentContext.newPage();
    const authed = await authenticateViaAPI(studentPage, ACCOUNTS.student.email, ACCOUNTS.student.password);
    expect(authed).toBeTruthy();
  });

  test.afterAll(async () => {
    await studentContext?.close();
  });

  test('student dashboard and all major pages', async () => {
    const page = studentPage;

    const studentPages = [
      '/student/home',
      '/student/courses',
      '/student/assessments',
      '/student/attendance',
      '/student/calendar',
      '/student/chat',
      '/student/profile',
      '/student/reels',
      '/student/support',
    ];

    await checkSidebarNavigation(page, 'Phase 3 Student', 'Student', studentPages);

    // Check tabs on student home
    await page.goto(`${BASE_URL}/${LOCALE}/student/home`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await waitForPageReady(page);
    await checkTabsAndLinks(page, 'Phase 3 Student', 'Student Home');

    // Check courses page
    await page.goto(`${BASE_URL}/${LOCALE}/student/courses`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await waitForPageReady(page);

    const courseElements = await page.locator('[class*="card"], [class*="course"], a[href*="courses/"]').count();
    record('Phase 3 Student', 'Student courses listing', page.url(), courseElements > 0 ? 'PASS' : 'WARN', `Course elements found: ${courseElements}`);

    // If courses exist, check for Meet link visibility
    const courseLinks = await page.locator('a[href*="/student/courses/"]').all();
    if (courseLinks.length > 0) {
      await courseLinks[0].click();
      await waitForPageReady(page);
      record('Phase 3 Student', 'Course detail page', page.url(), 'PASS', 'Navigated to course detail');

      // Look for Meet link
      const meetElements = await page.locator('a[href*="meet.google.com"], [class*="meet"], button:has-text("Meet"), button:has-text("Join")').count();
      record('Phase 3 Student', 'Meet link in student course', page.url(), meetElements > 0 ? 'PASS' : 'WARN', `Meet elements: ${meetElements}`);

      // Check lessons
      const lessonLinks = await page.locator('a[href*="lessons/"]').all();
      if (lessonLinks.length > 0) {
        await lessonLinks[0].click();
        await waitForPageReady(page);
        record('Phase 3 Student', 'Lesson detail page', page.url(), 'PASS', 'Navigated to lesson');

        const meetLinksInLesson = await page.locator('a[href*="meet.google.com"]').count();
        record('Phase 3 Student', 'Meet link in student lesson', page.url(), meetLinksInLesson > 0 ? 'PASS' : 'WARN', `Meet links: ${meetLinksInLesson}`);
      }
    }

    console.log('\n=== PHASE 3 STUDENT RESULTS ===');
    evidence.filter(e => e.phase === 'Phase 3 Student').forEach(e => {
      console.log(`[${e.status}] ${e.step} - ${e.detail}`);
      if (e.consoleErrors.length) console.log(`  Console: ${e.consoleErrors.join('; ')}`);
      if (e.networkErrors.length) console.log(`  Network: ${e.networkErrors.join('; ')}`);
    });
  });
});

// =============================================================================
// PHASE 4: GOOGLE MEET DEEP VALIDATION (API-level)
// =============================================================================
test.describe('Phase 4: Google Meet Deep Validation', () => {
  test('validate Meet link creation and cross-portal visibility', async ({ browser }) => {
    // Auth as teacher
    const teacherCtx = await browser.newContext();
    const teacherPage = await teacherCtx.newPage();
    await authenticateViaAPI(teacherPage, ACCOUNTS.teacher.email, ACCOUNTS.teacher.password);

    // Get courses
    const coursesResponse = await teacherPage.request.get(`${BASE_URL}/api/courses`);
    let courses: any[] = [];
    try {
      const body = await coursesResponse.json();
      courses = body.courses || body.data || body || [];
    } catch {}

    if (!Array.isArray(courses) || courses.length === 0) {
      record('Phase 4 Meet', 'No courses available', `${BASE_URL}/api/courses`, 'BLOCKED', 'Cannot test Meet - no courses exist');
      console.log('\n=== PHASE 4 MEET RESULTS ===');
      console.log('[BLOCKED] No courses available for Meet testing');
      await teacherCtx.close();
      return;
    }

    const courseId = courses[0].id;

    // Get lessons
    const lessonsResponse = await teacherPage.request.get(`${BASE_URL}/api/courses/${courseId}/lessons`);
    let lessons: any[] = [];
    try {
      const body = await lessonsResponse.json();
      lessons = body.lessons || body.data || body || [];
    } catch {}

    if (!Array.isArray(lessons) || lessons.length === 0) {
      record('Phase 4 Meet', 'No lessons available', `${BASE_URL}/api/courses/${courseId}/lessons`, 'BLOCKED', 'Cannot test Meet - no lessons exist');
      console.log('[BLOCKED] No lessons available for Meet testing');
      await teacherCtx.close();
      return;
    }

    const lessonId = lessons[0].id;
    record('Phase 4 Meet', 'Target lesson found', '', 'PASS', `Course: ${courseId}, Lesson: ${lessonId}`);

    // Create/get Meet link via API
    const meetResponse = await teacherPage.request.post(`${BASE_URL}/api/lessons/${lessonId}/meeting`, { data: {} });
    let meetData: any = {};
    try { meetData = await meetResponse.json(); } catch {}

    const meetLink = meetData.meetLink || meetData.meet_link || meetData.meeting?.meet_link || meetData.data?.meet_link || '';
    record('Phase 4 Meet', 'Meet API response', `${BASE_URL}/api/lessons/${lessonId}/meeting`, meetResponse.status() < 400 ? 'PASS' : 'FAIL', `HTTP ${meetResponse.status()}, Link: ${meetLink || 'NONE'}, Full: ${JSON.stringify(meetData).substring(0, 500)}`);

    if (meetLink) {
      // Validate format
      const validFormat = meetLink.includes('meet.google.com');
      record('Phase 4 Meet', 'Link format', '', validFormat ? 'PASS' : 'FAIL', meetLink);

      // Check persistence - re-fetch
      const refetchResponse = await teacherPage.request.get(`${BASE_URL}/api/lessons/${lessonId}`);
      let lessonData: any = {};
      try { lessonData = await refetchResponse.json(); } catch {}
      const persistedLink = lessonData.meet_link || lessonData.lesson?.meet_link || lessonData.data?.meet_link || '';
      record('Phase 4 Meet', 'Link persistence (re-fetch)', '', persistedLink ? 'PASS' : 'WARN', `Persisted: ${persistedLink || 'NOT FOUND'}`);

      // Check from teacher portal UI
      await teacherPage.goto(`${BASE_URL}/${LOCALE}/teacher/lessons/${lessonId}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await waitForPageReady(teacherPage);
      const teacherMeetVisible = await teacherPage.locator(`a[href*="meet.google.com"], text="${meetLink}"`).count();
      record('Phase 4 Meet', 'Visible in teacher portal', teacherPage.url(), teacherMeetVisible > 0 ? 'PASS' : 'WARN', `Meet elements: ${teacherMeetVisible}`);

      // Check from student portal
      const studentCtx = await browser.newContext();
      const studentPage = await studentCtx.newPage();
      await authenticateViaAPI(studentPage, ACCOUNTS.student.email, ACCOUNTS.student.password);

      await studentPage.goto(`${BASE_URL}/${LOCALE}/student/courses/${courseId}/lessons/${lessonId}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await waitForPageReady(studentPage);
      const studentMeetVisible = await studentPage.locator(`a[href*="meet.google.com"], text="${meetLink}"`).count();
      record('Phase 4 Meet', 'Visible in student portal', studentPage.url(), studentMeetVisible > 0 ? 'PASS' : 'WARN', `Meet elements: ${studentMeetVisible}`);

      await studentCtx.close();
    } else {
      record('Phase 4 Meet', 'Meet link creation', '', 'FAIL', `No Meet link generated. Response: ${JSON.stringify(meetData).substring(0, 500)}`);
    }

    await teacherCtx.close();

    console.log('\n=== PHASE 4 MEET DEEP VALIDATION RESULTS ===');
    evidence.filter(e => e.phase === 'Phase 4 Meet').forEach(e => {
      console.log(`[${e.status}] ${e.step} - ${e.detail}`);
    });
  });
});

// =============================================================================
// PHASE 5: FULL SWEEP - Additional pages, buttons, forms
// =============================================================================
test.describe('Phase 5: Full Page Sweep', () => {
  test('sweep all public pages', async ({ page }) => {
    const publicPages = [
      '/',
      '/about-us',
      '/courses',
      '/contact',
      '/join',
      '/services',
      '/blogs',
    ];

    for (const path of publicPages) {
      await navigateAndCheck(page, path, `Public: ${path}`, 'Phase 5 Sweep');
    }

    console.log('\n=== PHASE 5 PUBLIC PAGES ===');
    evidence.filter(e => e.phase === 'Phase 5 Sweep').forEach(e => {
      console.log(`[${e.status}] ${e.step} - ${e.detail}`);
    });
  });

  test('sweep admin reports pages', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await authenticateViaAPI(page, ACCOUNTS.admin.email, ACCOUNTS.admin.password);

    const reportPages = [
      '/admin/reports',
      '/admin/reports/sales',
      '/admin/reports/teachers',
      '/admin/reports/students',
      '/admin/reports/courses',
      '/dashboard/admin/reports',
    ];

    for (const path of reportPages) {
      await navigateAndCheck(page, path, `Admin Report: ${path}`, 'Phase 5 Reports');
    }

    await ctx.close();

    console.log('\n=== PHASE 5 ADMIN REPORTS ===');
    evidence.filter(e => e.phase === 'Phase 5 Reports').forEach(e => {
      console.log(`[${e.status}] ${e.step} - ${e.detail}`);
    });
  });

  test('sweep dashboard pages as admin', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await authenticateViaAPI(page, ACCOUNTS.admin.email, ACCOUNTS.admin.password);

    const dashboardPages = [
      '/dashboard',
      '/dashboard/calendar',
      '/dashboard/live',
      '/dashboard/messages',
      '/dashboard/profile',
      '/dashboard/settings',
      '/dashboard/students',
      '/dashboard/teachers',
      '/dashboard/users',
      '/dashboard/fees',
      '/dashboard/applications',
    ];

    for (const path of dashboardPages) {
      await navigateAndCheck(page, path, `Dashboard: ${path}`, 'Phase 5 Dashboard');
    }

    await ctx.close();

    console.log('\n=== PHASE 5 DASHBOARD PAGES ===');
    evidence.filter(e => e.phase === 'Phase 5 Dashboard').forEach(e => {
      console.log(`[${e.status}] ${e.step} - ${e.detail}`);
    });
  });
});

// =============================================================================
// FINAL REPORT
// =============================================================================
test.describe('Final Report', () => {
  test('generate comprehensive report', async () => {
    console.log('\n' + '='.repeat(80));
    console.log('FULL E2E MULTI-PORTAL VALIDATION REPORT');
    console.log('='.repeat(80));

    // Summary by phase
    const phases = ['Phase 1', 'Phase 2', 'Phase 3 Admin', 'Phase 3 Teacher', 'Phase 3 Student', 'Phase 4 Meet', 'Phase 5 Sweep', 'Phase 5 Reports', 'Phase 5 Dashboard'];

    for (const phase of phases) {
      const items = evidence.filter(e => e.phase === phase);
      if (items.length === 0) continue;

      const passed = items.filter(e => e.status === 'PASS').length;
      const failed = items.filter(e => e.status === 'FAIL').length;
      const warned = items.filter(e => e.status === 'WARN').length;
      const blocked = items.filter(e => e.status === 'BLOCKED').length;

      console.log(`\n--- ${phase} ---`);
      console.log(`  PASS: ${passed} | FAIL: ${failed} | WARN: ${warned} | BLOCKED: ${blocked}`);

      items.filter(e => e.status === 'FAIL' || e.status === 'BLOCKED').forEach(e => {
        console.log(`  [${e.status}] ${e.step}: ${e.detail}`);
      });
    }

    // All console errors
    const allConsoleErrors = evidence.flatMap(e => e.consoleErrors).filter(Boolean);
    if (allConsoleErrors.length > 0) {
      console.log('\n--- ALL CONSOLE ERRORS ---');
      [...new Set(allConsoleErrors)].forEach(e => console.log(`  ${e}`));
    }

    // All network errors
    const allNetworkErrors = evidence.flatMap(e => e.networkErrors).filter(Boolean);
    if (allNetworkErrors.length > 0) {
      console.log('\n--- ALL NETWORK ERRORS ---');
      [...new Set(allNetworkErrors)].forEach(e => console.log(`  ${e}`));
    }

    // Defects
    if (defects.length > 0) {
      console.log('\n--- DEFECTS ---');
      defects.forEach((d, i) => {
        console.log(`  ${i + 1}. ${d.defect}`);
        console.log(`     Root cause: ${d.rootCause}`);
        console.log(`     Fix: ${d.fix}`);
        console.log(`     Retest: ${d.retestResult}`);
      });
    }

    const totalPassed = evidence.filter(e => e.status === 'PASS').length;
    const totalFailed = evidence.filter(e => e.status === 'FAIL').length;
    const totalWarned = evidence.filter(e => e.status === 'WARN').length;
    const totalBlocked = evidence.filter(e => e.status === 'BLOCKED').length;

    console.log('\n--- FINAL VERDICT ---');
    console.log(`Total: ${evidence.length} checks | PASS: ${totalPassed} | FAIL: ${totalFailed} | WARN: ${totalWarned} | BLOCKED: ${totalBlocked}`);

    if (totalFailed === 0 && totalBlocked === 0) {
      console.log('VERDICT: PASS - All checks passed');
    } else {
      console.log(`VERDICT: ${totalFailed > 0 ? 'FAIL' : 'PARTIAL'} - ${totalFailed} failures, ${totalBlocked} blocked, ${totalWarned} warnings`);
    }

    console.log('='.repeat(80));
  });
});
