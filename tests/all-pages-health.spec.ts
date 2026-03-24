import { test, expect } from '@playwright/test';

/**
 * Full system health check — all pages across all portals.
 * Tests for: 500 errors, missing modules, intl errors, client exceptions.
 * Auth-protected pages redirecting to login = OK (not an error).
 */

test.setTimeout(30000);

const ALL_PAGES = [
  // Public
  { path: '/ar', name: 'Homepage AR' },
  { path: '/en', name: 'Homepage EN' },
  { path: '/ar/about-us', name: 'About Us' },
  { path: '/ar/join', name: 'Join' },

  // Dashboard (Admin portal — the main admin UI)
  { path: '/ar/dashboard', name: 'Dashboard Home' },
  { path: '/ar/dashboard/courses', name: 'Dashboard Courses' },
  { path: '/ar/dashboard/categories', name: 'Dashboard Categories' },
  { path: '/ar/dashboard/bundles', name: 'Dashboard Bundles' },
  { path: '/ar/dashboard/exams', name: 'Dashboard Exams' },
  { path: '/ar/dashboard/quizzes', name: 'Dashboard Quizzes' },
  { path: '/ar/dashboard/users', name: 'Dashboard Users' },
  { path: '/ar/dashboard/applications', name: 'Dashboard Applications' },
  { path: '/ar/dashboard/payments', name: 'Dashboard Payments' },
  { path: '/ar/dashboard/messages', name: 'Dashboard Messages' },
  { path: '/ar/dashboard/announcements', name: 'Dashboard Announcements' },
  { path: '/ar/dashboard/cms', name: 'Dashboard CMS' },
  { path: '/ar/dashboard/live', name: 'Dashboard Live' },
  { path: '/ar/dashboard/calendar', name: 'Dashboard Calendar' },
  { path: '/ar/dashboard/fees', name: 'Dashboard Fees' },
  { path: '/ar/dashboard/students', name: 'Dashboard Students' },
  { path: '/ar/dashboard/teachers', name: 'Dashboard Teachers' },
  { path: '/ar/dashboard/admin/reports', name: 'Dashboard Reports' },
  { path: '/ar/dashboard/profile', name: 'Dashboard Profile' },
  { path: '/ar/dashboard/settings', name: 'Dashboard Settings' },
  { path: '/ar/dashboard/system-settings', name: 'Dashboard System Settings' },

  // Legacy Admin portal
  { path: '/ar/admin/home', name: 'Admin Home' },
  { path: '/ar/admin/courses', name: 'Admin Courses' },
  { path: '/ar/admin/grades', name: 'Admin Grades' },
  { path: '/ar/admin/lessons', name: 'Admin Lessons' },
  { path: '/ar/admin/teachers', name: 'Admin Teachers' },
  { path: '/ar/admin/students', name: 'Admin Students' },
  { path: '/ar/admin/calendar', name: 'Admin Calendar' },
  { path: '/ar/admin/fees', name: 'Admin Fees' },
  { path: '/ar/admin/settings', name: 'Admin Settings' },
  { path: '/ar/admin/content', name: 'Admin Content' },
  { path: '/ar/admin/live', name: 'Admin Live' },
  { path: '/ar/admin/attendance', name: 'Admin Attendance' },

  // Teacher portal
  { path: '/ar/teacher/home', name: 'Teacher Home' },
  { path: '/ar/teacher/courses', name: 'Teacher Courses' },
  { path: '/ar/teacher/grades', name: 'Teacher Grades' },
  { path: '/ar/teacher/assessments', name: 'Teacher Assessments' },
  { path: '/ar/teacher/calendar', name: 'Teacher Calendar' },
  { path: '/ar/teacher/profile', name: 'Teacher Profile' },

  // Student portal
  { path: '/ar/student/home', name: 'Student Home' },
  { path: '/ar/student/courses', name: 'Student Courses' },
  { path: '/ar/student/assessments', name: 'Student Assessments' },
  { path: '/ar/student/calendar', name: 'Student Calendar' },
  { path: '/ar/student/profile', name: 'Student Profile' },
];

for (const p of ALL_PAGES) {
  test(`${p.name} (${p.path})`, async ({ page }) => {
    let response;
    try {
      response = await page.goto(p.path, { waitUntil: 'domcontentloaded', timeout: 20000 });
    } catch (err: any) {
      if (err.message?.includes('ECONNREFUSED')) {
        throw new Error(`Server not running. Start with: npm run dev`);
      }
      throw err;
    }

    const status = response?.status() || 0;

    // 500 = server crash
    expect(status, `${p.name}: HTTP 500`).not.toBe(500);

    // Wait for client render
    await page.waitForTimeout(1500);

    const html = await page.content();

    // Fatal error patterns
    const fatal = [
      'Cannot find module',
      'No intl context found',
      'Application error: a client-side exception',
    ];

    for (const pattern of fatal) {
      expect(html, `${p.name}: "${pattern}" found in page`).not.toContain(pattern);
    }
  });
}
