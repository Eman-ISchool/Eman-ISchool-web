import fs from 'fs';
import path from 'path';
import { test, expect, BrowserContext } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEACHER_EMAIL = 'teacher@eduverse.com';
const TEACHER_PASSWORD = 'password123';
const STUDENT_EMAIL = 'student@eduverse.com';
const STUDENT_PASSWORD = 'password123';
const TEACHER_ID = '00000000-0000-0000-0000-000000000001';
const STUDENT_ID = '00000000-0000-0000-0000-000000000002';

const MOCK_DB_PATH = path.join(process.cwd(), '.mock-db.json');

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
    params.append('callbackUrl', `${base}/en/teacher/home`);
    params.append('json', 'true');

    await fetch(`${base}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      redirect: 'follow',
    });

    const sessionRes = await fetch(`${base}/api/auth/session`);
    return sessionRes.json();
  }, { base: BASE_URL, email, password });

  await page.close();
  if (!loginResult?.user?.email) {
    throw new Error(`Login failed for ${email}`);
  }
}

function seedMockFlow(uniqueId: string) {
  const meetLink = 'https://meet.google.com/abc-defg-hij';
  const now = Date.now();
  const start = new Date(now + 30 * 60 * 1000).toISOString();
  const end = new Date(now + 75 * 60 * 1000).toISOString();

  const gradeId = `grade-e2e-${uniqueId}`;
  const gradeSlug = `grade-e2e-${uniqueId}`;
  const courseId = `course-e2e-${uniqueId}`;
  const lessonId = `lesson-e2e-${uniqueId}`;
  const enrollmentId = `enroll-e2e-${uniqueId}`;

  const db = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf-8'));
  if (!Array.isArray(db.grades)) db.grades = [];
  if (!Array.isArray(db.courses)) db.courses = [];
  if (!Array.isArray(db.lessons)) db.lessons = [];
  if (!Array.isArray(db.enrollments)) db.enrollments = [];
  if (!Array.isArray(db.lesson_meetings)) db.lesson_meetings = [];
  if (!Array.isArray(db.users)) db.users = [];

  const ensureUser = (id: string, email: string, role: string, name: string) => {
    if (!db.users.some((user: any) => user.id === id)) {
      db.users.push({ id, email, role, name });
    }
  };
  ensureUser(TEACHER_ID, TEACHER_EMAIL, 'teacher', 'Test Teacher');
  ensureUser(STUDENT_ID, STUDENT_EMAIL, 'student', 'Test Student');

  db.grades = db.grades.filter((grade: any) => grade.id !== gradeId);
  db.courses = db.courses.filter((course: any) => course.id !== courseId);
  db.lessons = db.lessons.filter((lesson: any) => lesson.id !== lessonId);
  db.enrollments = db.enrollments.filter((enrollment: any) => enrollment.id !== enrollmentId);
  db.lesson_meetings = db.lesson_meetings.filter((meeting: any) => meeting.lesson_id !== lessonId);

  db.grades.push({
    id: gradeId,
    name: `Grade E2E ${uniqueId}`,
    slug: gradeSlug,
    supervisor_id: TEACHER_ID,
    is_active: true,
    created_at: new Date(now).toISOString(),
    updated_at: new Date(now).toISOString(),
  });

  db.courses.push({
    id: courseId,
    title: `Course E2E ${uniqueId}`,
    description: 'Teacher/student flow course',
    grade_id: gradeId,
    subject_id: `subject-e2e-${uniqueId}`,
    teacher_id: TEACHER_ID,
    teacher: { name: 'Test Teacher', email: TEACHER_EMAIL },
    is_published: true,
    created_at: new Date(now).toISOString(),
  });

  db.enrollments.push({
    id: enrollmentId,
    course_id: courseId,
    student_id: STUDENT_ID,
    student_email: STUDENT_EMAIL,
    student_name: 'Test Student',
    status: 'active',
    enrollment_date: new Date(now).toISOString(),
    enrolled_at: new Date(now).toISOString(),
  });

  db.lessons.push({
    id: lessonId,
    title: `Lesson E2E ${uniqueId}`,
    description: 'Live session',
    start_date_time: start,
    end_date_time: end,
    status: 'scheduled',
    course_id: courseId,
    teacher_id: TEACHER_ID,
    meet_link: meetLink,
    meetLink,
    created_at: new Date(now).toISOString(),
  });

  db.lesson_meetings.push({
    lesson_id: lessonId,
    provider: 'google_calendar',
    meet_url: meetLink,
    event_id: null,
    created_by_teacher_id: TEACHER_ID,
    status: 'active',
  });

  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(db, null, 2));

  return { gradeId, gradeSlug, courseId, lessonId, meetLink, courseTitle: `Course E2E ${uniqueId}`, lessonTitle: `Lesson E2E ${uniqueId}` };
}

test('Teacher and student read/join the same persisted meet link', async ({ browser }) => {
  test.setTimeout(240_000);
  const uniqueId = `${Date.now()}`;
  const seeded = seedMockFlow(uniqueId);

  const teacherContext = await browser.newContext();
  await loginProgrammatically(teacherContext, TEACHER_EMAIL, TEACHER_PASSWORD);
  const teacherPage = await teacherContext.newPage();

  await teacherPage.goto(`${BASE_URL}/en/teacher/grades/${seeded.gradeSlug}`, { waitUntil: 'networkidle' });
  await teacherPage.getByRole('button', { name: 'Students' }).click();
  await expect(teacherPage.getByRole('button', { name: /Export CSV/i })).toBeVisible({ timeout: 60000 });
  await expect(teacherPage.getByText(STUDENT_EMAIL)).toBeVisible({ timeout: 60000 });
  await teacherPage.screenshot({ path: 'tests/screenshots/teacher-grade-details-students-tab.png', fullPage: true });

  const teacherLesson = await teacherPage.evaluate(async (lessonId) => {
    const response = await fetch(`/api/lessons/${lessonId}`);
    const body = await response.json();
    return { status: response.status, meetLink: body?.lesson?.meet_link || null };
  }, seeded.lessonId);
  expect(teacherLesson.status).toBe(200);
  expect(teacherLesson.meetLink).toBe(seeded.meetLink);

  const studentContext = await browser.newContext();
  await loginProgrammatically(studentContext, STUDENT_EMAIL, STUDENT_PASSWORD);
  const studentPage = await studentContext.newPage();

  await studentPage.goto(`${BASE_URL}/en/student/courses`, { waitUntil: 'networkidle' });
  await expect(studentPage.getByText(seeded.courseTitle)).toBeVisible({ timeout: 60000 });
  await studentPage.screenshot({ path: 'tests/screenshots/student-courses-list.png', fullPage: true });

  await studentPage.goto(`${BASE_URL}/en/student/courses/${seeded.courseId}`, { waitUntil: 'networkidle' });
  await expect(studentPage.getByText(seeded.lessonTitle)).toBeVisible({ timeout: 60000 });

  await studentPage.goto(`${BASE_URL}/en/student/courses/${seeded.courseId}/lessons/${seeded.lessonId}`, { waitUntil: 'networkidle' });
  const studentLesson = await studentPage.evaluate(async (lessonId) => {
    const response = await fetch(`/api/lessons/${lessonId}`);
    const body = await response.json();
    return { status: response.status, meetLink: body?.lesson?.meet_link || null };
  }, seeded.lessonId);
  expect(studentLesson.status).toBe(200);
  expect(studentLesson.meetLink).toBe(seeded.meetLink);

  const studentJoin = await studentPage.evaluate(async (lessonId) => {
    const response = await fetch(`/api/lessons/${lessonId}/join`, { method: 'POST' });
    const body = await response.json();
    return { status: response.status, body };
  }, seeded.lessonId);

  expect(studentJoin.status).toBe(200);
  expect(studentJoin.body.meet_link).toBe(seeded.meetLink);
  await studentPage.screenshot({ path: 'tests/screenshots/student-lesson-join.png', fullPage: true });

  await teacherContext.close();
  await studentContext.close();
});
