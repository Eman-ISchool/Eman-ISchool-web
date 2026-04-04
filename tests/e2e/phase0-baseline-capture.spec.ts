import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'docs/evidence/screenshots/before');

// Ensure directory exists
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

/**
 * Phase 0 — Baseline Screenshot Capture
 * Visits all major routes and captures screenshots for BEFORE evidence.
 */

// Public pages
const publicRoutes = [
  { name: 'landing', path: '/ar' },
  { name: 'about', path: '/ar/about' },
  { name: 'about-us', path: '/ar/about-us' },
  { name: 'services', path: '/ar/services' },
  { name: 'contact', path: '/ar/contact' },
  { name: 'blogs', path: '/ar/blogs' },
  { name: 'policy', path: '/ar/policy' },
  { name: 'join', path: '/ar/join' },
  { name: 'enrollment', path: '/ar/enrollment' },
  { name: 'download', path: '/ar/download' },
  { name: 'search', path: '/ar/search' },
  { name: 'cart', path: '/ar/cart' },
];

// Auth pages
const authRoutes = [
  { name: 'login', path: '/ar/login' },
  { name: 'login-admin', path: '/ar/login/admin' },
  { name: 'login-student', path: '/ar/login/student' },
  { name: 'login-teacher', path: '/ar/login/teacher' },
  { name: 'register', path: '/ar/register' },
  { name: 'forgot-password', path: '/ar/forgot-password' },
];

// Teacher portal (will need auth bypass or mock)
const teacherRoutes = [
  { name: 'teacher-home', path: '/ar/teacher' },
  { name: 'teacher-dashboard', path: '/ar/teacher/home' },
  { name: 'teacher-courses', path: '/ar/teacher/courses' },
  { name: 'teacher-subjects', path: '/ar/teacher/subjects' },
  { name: 'teacher-grades', path: '/ar/teacher/grades' },
  { name: 'teacher-assessments', path: '/ar/teacher/assessments' },
  { name: 'teacher-calendar', path: '/ar/teacher/calendar' },
  { name: 'teacher-materials', path: '/ar/teacher/materials' },
  { name: 'teacher-reels', path: '/ar/teacher/reels' },
  { name: 'teacher-profile', path: '/ar/teacher/profile' },
  { name: 'teacher-chat', path: '/ar/teacher/chat' },
];

// Student portal
const studentRoutes = [
  { name: 'student-home', path: '/ar/student' },
  { name: 'student-dashboard', path: '/ar/student/home' },
  { name: 'student-courses', path: '/ar/student/courses' },
  { name: 'student-assessments', path: '/ar/student/assessments' },
  { name: 'student-attendance', path: '/ar/student/attendance' },
  { name: 'student-calendar', path: '/ar/student/calendar' },
  { name: 'student-reels', path: '/ar/student/reels' },
  { name: 'student-profile', path: '/ar/student/profile' },
  { name: 'student-support', path: '/ar/student/support' },
];

// Admin portal
const adminRoutes = [
  { name: 'admin-home', path: '/ar/admin' },
  { name: 'admin-dashboard', path: '/ar/admin/home' },
  { name: 'admin-students', path: '/ar/admin/students' },
  { name: 'admin-teachers', path: '/ar/admin/teachers' },
  { name: 'admin-grades', path: '/ar/admin/grades' },
  { name: 'admin-lessons', path: '/ar/admin/lessons' },
  { name: 'admin-attendance', path: '/ar/admin/attendance' },
  { name: 'admin-meetings', path: '/ar/admin/meetings' },
  { name: 'admin-fees', path: '/ar/admin/fees' },
  { name: 'admin-quizzes-exams', path: '/ar/admin/quizzes-exams' },
  { name: 'admin-reels', path: '/ar/admin/reels' },
  { name: 'admin-content', path: '/ar/admin/content' },
  { name: 'admin-settings', path: '/ar/admin/settings' },
  { name: 'admin-support', path: '/ar/admin/support' },
  { name: 'admin-enrollment-applications', path: '/ar/admin/enrollment-applications' },
  { name: 'admin-calendar', path: '/ar/admin/calendar' },
];

// Parent portal
const parentRoutes = [
  { name: 'parent-home', path: '/ar/parent/home' },
  { name: 'parent-courses', path: '/ar/parent/courses' },
  { name: 'parent-invoices', path: '/ar/parent/invoices' },
  { name: 'parent-support', path: '/ar/parent/support' },
  { name: 'parent-applications', path: '/ar/parent/applications' },
];

async function captureScreenshot(
  page: import('@playwright/test').Page,
  routeName: string,
  routePath: string,
  category: string
) {
  try {
    const response = await page.goto(routePath, {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    // Wait for any animations/loading
    await page.waitForTimeout(1000);

    const statusCode = response?.status() ?? 0;
    const fileName = `${category}--${routeName}--${statusCode}.png`;

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, fileName),
      fullPage: true,
    });

    return { name: routeName, path: routePath, status: statusCode, file: fileName, error: null };
  } catch (error) {
    const fileName = `${category}--${routeName}--error.png`;
    try {
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, fileName),
        fullPage: true,
      });
    } catch {}
    return {
      name: routeName,
      path: routePath,
      status: 0,
      file: fileName,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

test.describe('Phase 0 — Baseline Screenshot Capture', () => {

  test('capture public pages', async ({ page }) => {
    const results = [];
    for (const route of publicRoutes) {
      results.push(await captureScreenshot(page, route.name, route.path, 'public'));
    }
    // Write results summary
    const summary = results.map(r =>
      `${r.status === 200 ? '✅' : '⚠️'} ${r.name} (${r.path}) → ${r.status}${r.error ? ` ERROR: ${r.error}` : ''}`
    ).join('\n');
    fs.writeFileSync(path.join(SCREENSHOT_DIR, 'public-capture-log.txt'), summary);
    console.log('PUBLIC ROUTES:\n' + summary);
  });

  test('capture auth pages', async ({ page }) => {
    const results = [];
    for (const route of authRoutes) {
      results.push(await captureScreenshot(page, route.name, route.path, 'auth'));
    }
    const summary = results.map(r =>
      `${r.status === 200 ? '✅' : '⚠️'} ${r.name} (${r.path}) → ${r.status}${r.error ? ` ERROR: ${r.error}` : ''}`
    ).join('\n');
    fs.writeFileSync(path.join(SCREENSHOT_DIR, 'auth-capture-log.txt'), summary);
    console.log('AUTH ROUTES:\n' + summary);
  });

  test('capture teacher portal pages', async ({ page }) => {
    const results = [];
    for (const route of teacherRoutes) {
      results.push(await captureScreenshot(page, route.name, route.path, 'teacher'));
    }
    const summary = results.map(r =>
      `${r.status === 200 ? '✅' : '⚠️'} ${r.name} (${r.path}) → ${r.status}${r.error ? ` ERROR: ${r.error}` : ''}`
    ).join('\n');
    fs.writeFileSync(path.join(SCREENSHOT_DIR, 'teacher-capture-log.txt'), summary);
    console.log('TEACHER ROUTES:\n' + summary);
  });

  test('capture student portal pages', async ({ page }) => {
    const results = [];
    for (const route of studentRoutes) {
      results.push(await captureScreenshot(page, route.name, route.path, 'student'));
    }
    const summary = results.map(r =>
      `${r.status === 200 ? '✅' : '⚠️'} ${r.name} (${r.path}) → ${r.status}${r.error ? ` ERROR: ${r.error}` : ''}`
    ).join('\n');
    fs.writeFileSync(path.join(SCREENSHOT_DIR, 'student-capture-log.txt'), summary);
    console.log('STUDENT ROUTES:\n' + summary);
  });

  test('capture admin portal pages', async ({ page }) => {
    const results = [];
    for (const route of adminRoutes) {
      results.push(await captureScreenshot(page, route.name, route.path, 'admin'));
    }
    const summary = results.map(r =>
      `${r.status === 200 ? '✅' : '⚠️'} ${r.name} (${r.path}) → ${r.status}${r.error ? ` ERROR: ${r.error}` : ''}`
    ).join('\n');
    fs.writeFileSync(path.join(SCREENSHOT_DIR, 'admin-capture-log.txt'), summary);
    console.log('ADMIN ROUTES:\n' + summary);
  });

  test('capture parent portal pages', async ({ page }) => {
    const results = [];
    for (const route of parentRoutes) {
      results.push(await captureScreenshot(page, route.name, route.path, 'parent'));
    }
    const summary = results.map(r =>
      `${r.status === 200 ? '✅' : '⚠️'} ${r.name} (${r.path}) → ${r.status}${r.error ? ` ERROR: ${r.error}` : ''}`
    ).join('\n');
    fs.writeFileSync(path.join(SCREENSHOT_DIR, 'parent-capture-log.txt'), summary);
    console.log('PARENT ROUTES:\n' + summary);
  });

  // Responsive captures for key pages at 3 breakpoints
  test('capture responsive breakpoints (desktop 1440px)', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const keyPages = [
      { name: 'landing', path: '/ar' },
      { name: 'login', path: '/ar/login' },
      { name: 'teacher-home', path: '/ar/teacher' },
      { name: 'admin-home', path: '/ar/admin' },
    ];
    for (const route of keyPages) {
      await captureScreenshot(page, `${route.name}-1440`, route.path, 'responsive');
    }
    await context.close();
  });

  test('capture responsive breakpoints (tablet 768px)', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const page = await context.newPage();
    const keyPages = [
      { name: 'landing', path: '/ar' },
      { name: 'login', path: '/ar/login' },
      { name: 'teacher-home', path: '/ar/teacher' },
      { name: 'admin-home', path: '/ar/admin' },
    ];
    for (const route of keyPages) {
      await captureScreenshot(page, `${route.name}-768`, route.path, 'responsive');
    }
    await context.close();
  });

  test('capture responsive breakpoints (mobile 390px)', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const keyPages = [
      { name: 'landing', path: '/ar' },
      { name: 'login', path: '/ar/login' },
      { name: 'teacher-home', path: '/ar/teacher' },
      { name: 'admin-home', path: '/ar/admin' },
    ];
    for (const route of keyPages) {
      await captureScreenshot(page, `${route.name}-390`, route.path, 'responsive');
    }
    await context.close();
  });
});
