import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test('End-to-End Flow: Teacher sets up class and session, Student joins', async ({ browser }) => {
    test.setTimeout(90000);

    const uniqueId = `E2E ${Date.now()}`;

    // 1. TEACHER FLOW
    const teacherContext = await browser.newContext();
    const teacherPage = await teacherContext.newPage();

    console.log('Teacher: Logging in...');
    await teacherPage.goto(`${BASE_URL}/en/login/teacher`);
    await teacherPage.fill('input[type="email"]', 'teacher@eduverse.com');
    await teacherPage.fill('input[type="password"]', 'password123');
    await teacherPage.click('button[type="submit"]');
    await teacherPage.waitForURL('**/teacher**');

    // Create Class
    console.log('Teacher: Creating class...');
    await teacherPage.goto(`${BASE_URL}/en/teacher/grades`);
    await teacherPage.waitForLoadState('networkidle');
    await teacherPage.screenshot({ path: 'tests/error-state-grades.png' });

    await teacherPage.click('button:has-text("New Class")');
    await teacherPage.fill('input[id="className"]', `Class ${uniqueId}`);
    await teacherPage.click('button[type="submit"]:has-text("Create")');
    await teacherPage.waitForTimeout(2000); // wait for modal close and list refresh

    console.log('Teacher: Going to class details to enroll student...');
    // Click on the newly created class
    await teacherPage.click(`text=Class ${uniqueId}`);
    await teacherPage.waitForLoadState('networkidle');

    // Enroll Student in the class
    // We will enroll student after creating the course!
    console.log('Teacher: Creating course...');
    await teacherPage.goto(`${BASE_URL}/en/teacher/courses/new`);
    await teacherPage.fill('input[id="title"]', `Course ${uniqueId}`);
    await teacherPage.fill('textarea[id="description"]', `Description for Course ${uniqueId}`);
    await teacherPage.fill('input[id="durationHours"]', '10');
    // Select the newly created class in the Grade dropdown
    await teacherPage.selectOption('select[id="gradeId"]', { label: `Class ${uniqueId}` });

    // We also need a subject. Let's create one via api bypass first or just select the first available if any.
    // For now, let's just create a subject via fetch.
    await teacherPage.evaluate(async (uid) => {
        await fetch('/api/e2e-rpc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'setupSubject', params: { title: `Subject ${uid}` } })
        });
    }, uniqueId);

    // After creating a subject, reload to get it in the dropdown
    await teacherPage.reload();
    await teacherPage.fill('input[id="title"]', `Course ${uniqueId}`);
    await teacherPage.fill('textarea[id="description"]', `Description for Course ${uniqueId}`);
    await teacherPage.fill('input[id="durationHours"]', '10');
    await teacherPage.selectOption('select[id="gradeId"]', { label: `Class ${uniqueId}` });

    // Select the newly created Subject
    await teacherPage.selectOption('select[id="subjectId"]', { label: `Subject ${uniqueId}` });
    await teacherPage.click('button[type="submit"]:has-text("Create Course")');

    // It should redirect to the course details page
    await teacherPage.waitForURL('**/teacher/courses/*');
    const courseUrl = teacherPage.url();

    // Enroll Student in the class (now that we have a course)
    console.log('Teacher: Enrolling student...');
    await teacherPage.goto(`${BASE_URL}/en/teacher/grades`);
    await teacherPage.click(`text=Class ${uniqueId}`);
    await teacherPage.waitForLoadState('networkidle');
    await teacherPage.click('button:has-text("Students")'); // Go to students tab
    await teacherPage.click('button:has-text("Enroll Student")');
    await teacherPage.fill('input[type="email"]', 'student@eduverse.com');
    // We don't need to select a student user from dropdown anymore, we just type the email. And select the course.
    await teacherPage.selectOption('select[id="courseId"]', { label: `Course ${uniqueId}` });
    await teacherPage.click('button[type="submit"]:has-text("Enroll")');
    await teacherPage.waitForTimeout(2000); // wait for modal close

    // Go back to course
    await teacherPage.goto(courseUrl);

    // Create Session
    console.log('Teacher: Creating session...');
    await teacherPage.click('button[role="tab"]:has-text("Live Sessions")');
    await teacherPage.click('button:has-text("Create Session")');
    await teacherPage.fill('input[id="title"]', `Session ${uniqueId}`);

    // Set dates to future
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 16);
    await teacherPage.fill('input[id="startDateTime"]', dateStr);

    const nextHour = new Date(tomorrow);
    nextHour.setHours(nextHour.getHours() + 1);
    const endDateStr = nextHour.toISOString().slice(0, 16);
    await teacherPage.fill('input[id="endDateTime"]', endDateStr);

    await teacherPage.click('button[type="submit"]:has-text("Create Session")');
    await teacherPage.waitForTimeout(2000);

    console.log('Teacher: Verifying session meet link...');
    // Click on the newly created session
    await teacherPage.click(`text=Session ${uniqueId}`);
    await teacherPage.waitForURL('**/lessons/*');

    // Verify "Copy Link" exists which indicates Meet link was generated
    const copyLinkButton = teacherPage.locator('button:has-text("Copy Link")');
    await expect(copyLinkButton).toBeVisible();

    await teacherPage.screenshot({ path: 'tests/teacher-flow-success.png' });
    await teacherContext.close();

    // 2. STUDENT FLOW
    console.log('Student: Logging in...');
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();

    await studentPage.goto(`${BASE_URL}/en/login/student`);
    await studentPage.fill('input[type="email"]', 'student@eduverse.com');
    await studentPage.fill('input[type="password"]', 'password123');
    await studentPage.click('button[type="submit"]');
    await studentPage.waitForURL('**/student**');

    console.log('Student: Viewing courses...');
    await studentPage.goto(`${BASE_URL}/en/student/courses`);
    await studentPage.click(`text=Course ${uniqueId}`);
    await studentPage.waitForURL('**/student/courses/*');

    console.log('Student: Viewing sessions...');
    await studentPage.click(`text=Session ${uniqueId}`);
    await studentPage.waitForURL('**/lessons/*');

    // Student should also see the 'Join' action 
    const studentJoinBtn = studentPage.locator('button:has-text("Join Session")');
    await expect(studentJoinBtn).toBeVisible();

    await studentPage.screenshot({ path: 'tests/student-flow-success.png' });
    await studentContext.close();

    console.log('✅ Success! E2E Flow verified for Teacher and Student');
});
