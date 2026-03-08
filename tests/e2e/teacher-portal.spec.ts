import { test, expect } from '@playwright/test';

test.describe('Teacher Portal - Subjects and Courses Flow', () => {
    test.beforeEach(async ({ page }) => {
        // We assume the application is running and we can log in.
        // In a real environment, we'd use a robust auth setup or bypass.
        // For this demonstration test, let's navigate to the teacher portal.
        await page.goto('/en/login');

        // Fill in standard teacher credentials
        await page.fill('input[type="email"]', 'teacher@example.com');
        await page.fill('input[type="password"]', 'password123'); // Adjust to your actual seed test user if any
        await page.click('button:has-text("تسجيل الدخول"), button:has-text("Login")');

        // Wait for the dashboard to load to confirm authentication
        await page.waitForURL('**/teacher**');
    });

    test('should create a subject and then a course attached to it', async ({ page }) => {
        const timestamp = Date.now();
        const subjectName = `Test Subject ${timestamp}`;
        const courseName = `Test Course ${timestamp}`;

        // 1. Create a Subject
        await page.goto('/en/teacher/subjects/create');

        // Fill out the subject form
        await page.fill('input[name="title"]', subjectName);
        await page.fill('textarea[name="description"]', 'E2E test subject description');

        // Ensure the old Course dropdown is NOT there (we removed it!)
        const courseSelectCount = await page.locator('select[name="courseId"]').count();
        expect(courseSelectCount).toBe(0);

        await page.click('button[type="submit"]');

        // Should redirect back to subjects list
        await page.waitForURL('**/teacher/subjects');
        await expect(page.locator(`text=${subjectName}`)).toBeVisible();

        // 2. Create a Course
        await page.goto('/en/teacher/courses/create');

        // Fill out the course form
        await page.fill('input[name="title"]', courseName);
        await page.fill('textarea[name="description"]', 'E2E test course description');
        await page.fill('input[name="price"]', '50');

        // Select a Grade (Assuming one exists; if not the test will fail gracefully finding no active option)
        await page.selectOption('select[name="gradeId"]', { index: 1 }); // Pick first available grade

        // Select the Subject we just created
        await page.selectOption('select[name="subjectId"]', { label: subjectName });

        await page.click('button[type="submit"]');

        // Should redirect back to course details
        await page.waitForURL('**/teacher/courses/*');
        await expect(page.locator(`text=${courseName}`)).toBeVisible();
    });
});
