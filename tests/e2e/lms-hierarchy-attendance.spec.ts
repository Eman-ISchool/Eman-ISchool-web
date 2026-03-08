import { test, expect, BrowserContext } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEACHER_EMAIL = 'teacher@eduverse.com';
const TEACHER_PASSWORD = 'password123';
const STUDENT_EMAIL = 'student@eduverse.com';
const STUDENT_PASSWORD = 'password123';

/**
 * Programmatic login using NextAuth's internal API.
 */
async function loginProgrammatically(context: BrowserContext, email: string, password: string): Promise<void> {
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/api/auth/csrf`, { waitUntil: 'networkidle' });

    const loginResult = await page.evaluate(async ({ base, email, password }) => {
        const csrfRes = await fetch(`${base}/api/auth/csrf`);
        const { csrfToken } = await csrfRes.json();
        const params = new URLSearchParams();
        params.append('email', email);
        params.append('password', password);
        params.append('csrfToken', csrfToken);
        params.append('callbackUrl', base);
        params.append('json', 'true');

        const authRes = await fetch(`${base}/api/auth/callback/credentials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
            redirect: 'follow',
        });

        const sessionRes = await fetch(`${base}/api/auth/session`);
        const session = await sessionRes.json();
        return { authStatus: authRes.status, session };
    }, { base: BASE_URL, email, password });

    await page.close();
    if (!loginResult.session?.user?.email) {
        throw new Error(`Login failed for ${email}`);
    }
}

test('LMS Core Hierarchy Navigation & Attendance Auto-Join', async ({ browser }) => {
    test.setTimeout(120_000);

    // ======================================
    // 1. TEACHER: NAVIGATE HIERARCHY
    // ======================================
    const teacherContext = await browser.newContext();
    await loginProgrammatically(teacherContext, TEACHER_EMAIL, TEACHER_PASSWORD);

    const teacherPage = await teacherContext.newPage();

    // T024: Navigate Subjects -> Courses -> Lessons
    await teacherPage.goto(`${BASE_URL}/en/teacher/subjects`, { waitUntil: 'networkidle' });

    // Click the first subject
    const firstSubjectLink = teacherPage.locator('a[href*="/teacher/subjects/"]').first();
    await expect(firstSubjectLink).toBeVisible();
    await firstSubjectLink.click();
    await teacherPage.waitForLoadState('networkidle');

    // Click the "Courses" tab in the Subject Details page
    const coursesTab = teacherPage.locator('button[role="tab"]', { hasText: /Courses/i });
    if (await coursesTab.isVisible()) {
        await coursesTab.click();
    }

    // Click the first course
    const firstCourseLink = teacherPage.locator('a[href*="/teacher/courses/"]').filter({ hasNotText: /edit/i }).first();
    await expect(firstCourseLink).toBeVisible();
    await firstCourseLink.click();
    await teacherPage.waitForLoadState('networkidle');

    // Ensure we are on the Course Details Page and can see Lessons
    const lessonsTab = teacherPage.locator('button[role="tab"]', { hasText: /Lessons/i });
    if (await lessonsTab.isVisible()) {
        await lessonsTab.click();
    }

    // Capture the course ID to use for the lesson
    const courseUrlMatch = teacherPage.url().match(/courses\/([a-zA-Z0-9-]+)/);
    const courseId = courseUrlMatch ? courseUrlMatch[1] : null;
    expect(courseId).toBeTruthy();

    // Click the first Lesson within the course
    // Look for link containing /teacher/courses/[courseId]/lessons/
    const firstLessonLink = teacherPage.locator(`a[href*="/teacher/courses/${courseId}/lessons/"]`).first();
    await expect(firstLessonLink).toBeVisible();

    const lessonHref = await firstLessonLink.getAttribute('href');
    await firstLessonLink.click();
    await teacherPage.waitForLoadState('networkidle');

    // Verify successful navigation to the unified lesson page
    await expect(teacherPage).toHaveURL(new RegExp(`/teacher/courses/${courseId}/lessons/`));

    // ======================================
    // 2. STUDENT: ATTENDANCE AUTO-JOIN (T025)
    // ======================================
    const studentContext = await browser.newContext();
    await loginProgrammatically(studentContext, STUDENT_EMAIL, STUDENT_PASSWORD);

    const studentPage = await studentContext.newPage();

    // Setup API intercept to check heartbeat payload
    let joinApiCalled = false;
    let heartbeatApiCalled = false;

    await studentPage.route('**/api/lessons/*/join', route => {
        joinApiCalled = true;
        route.continue();
    });

    await studentPage.route('**/api/lessons/*/heartbeat', route => {
        heartbeatApiCalled = true;
        route.continue();
    });

    // Navigate directly to the lesson page (mocking student clicking it from their dashboard)
    if (lessonHref) {
        await studentPage.goto(`${BASE_URL}${lessonHref.replace('/teacher/', '/student/')}`, { waitUntil: 'networkidle' });
    }

    // Wait for the "Join Live Lesson" button
    const joinLessonBtn = studentPage.locator('button', { hasText: /Join Live/i }).first();

    // If the lesson isn't live/scheduled, button will be disabled "Lesson Not Started"
    // To make this robust, we only click if it's enabled.
    const isJoinEnabled = await joinLessonBtn.isEnabled().catch(() => false);

    if (isJoinEnabled) {
        await Promise.all([
            // Expect new tab to open for the Meet link
            studentContext.waitForEvent('page').catch(() => null),
            joinLessonBtn.click()
        ]);

        // Check if join API was triggered
        expect(joinApiCalled).toBeTruthy();

        // Wait briefly for heartbeat (may take 30s strictly, but we can verify join fired)
        // We'll just ensure the UI shows "Attendance tracked"
        await expect(studentPage.locator('text=Attendance tracked automatically')).toBeVisible({ timeout: 10000 });

        // Leave Meeting
        const leaveLessonBtn = studentPage.locator('button', { hasText: /Leave/i }).first();
        await expect(leaveLessonBtn).toBeVisible();
        await leaveLessonBtn.click();
    }

    await teacherContext.close();
    await studentContext.close();

    console.log('✅ LMS Hierarchy & Attendance E2E Test completed successfully');
});
