import { test, expect, BrowserContext, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEACHER_EMAIL = 'teacher@eduverse.com';
const TEACHER_PASSWORD = 'password123';
const STUDENT_EMAIL = 'student@eduverse.com';
const STUDENT_PASSWORD = 'password123';

/**
 * Programmatic login using NextAuth's internal API.
 * All requests happen from the SAME page so cookies are shared correctly.
 */
async function loginProgrammatically(context: BrowserContext, email: string, password: string): Promise<void> {
    const page = await context.newPage();

    // Navigate to establish cookies
    await page.goto(`${BASE_URL}/api/auth/csrf`, { waitUntil: 'networkidle' });

    // Do CSRF fetch + credentials POST from within the same page context
    const loginResult = await page.evaluate(async ({ base, email, password }) => {
        // Step 1: Get CSRF token (cookies already set by page load above)
        const csrfRes = await fetch(`${base}/api/auth/csrf`);
        const { csrfToken } = await csrfRes.json();

        // Step 2: POST credentials with the CSRF token
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

        const authBody = await authRes.text();

        // Step 3: Check session
        const sessionRes = await fetch(`${base}/api/auth/session`);
        const session = await sessionRes.json();

        return { authStatus: authRes.status, authBody, session };
    }, { base: BASE_URL, email, password });

    await page.close();

    if (!loginResult.session?.user?.email) {
        console.error('Auth response:', loginResult.authStatus, loginResult.authBody);
        throw new Error(`Login failed for ${email}. Status: ${loginResult.authStatus}. Session: ${JSON.stringify(loginResult.session)}`);
    }

    console.log(`Logged in as: ${loginResult.session.user.email} (role: ${loginResult.session.user.role})`);
}

test('Full Teacher → Student E2E Flow', async ({ browser }) => {
    test.setTimeout(180_000);

    const uniqueId = `E2E-${Date.now()}`;
    const courseTitle = `Test Course ${uniqueId}`;
    const sessionTitle = `Live Session ${uniqueId}`;

    // ======================================
    // TEACHER FLOW
    // ======================================
    const teacherContext = await browser.newContext();

    // CHECKPOINT 1: Teacher Login
    console.log('── CHECKPOINT 1: Teacher Login ──');
    await loginProgrammatically(teacherContext, TEACHER_EMAIL, TEACHER_PASSWORD);

    const teacherPage = await teacherContext.newPage();
    await teacherPage.goto(`${BASE_URL}/en/e2e-flow`, { waitUntil: 'networkidle' });
    await teacherPage.waitForTimeout(3000);

    await expect(teacherPage.locator('h1')).toContainText('E2E Flow Test Dashboard', { timeout: 15000 });
    console.log('✅ CHECKPOINT 1: Teacher login successful, e2e-flow page loaded');
    await teacherPage.screenshot({ path: 'tests/screenshots/01-teacher-dashboard.png' });

    // CHECKPOINT 2a: Create Course
    console.log('── CHECKPOINT 2a: Create Course ──');
    await teacherPage.locator('#course-title-input').fill(courseTitle);

    // Click create and wait for the API response
    const [createResponse] = await Promise.all([
        teacherPage.waitForResponse(response =>
            response.url().includes('/api/e2e-rpc') && response.request().method() === 'POST',
            { timeout: 15000 }
        ),
        teacherPage.click('#create-course-btn'),
    ]);
    const createBody = await createResponse.json();
    console.log('Create course response:', createResponse.status(), JSON.stringify(createBody).substring(0, 200));

    // Check for error message on page
    const errorEl = teacherPage.locator('.bg-red-100');
    if (await errorEl.isVisible({ timeout: 1000 }).catch(() => false)) {
        const errorText = await errorEl.textContent();
        console.error('Page error after create:', errorText);
    }

    await teacherPage.waitForTimeout(2000);
    await teacherPage.screenshot({ path: 'tests/screenshots/02a-after-create-course.png' });

    // Select the course from dropdown — wait for options to populate
    const courseSelect = teacherPage.locator('#course-select');
    await teacherPage.waitForTimeout(2000);
    const options = await courseSelect.locator('option').allTextContents();
    console.log('Course options:', options);
    const matchingOption = options.find(o => o.includes(uniqueId));
    if (!matchingOption) {
        // Take screenshot for debugging
        await teacherPage.screenshot({ path: 'tests/screenshots/02a-debug-no-course.png' });
        // Try refreshing the page and re-checking
        console.log('No matching course option found, trying page refresh...');
        await teacherPage.reload({ waitUntil: 'networkidle' });
        await teacherPage.waitForTimeout(3000);
        const refreshedOptions = await courseSelect.locator('option').allTextContents();
        console.log('After refresh, course options:', refreshedOptions);
        const refreshedMatch = refreshedOptions.find(o => o.includes(uniqueId));
        expect(refreshedMatch).toBeTruthy();
        await courseSelect.selectOption({ label: refreshedMatch! });
    } else {
        await courseSelect.selectOption({ label: matchingOption });
    }
    await teacherPage.waitForTimeout(2000);

    console.log('✅ CHECKPOINT 2a: Course created and selected');
    await teacherPage.screenshot({ path: 'tests/screenshots/02-course-created.png' });

    // CHECKPOINT 2b: Enroll Student
    console.log('── CHECKPOINT 2b: Enroll Student ──');
    await teacherPage.locator('#enroll-email-input').fill(STUDENT_EMAIL);
    await teacherPage.click('#enroll-student-btn');
    await teacherPage.waitForTimeout(3000);

    const enrollSuccess = teacherPage.locator('.bg-green-100').or(teacherPage.locator(`text=${STUDENT_EMAIL}`));
    await expect(enrollSuccess).toBeVisible({ timeout: 10000 });

    console.log('✅ CHECKPOINT 2b: Student enrolled');
    await teacherPage.screenshot({ path: 'tests/screenshots/03-student-enrolled.png' });

    // CHECKPOINT 2c: Create Session
    console.log('── CHECKPOINT 2c: Create Session ──');
    await teacherPage.locator('#session-title-input').fill(sessionTitle);
    await teacherPage.click('#create-session-btn');
    await teacherPage.waitForTimeout(5000);

    // Verify session appears
    await expect(teacherPage.locator(`text=${sessionTitle}`).first()).toBeVisible({ timeout: 15000 });

    // Get the meet link
    const meetLinkEl = teacherPage.locator('[data-testid="meet-link-text"]').first();
    await expect(meetLinkEl).toBeVisible({ timeout: 10000 });
    const meetLinkRaw = await meetLinkEl.textContent();
    const teacherMeetLink = meetLinkRaw!.replace('Meet: ', '').trim();

    expect(teacherMeetLink).toBeTruthy();
    expect(teacherMeetLink).toContain('meet.google.com');

    // Verify Join Meet button
    const joinBtn = teacherPage.locator('[data-testid="join-meet-btn"]').first();
    await expect(joinBtn).toBeVisible();
    expect(await joinBtn.getAttribute('href')).toBe(teacherMeetLink);

    // Verify Copy Link button
    await expect(teacherPage.locator('[data-testid="copy-link-btn"]').first()).toBeVisible();

    console.log(`✅ CHECKPOINT 2c: Session created with Meet link: ${teacherMeetLink}`);
    await teacherPage.screenshot({ path: 'tests/screenshots/04-session-created.png' });

    // ======================================
    // STUDENT FLOW
    // ======================================
    const studentContext = await browser.newContext();

    // CHECKPOINT 3a: Student Login
    console.log('── CHECKPOINT 3a: Student Login ──');
    await loginProgrammatically(studentContext, STUDENT_EMAIL, STUDENT_PASSWORD);

    const studentPage = await studentContext.newPage();
    await studentPage.goto(`${BASE_URL}/en/e2e-flow`, { waitUntil: 'networkidle' });
    await studentPage.waitForTimeout(3000);

    await expect(studentPage.locator('h1')).toContainText('E2E Flow Test Dashboard', { timeout: 15000 });
    console.log('✅ CHECKPOINT 3a: Student login successful');
    await studentPage.screenshot({ path: 'tests/screenshots/05-student-dashboard.png' });

    // CHECKPOINT 3b: Student sees enrolled course and session
    console.log('── CHECKPOINT 3b: Student sees course and session ──');

    // Student might need to click on the enrolled course first
    const courseBtn = studentPage.locator(`text=${courseTitle}`).first();
    if (await courseBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await courseBtn.click();
        await studentPage.waitForTimeout(2000);
    }

    // Student sees the session
    await expect(studentPage.locator(`text=${sessionTitle}`).first()).toBeVisible({ timeout: 15000 });

    // Verify SAME meet link
    const studentMeetEl = studentPage.locator('[data-testid="meet-link-text"]').first();
    await expect(studentMeetEl).toBeVisible({ timeout: 10000 });
    const studentMeetRaw = await studentMeetEl.textContent();
    const studentMeetLink = studentMeetRaw!.replace('Meet: ', '').trim();

    expect(studentMeetLink).toBe(teacherMeetLink);

    // Verify Join button
    const studentJoinBtn = studentPage.locator('[data-testid="join-meet-btn"]').first();
    await expect(studentJoinBtn).toBeVisible();
    expect(await studentJoinBtn.getAttribute('href')).toBe(teacherMeetLink);

    console.log(`✅ CHECKPOINT 3b: Student sees SAME Meet link: ${studentMeetLink}`);
    await studentPage.screenshot({ path: 'tests/screenshots/06-student-session.png' });

    // CHECKPOINT 4: RBAC
    console.log('── CHECKPOINT 4: RBAC ──');
    await expect(studentPage.locator('#create-course-btn')).not.toBeVisible();
    await expect(studentPage.locator('#create-session-btn')).not.toBeVisible();

    const rbacResponse = await studentPage.evaluate(async (base: string) => {
        const res = await fetch(`${base}/api/e2e-rpc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'createCourse', payload: { title: 'Hacked' } }),
        });
        return { status: res.status, body: await res.json() };
    }, BASE_URL);
    expect(rbacResponse.status).toBe(403);

    console.log('✅ CHECKPOINT 4: RBAC verified');
    await studentPage.screenshot({ path: 'tests/screenshots/07-rbac.png' });

    // Cleanup
    await teacherContext.close();
    await studentContext.close();

    console.log('');
    console.log('==========================================');
    console.log('✅ ALL CHECKPOINTS PASSED');
    console.log(`   Teacher Meet Link: ${teacherMeetLink}`);
    console.log(`   Student Meet Link: ${studentMeetLink}`);
    console.log(`   Links identical: ${teacherMeetLink === studentMeetLink}`);
    console.log('==========================================');
});
