#!/usr/bin/env npx tsx
/**
 * FULL E2E MULTI-PORTAL API-LEVEL VALIDATION
 *
 * Validates all portals via real HTTP requests against the running server.
 * This bypasses browser sandbox restrictions while still testing real auth,
 * API endpoints, database, and Google Meet integration.
 *
 * Run: npx tsx tests/e2e-api-validation.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const LOCALE = 'ar'; // Default locale is Arabic — 'en' routes may 404 if not compiled yet

interface Evidence {
  phase: string;
  step: string;
  url: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'BLOCKED';
  detail: string;
}

interface Defect {
  defect: string;
  rootCause: string;
  fix: string;
  retestResult: string;
}

const evidence: Evidence[] = [];
const defects: Defect[] = [];

function record(phase: string, step: string, url: string, status: Evidence['status'], detail: string) {
  evidence.push({ phase, step, url, status, detail });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : '🚫';
  console.log(`  ${icon} [${status}] ${step}: ${detail}`);
}

// Cookie jar for session management
class SessionManager {
  private cookies: Map<string, string> = new Map();

  setCookiesFromHeaders(headers: Headers) {
    // Try getSetCookie first (Node 20+), fall back to raw header parsing
    let setCookies: string[] = [];
    if (typeof headers.getSetCookie === 'function') {
      setCookies = headers.getSetCookie();
    } else {
      // Fallback: parse the raw set-cookie header
      const raw = headers.get('set-cookie');
      if (raw) {
        // Split on comma boundaries that are followed by a cookie name=
        setCookies = raw.split(/,(?=\s*[a-zA-Z_-]+=)/);
      }
    }

    for (const cookie of setCookies) {
      const [nameValue] = cookie.split(';');
      const eqIdx = nameValue.indexOf('=');
      if (eqIdx > 0) {
        const name = nameValue.substring(0, eqIdx).trim();
        const value = nameValue.substring(eqIdx + 1).trim();
        if (name && value) {
          this.cookies.set(name, value);
        }
      }
    }
  }

  getCookieHeader(): string {
    return Array.from(this.cookies.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
  }

  clear() {
    this.cookies.clear();
  }

  hasSession(): boolean {
    return Array.from(this.cookies.keys()).some(k => k.includes('next-auth'));
  }

  debugCookies(): string {
    return Array.from(this.cookies.keys()).join(', ');
  }
}

async function fetchWithCookies(session: SessionManager, url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  const cookieHeader = session.getCookieHeader();
  if (cookieHeader) {
    headers.set('Cookie', cookieHeader);
  }

  const response = await fetch(url, { ...options, headers, redirect: 'manual' });
  session.setCookiesFromHeaders(response.headers);
  return response;
}

async function authenticate(email: string, password: string): Promise<SessionManager> {
  const session = new SessionManager();

  // Step 1: Get CSRF token (also sets initial cookies)
  const csrfResponse = await fetchWithCookies(session, `${BASE_URL}/api/auth/csrf`);
  const csrfData = await csrfResponse.json() as { csrfToken?: string };
  const csrfToken = csrfData.csrfToken;

  if (!csrfToken) {
    throw new Error('Failed to get CSRF token');
  }

  // Step 2: POST credentials — do NOT send json: 'true' so NextAuth does full redirect flow
  // which is where the session-token cookie gets set
  const authResponse = await fetchWithCookies(session, `${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      identifier: email,
      email: email,
      password: password,
      csrfToken: csrfToken,
      callbackUrl: `${BASE_URL}/`,
    }),
  });

  // Follow ALL redirects (NextAuth does multi-hop redirects, session cookie is set during this)
  let currentResponse = authResponse;
  let hops = 0;
  while (currentResponse.status >= 300 && currentResponse.status < 400 && hops < 10) {
    const redirectUrl = currentResponse.headers.get('location');
    if (!redirectUrl) break;
    const fullUrl = redirectUrl.startsWith('http') ? redirectUrl : `${BASE_URL}${redirectUrl}`;
    currentResponse = await fetchWithCookies(session, fullUrl);
    hops++;
  }

  // Debug: check if session-token was set
  const hasSessionToken = Array.from(session['cookies'].keys()).some(k => k.includes('session-token'));
  if (!hasSessionToken) {
    console.log(`  [DEBUG] Auth for ${email}: No session-token cookie after ${hops} redirects. Cookies: [${session.debugCookies()}]`);
  }

  return session;
}

async function getSession(session: SessionManager): Promise<any> {
  const response = await fetchWithCookies(session, `${BASE_URL}/api/auth/session`);
  return response.json();
}

async function apiGet(session: SessionManager, path: string): Promise<{ status: number; data: any; ok: boolean }> {
  try {
    const response = await fetchWithCookies(session, `${BASE_URL}${path}`);
    const ok = response.status >= 200 && response.status < 400;
    let data: any = null;
    try {
      const text = await response.text();
      try { data = JSON.parse(text); } catch { data = text.substring(0, 500); }
    } catch {}
    return { status: response.status, data, ok };
  } catch (error) {
    return { status: 0, data: String(error), ok: false };
  }
}

async function apiPost(session: SessionManager, path: string, body: any = {}): Promise<{ status: number; data: any; ok: boolean }> {
  try {
    const response = await fetchWithCookies(session, `${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const ok = response.status >= 200 && response.status < 400;
    let data: any = null;
    try {
      const text = await response.text();
      try { data = JSON.parse(text); } catch { data = text.substring(0, 500); }
    } catch {}
    return { status: response.status, data, ok };
  } catch (error) {
    return { status: 0, data: String(error), ok: false };
  }
}

async function checkPageLoads(session: SessionManager, path: string, phase: string, label: string) {
  const url = `${BASE_URL}/${LOCALE}${path}`;
  try {
    const response = await fetchWithCookies(session, url);
    const ok = response.status >= 200 && response.status < 400;
    const contentType = response.headers.get('content-type') || '';
    const isHTML = contentType.includes('text/html');
    const bodyPreview = isHTML ? (await response.text()).substring(0, 200) : `[${contentType}]`;

    record(phase, label, url, ok ? 'PASS' : 'FAIL', `HTTP ${response.status}${!isHTML ? ' (not HTML: ' + contentType + ')' : ''}`);
    return ok;
  } catch (error) {
    record(phase, label, url, 'FAIL', `Error: ${String(error).substring(0, 200)}`);
    return false;
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================
async function main() {
  console.log('='.repeat(80));
  console.log('FULL E2E MULTI-PORTAL VALIDATION (API-Level)');
  console.log(`Target: ${BASE_URL} | Locale: ${LOCALE}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(80));

  // =========================================================================
  // PHASE 1: STARTUP AND HEALTH CHECK
  // =========================================================================
  console.log('\n📋 PHASE 1: STARTUP AND HEALTH CHECK');
  console.log('-'.repeat(50));

  // 1. Frontend
  try {
    const frontendResp = await fetch(`${BASE_URL}/${LOCALE}`);
    record('Phase 1', 'Frontend loads', `${BASE_URL}/${LOCALE}`, frontendResp.status < 400 ? 'PASS' : 'FAIL', `HTTP ${frontendResp.status}`);
  } catch (error) {
    record('Phase 1', 'Frontend loads', `${BASE_URL}/${LOCALE}`, 'FAIL', `Cannot connect: ${error}`);
    console.log('\n🛑 SERVER NOT RUNNING. Aborting.');
    process.exit(1);
  }

  // 2. Health API
  const health = await apiGet(new SessionManager(), '/api/health');
  record('Phase 1', 'API health endpoint', `${BASE_URL}/api/health`, health.ok ? 'PASS' : 'WARN', `HTTP ${health.status} - ${JSON.stringify(health.data).substring(0, 200)}`);

  // 3. Auth CSRF
  const csrf = await apiGet(new SessionManager(), '/api/auth/csrf');
  record('Phase 1', 'Auth CSRF endpoint', `${BASE_URL}/api/auth/csrf`, csrf.ok && csrf.data?.csrfToken ? 'PASS' : 'FAIL', `Has token: ${!!csrf.data?.csrfToken}`);

  // 4. Auth session (unauthenticated)
  const unauthedSession = await apiGet(new SessionManager(), '/api/auth/session');
  record('Phase 1', 'Session endpoint (unauth)', `${BASE_URL}/api/auth/session`, unauthedSession.ok ? 'PASS' : 'FAIL', `HTTP ${unauthedSession.status}`);

  // 5. Login page
  const loginPage = await fetch(`${BASE_URL}/${LOCALE}/login`);
  record('Phase 1', 'Login page loads', `${BASE_URL}/${LOCALE}/login`, loginPage.status < 400 ? 'PASS' : 'FAIL', `HTTP ${loginPage.status}`);

  // =========================================================================
  // PHASE 2: ACCOUNT VALIDATION
  // =========================================================================
  console.log('\n📋 PHASE 2: ACCOUNT VALIDATION');
  console.log('-'.repeat(50));

  // Helper to extract role from session data (NextAuth may nest it differently)
  function extractRole(sessionData: any): string | undefined {
    return sessionData?.user?.role || sessionData?.role || sessionData?.token?.role;
  }

  // Admin auth
  let adminSession: SessionManager;
  try {
    adminSession = await authenticate('admin@eduverse.com', 'password123');
    const adminSessionData = await getSession(adminSession);
    const adminRole = extractRole(adminSessionData);
    const hasAdminSession = adminSession.hasSession();
    record('Phase 2', 'Admin login', `${BASE_URL}/api/auth`, hasAdminSession ? 'PASS' : 'FAIL', `Session: ${hasAdminSession}, Role: ${adminRole || 'none'}, Cookies: [${adminSession.debugCookies()}], SessionKeys: ${JSON.stringify(Object.keys(adminSessionData || {}))}`);
    record('Phase 2', 'Admin role correct', '', adminRole === 'admin' ? 'PASS' : 'WARN', `Expected: admin, Got: ${adminRole}. Full session: ${JSON.stringify(adminSessionData).substring(0, 300)}`);
  } catch (error) {
    record('Phase 2', 'Admin login', '', 'FAIL', String(error));
    adminSession = new SessionManager();
  }

  // Teacher auth
  let teacherSession: SessionManager;
  try {
    teacherSession = await authenticate('teacher@eduverse.com', 'password123');
    const teacherSessionData = await getSession(teacherSession);
    const teacherRole = extractRole(teacherSessionData);
    const hasTeacherSession = teacherSession.hasSession();
    record('Phase 2', 'Teacher login', `${BASE_URL}/api/auth`, hasTeacherSession ? 'PASS' : 'FAIL', `Session: ${hasTeacherSession}, Role: ${teacherRole || 'none'}, Cookies: [${teacherSession.debugCookies()}]`);
    record('Phase 2', 'Teacher role correct', '', teacherRole === 'teacher' ? 'PASS' : 'WARN', `Expected: teacher, Got: ${teacherRole}. Full session: ${JSON.stringify(teacherSessionData).substring(0, 300)}`);
  } catch (error) {
    record('Phase 2', 'Teacher login', '', 'FAIL', String(error));
    teacherSession = new SessionManager();
  }

  // Student auth
  let studentSession: SessionManager;
  try {
    studentSession = await authenticate('student@eduverse.com', 'password123');
    const studentSessionData = await getSession(studentSession);
    const studentRole = extractRole(studentSessionData);
    const hasStudentSession = studentSession.hasSession();
    record('Phase 2', 'Student login', `${BASE_URL}/api/auth`, hasStudentSession ? 'PASS' : 'FAIL', `Session: ${hasStudentSession}, Role: ${studentRole || 'none'}, Cookies: [${studentSession.debugCookies()}]`);
    record('Phase 2', 'Student role correct', '', studentRole === 'student' ? 'PASS' : 'WARN', `Expected: student, Got: ${studentRole}. Full session: ${JSON.stringify(studentSessionData).substring(0, 300)}`);
  } catch (error) {
    record('Phase 2', 'Student login', '', 'FAIL', String(error));
    studentSession = new SessionManager();
  }

  // Fallback admin
  let fallbackAdminSession: SessionManager;
  try {
    fallbackAdminSession = await authenticate('admin@school.com', 'Admin@1234');
    const fallbackSessionData = await getSession(fallbackAdminSession);
    const hasFallbackSession = fallbackAdminSession.hasSession();
    record('Phase 2', 'Fallback admin login', `${BASE_URL}/api/auth`, hasFallbackSession ? 'PASS' : 'WARN', `Session: ${hasFallbackSession}, Role: ${fallbackSessionData?.user?.role || 'none'}`);
  } catch (error) {
    record('Phase 2', 'Fallback admin login', '', 'WARN', `Not available: ${String(error).substring(0, 100)}`);
    fallbackAdminSession = new SessionManager();
  }

  // =========================================================================
  // PHASE 3: MULTI-PORTAL LIVE TEST — ADMIN
  // =========================================================================
  console.log('\n📋 PHASE 3: ADMIN PORTAL');
  console.log('-'.repeat(50));

  // Legacy admin routes (under src/app/[locale]/admin/)
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
    // Portal admin routes (route group (portal) is transparent in URL)
    '/admin/courses',
    '/admin/bundles',
    '/admin/quizzes',
    '/admin/profile',
  ];

  for (const path of adminPages) {
    await checkPageLoads(adminSession!, path, 'Phase 3 Admin', `Admin: ${path}`);
  }

  // Admin API endpoints
  const adminApis = [
    { path: '/api/admin/stats', label: 'Admin stats API' },
    { path: '/api/admin/users', label: 'Admin users API' },
    { path: '/api/grades', label: 'Grades API' },
    { path: '/api/courses', label: 'Courses API' },
    { path: '/api/admin/bundles', label: 'Bundles API' },
    { path: '/api/admin/quizzes', label: 'Quizzes API' },
  ];

  for (const api of adminApis) {
    const result = await apiGet(adminSession!, api.path);
    record('Phase 3 Admin', api.label, `${BASE_URL}${api.path}`, result.ok ? 'PASS' : 'FAIL', `HTTP ${result.status} - ${JSON.stringify(result.data).substring(0, 200)}`);
  }

  // =========================================================================
  // PHASE 3: MULTI-PORTAL LIVE TEST — TEACHER
  // =========================================================================
  console.log('\n📋 PHASE 3: TEACHER PORTAL');
  console.log('-'.repeat(50));

  const teacherPages = [
    '/teacher/home', '/teacher/courses', '/teacher/grades',
    '/teacher/assessments', '/teacher/materials', '/teacher/subjects',
    '/teacher/calendar', '/teacher/chat', '/teacher/profile', '/teacher/reels',
    // Note: /teacher/lessons doesn't have an index page — lessons are accessed via /teacher/courses/[id]
  ];

  for (const path of teacherPages) {
    await checkPageLoads(teacherSession!, path, 'Phase 3 Teacher', `Teacher: ${path}`);
  }

  // Teacher API endpoints
  const coursesResult = await apiGet(teacherSession!, '/api/courses');
  record('Phase 3 Teacher', 'Teacher courses API', `${BASE_URL}/api/courses`, coursesResult.ok ? 'PASS' : 'FAIL', `HTTP ${coursesResult.status} - ${JSON.stringify(coursesResult.data).substring(0, 200)}`);

  let courses: any[] = [];
  if (coursesResult.ok && coursesResult.data) {
    courses = coursesResult.data.courses || coursesResult.data.data || (Array.isArray(coursesResult.data) ? coursesResult.data : []);
  }

  let targetCourseId: string | null = null;
  let targetLessonId: string | null = null;

  if (courses.length > 0) {
    targetCourseId = courses[0].id;
    record('Phase 3 Teacher', 'Course found', '', 'PASS', `Course ID: ${targetCourseId}, Name: ${courses[0].name || courses[0].title || 'N/A'}`);

    // Get lessons for this course
    const lessonsResult = await apiGet(teacherSession!, `/api/courses/${targetCourseId}/lessons`);
    record('Phase 3 Teacher', 'Course lessons API', `${BASE_URL}/api/courses/${targetCourseId}/lessons`, lessonsResult.ok ? 'PASS' : 'FAIL', `HTTP ${lessonsResult.status} - ${JSON.stringify(lessonsResult.data).substring(0, 200)}`);

    let lessons: any[] = [];
    if (lessonsResult.ok && lessonsResult.data) {
      lessons = lessonsResult.data.lessons || lessonsResult.data.data || (Array.isArray(lessonsResult.data) ? lessonsResult.data : []);
    }

    if (lessons.length > 0) {
      targetLessonId = lessons[0].id;
      record('Phase 3 Teacher', 'Lesson found', '', 'PASS', `Lesson ID: ${targetLessonId}, Title: ${lessons[0].title || lessons[0].name || 'N/A'}`);

      // Check lesson detail page
      await checkPageLoads(teacherSession!, `/teacher/courses/${targetCourseId}`, 'Phase 3 Teacher', `Teacher: course ${targetCourseId} detail`);
      await checkPageLoads(teacherSession!, `/teacher/lessons/${targetLessonId}`, 'Phase 3 Teacher', `Teacher: lesson ${targetLessonId} detail`);

      // Check lesson API
      const lessonDetail = await apiGet(teacherSession!, `/api/lessons/${targetLessonId}`);
      record('Phase 3 Teacher', 'Lesson detail API', `${BASE_URL}/api/lessons/${targetLessonId}`, lessonDetail.ok ? 'PASS' : 'FAIL', `HTTP ${lessonDetail.status} - Meet link: ${lessonDetail.data?.meet_link || lessonDetail.data?.lesson?.meet_link || 'NONE'}`);
    } else {
      record('Phase 3 Teacher', 'No lessons in course', '', 'WARN', 'No lessons available for testing');
    }

    // Check course detail page
    await checkPageLoads(teacherSession!, `/teacher/courses/${targetCourseId}`, 'Phase 3 Teacher', `Teacher: course detail page`);
  } else {
    record('Phase 3 Teacher', 'No courses found', '', 'WARN', 'Teacher has no assigned courses');
  }

  // Teacher dashboard API
  const teacherStats = await apiGet(teacherSession!, '/api/dashboard/teacher');
  record('Phase 3 Teacher', 'Teacher dashboard API', `${BASE_URL}/api/dashboard/teacher`, teacherStats.ok ? 'PASS' : 'FAIL', `HTTP ${teacherStats.status}`);

  // =========================================================================
  // PHASE 3: MULTI-PORTAL LIVE TEST — STUDENT
  // =========================================================================
  console.log('\n📋 PHASE 3: STUDENT PORTAL');
  console.log('-'.repeat(50));

  const studentPages = [
    '/student/home', '/student/courses', '/student/assessments',
    '/student/attendance', '/student/calendar', '/student/chat',
    '/student/profile', '/student/reels', '/student/support',
  ];

  for (const path of studentPages) {
    await checkPageLoads(studentSession!, path, 'Phase 3 Student', `Student: ${path}`);
  }

  // Student API endpoints
  const studentCoursesResult = await apiGet(studentSession!, '/api/courses');
  record('Phase 3 Student', 'Student courses API', `${BASE_URL}/api/courses`, studentCoursesResult.ok ? 'PASS' : 'FAIL', `HTTP ${studentCoursesResult.status} - ${JSON.stringify(studentCoursesResult.data).substring(0, 200)}`);

  // If we have a course from teacher testing, check student access
  if (targetCourseId) {
    await checkPageLoads(studentSession!, `/student/courses/${targetCourseId}`, 'Phase 3 Student', `Student: course ${targetCourseId} detail`);

    if (targetLessonId) {
      await checkPageLoads(studentSession!, `/student/courses/${targetCourseId}/lessons/${targetLessonId}`, 'Phase 3 Student', `Student: lesson ${targetLessonId} detail`);
    }
  }

  // =========================================================================
  // PHASE 4: GOOGLE MEET DEEP VALIDATION
  // =========================================================================
  console.log('\n📋 PHASE 4: GOOGLE MEET DEEP VALIDATION');
  console.log('-'.repeat(50));

  if (!targetLessonId) {
    record('Phase 4 Meet', 'No lesson for Meet test', '', 'BLOCKED', 'Cannot test Meet - no lesson available');
  } else {
    // Try to create/get Meet link via API
    const meetResult = await apiPost(teacherSession!, `/api/lessons/${targetLessonId}/meeting`, {});
    record('Phase 4 Meet', 'Create/Get Meet link', `${BASE_URL}/api/lessons/${targetLessonId}/meeting`, meetResult.ok ? 'PASS' : 'FAIL', `HTTP ${meetResult.status} - ${JSON.stringify(meetResult.data).substring(0, 500)}`);

    const meetLink = meetResult.data?.meetLink || meetResult.data?.meet_link || meetResult.data?.meeting?.meet_link || meetResult.data?.data?.meet_link || '';

    if (meetLink) {
      // 1. Format validation
      const validFormat = meetLink.includes('meet.google.com');
      record('Phase 4 Meet', 'Link format valid', '', validFormat ? 'PASS' : 'FAIL', `Link: ${meetLink}`);

      // 2. Not empty
      record('Phase 4 Meet', 'Link not empty', '', meetLink.length > 10 ? 'PASS' : 'FAIL', `Length: ${meetLink.length}`);

      // 3. Persistence check - re-fetch lesson
      const refetch = await apiGet(teacherSession!, `/api/lessons/${targetLessonId}`);
      const persistedLink = refetch.data?.meet_link || refetch.data?.lesson?.meet_link || refetch.data?.data?.meet_link || '';
      record('Phase 4 Meet', 'Link persisted in DB', `${BASE_URL}/api/lessons/${targetLessonId}`, persistedLink ? 'PASS' : 'WARN', `Persisted: ${persistedLink || 'NOT FOUND in refetch'}`);

      // 4. Visible from teacher portal
      await checkPageLoads(teacherSession!, `/teacher/lessons/${targetLessonId}`, 'Phase 4 Meet', 'Meet visible in teacher portal page');

      // 5. Check lesson meeting status
      const meetStatus = await apiGet(teacherSession!, `/api/lessons/${targetLessonId}/status`);
      record('Phase 4 Meet', 'Lesson meeting status', `${BASE_URL}/api/lessons/${targetLessonId}/status`, meetStatus.ok ? 'PASS' : 'WARN', `HTTP ${meetStatus.status} - ${JSON.stringify(meetStatus.data).substring(0, 200)}`);

      // 6. Student access to Meet link
      const studentLessonDetail = await apiGet(studentSession!, `/api/lessons/${targetLessonId}`);
      const studentMeetLink = studentLessonDetail.data?.meet_link || studentLessonDetail.data?.lesson?.meet_link || '';
      record('Phase 4 Meet', 'Meet link visible to student (API)', `${BASE_URL}/api/lessons/${targetLessonId}`, studentMeetLink ? 'PASS' : 'WARN', `Student sees: ${studentMeetLink || 'NOT VISIBLE'}`);

      // 7. Validate Meet link is reachable (HEAD request)
      try {
        const meetResponse = await fetch(meetLink, { method: 'HEAD', redirect: 'follow' });
        record('Phase 4 Meet', 'Meet link reachable', meetLink, meetResponse.status < 500 ? 'PASS' : 'FAIL', `HTTP ${meetResponse.status} (Google Meet responds)`);
      } catch (error) {
        record('Phase 4 Meet', 'Meet link reachable', meetLink, 'WARN', `Cannot reach: ${String(error).substring(0, 100)} (may need Google auth)`);
      }

      // 8. Not duplicated
      const meetResult2 = await apiPost(teacherSession!, `/api/lessons/${targetLessonId}/meeting`, {});
      const meetLink2 = meetResult2.data?.meetLink || meetResult2.data?.meet_link || meetResult2.data?.meeting?.meet_link || '';
      if (meetLink2) {
        const notDuplicated = meetLink === meetLink2;
        record('Phase 4 Meet', 'Link not duplicated on re-call', '', notDuplicated ? 'PASS' : 'WARN', `Original: ${meetLink}, Second: ${meetLink2}`);
      }
    } else {
      record('Phase 4 Meet', 'Meet link generation', '', 'FAIL', `No link returned. Full response: ${JSON.stringify(meetResult.data).substring(0, 500)}`);

      // Check Google integration config
      const googleConnection = await apiGet(teacherSession!, '/api/integrations/google/connection');
      record('Phase 4 Meet', 'Google connection status', `${BASE_URL}/api/integrations/google/connection`, googleConnection.ok ? 'PASS' : 'FAIL', `HTTP ${googleConnection.status} - ${JSON.stringify(googleConnection.data).substring(0, 200)}`);
    }
  }

  // =========================================================================
  // PHASE 5: FULL SWEEP
  // =========================================================================
  console.log('\n📋 PHASE 5: FULL PAGE/API SWEEP');
  console.log('-'.repeat(50));

  // Public pages (Note: /courses has no index page — only /courses/[id] exists)
  const publicPages = ['/', '/about-us', '/join', '/contact', '/services', '/blogs'];
  for (const path of publicPages) {
    await checkPageLoads(new SessionManager(), path, 'Phase 5 Public', `Public: ${path}`);
  }

  // Dashboard pages (admin)
  const dashboardPages = [
    '/dashboard', '/dashboard/calendar', '/dashboard/live', '/dashboard/messages',
    '/dashboard/profile', '/dashboard/settings', '/dashboard/students',
    '/dashboard/teachers', '/dashboard/users', '/dashboard/fees',
    '/dashboard/applications',
  ];
  for (const path of dashboardPages) {
    await checkPageLoads(adminSession!, path, 'Phase 5 Dashboard', `Dashboard: ${path}`);
  }

  // Report pages
  const reportPages = ['/dashboard/admin/reports'];
  for (const path of reportPages) {
    await checkPageLoads(adminSession!, path, 'Phase 5 Reports', `Report: ${path}`);
  }

  // Additional API checks
  const additionalApis = [
    { session: adminSession!, path: '/api/dashboard/stats', label: 'Dashboard stats' },
    { session: adminSession!, path: '/api/admin/meetings', label: 'Admin meetings' },
    { session: adminSession!, path: '/api/attendance/report', label: 'Attendance report' },
    { session: teacherSession!, path: '/api/assessments', label: 'Assessments API' },
    { session: teacherSession!, path: '/api/materials', label: 'Materials API' },
    { session: adminSession!, path: '/api/enrollment-applications', label: 'Enrollment applications' },
    { session: adminSession!, path: '/api/support/tickets', label: 'Support tickets' },
  ];

  for (const api of additionalApis) {
    const result = await apiGet(api.session, api.path);
    record('Phase 5 APIs', api.label, `${BASE_URL}${api.path}`, result.ok ? 'PASS' : (result.status === 401 ? 'WARN' : 'FAIL'), `HTTP ${result.status}`);
  }

  // Google integration check
  const googleConnect = await apiGet(teacherSession!, '/api/integrations/google/connection');
  record('Phase 5 APIs', 'Google integration status', `${BASE_URL}/api/integrations/google/connection`, googleConnect.ok ? 'PASS' : 'WARN', `HTTP ${googleConnect.status} - ${JSON.stringify(googleConnect.data).substring(0, 200)}`);

  // =========================================================================
  // FINAL REPORT
  // =========================================================================
  console.log('\n' + '='.repeat(80));
  console.log('FINAL COMPREHENSIVE REPORT');
  console.log('='.repeat(80));

  const phases = [...new Set(evidence.map(e => e.phase))];

  for (const phase of phases) {
    const items = evidence.filter(e => e.phase === phase);
    const passed = items.filter(e => e.status === 'PASS').length;
    const failed = items.filter(e => e.status === 'FAIL').length;
    const warned = items.filter(e => e.status === 'WARN').length;
    const blocked = items.filter(e => e.status === 'BLOCKED').length;

    console.log(`\n--- ${phase} ---`);
    console.log(`  PASS: ${passed} | FAIL: ${failed} | WARN: ${warned} | BLOCKED: ${blocked}`);

    // Show failures and blocks
    items.filter(e => e.status === 'FAIL' || e.status === 'BLOCKED').forEach(e => {
      console.log(`  ❌ ${e.step}: ${e.detail}`);
    });
    // Show warnings
    items.filter(e => e.status === 'WARN').forEach(e => {
      console.log(`  ⚠️  ${e.step}: ${e.detail}`);
    });
  }

  // Summary
  const totalPassed = evidence.filter(e => e.status === 'PASS').length;
  const totalFailed = evidence.filter(e => e.status === 'FAIL').length;
  const totalWarned = evidence.filter(e => e.status === 'WARN').length;
  const totalBlocked = evidence.filter(e => e.status === 'BLOCKED').length;

  console.log('\n' + '='.repeat(80));
  console.log('OVERALL SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total checks: ${evidence.length}`);
  console.log(`  ✅ PASS:    ${totalPassed}`);
  console.log(`  ❌ FAIL:    ${totalFailed}`);
  console.log(`  ⚠️  WARN:    ${totalWarned}`);
  console.log(`  🚫 BLOCKED: ${totalBlocked}`);

  console.log('\n--- ACCOUNT STATUS ---');
  console.log(`  Admin:    ${adminSession!.hasSession() ? 'ACTIVE' : 'FAILED'}`);
  console.log(`  Teacher:  ${teacherSession!.hasSession() ? 'ACTIVE' : 'FAILED'}`);
  console.log(`  Student:  ${studentSession!.hasSession() ? 'ACTIVE' : 'FAILED'}`);
  console.log(`  Fallback: ${fallbackAdminSession!.hasSession() ? 'ACTIVE' : 'NOT AVAILABLE'}`);

  console.log('\n--- FINAL VERDICT ---');
  if (totalFailed === 0 && totalBlocked === 0) {
    console.log('🟢 VERDICT: PASS — All checks passed');
  } else if (totalFailed > 5) {
    console.log(`🔴 VERDICT: FAIL — ${totalFailed} failures, ${totalBlocked} blocked`);
  } else {
    console.log(`🟡 VERDICT: PARTIAL — ${totalFailed} failures, ${totalWarned} warnings, ${totalBlocked} blocked`);
  }

  console.log('\n--- DEFECTS ---');
  if (defects.length === 0) {
    const failedItems = evidence.filter(e => e.status === 'FAIL');
    if (failedItems.length > 0) {
      console.log('Auto-detected defects from failures:');
      failedItems.forEach((item, i) => {
        console.log(`  ${i + 1}. [${item.phase}] ${item.step}`);
        console.log(`     Detail: ${item.detail}`);
        console.log(`     URL: ${item.url}`);
      });
    } else {
      console.log('  No defects found.');
    }
  }

  console.log('='.repeat(80));

  // Exit with appropriate code
  process.exit(totalFailed > 5 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
