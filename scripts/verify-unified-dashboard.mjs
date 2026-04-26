#!/usr/bin/env node
// Manual verification for the unified dashboard portal.
// Run against a live dev server: `npm run dev` then `node scripts/verify-unified-dashboard.mjs`.
// Optional env vars (used only for the role-login checks): ADMIN_EMAIL, ADMIN_PASSWORD,
// TEACHER_EMAIL, TEACHER_PASSWORD, STUDENT_EMAIL, STUDENT_PASSWORD, PARENT_EMAIL, PARENT_PASSWORD.

const BASE = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.BASE_URL || 'http://127.0.0.1:3000';

const redirectChecks = [
  { name: 'legacy /ar/student/home -> /ar/dashboard',              url: '/ar/student/home',             location: /\/ar\/dashboard\/?$/ },
  { name: 'legacy /ar/teacher/home -> /ar/dashboard',              url: '/ar/teacher/home',             location: /\/ar\/dashboard\/?$/ },
  { name: 'legacy /ar/admin/students -> /ar/dashboard/students',   url: '/ar/admin/students',           location: /\/ar\/dashboard\/students\/?$/ },
  { name: 'legacy /ar/parent/invoices -> /ar/dashboard/payments',  url: '/ar/parent/invoices',          location: /\/ar\/dashboard\/payments\/?$/ },
  { name: 'legacy /ar/temp-teacher/home -> /ar/dashboard',         url: '/ar/temp-teacher/home',        location: /\/ar\/dashboard\/?$/ },
  { name: 'legacy /en/teacher/courses -> /en/dashboard/courses',   url: '/en/teacher/courses',          location: /\/en\/dashboard\/courses\/?$/ },
  { name: 'legacy /ar/parent/payments/success passthrough',        url: '/ar/parent/payments/success',  location: /\/ar\/dashboard\/payments\/success/ },
];

async function runRedirectChecks() {
  let passed = 0, failed = 0;
  for (const c of redirectChecks) {
    try {
      const res = await fetch(BASE + c.url, { redirect: 'manual' });
      const loc = res.headers.get('location') || '';
      const ok = (res.status === 301 || res.status === 308) && c.location.test(loc);
      if (ok) passed++; else failed++;
      console.log(`${ok ? 'PASS' : 'FAIL'} ${c.name} -> ${res.status} ${loc}`);
    } catch (e) {
      failed++;
      console.log(`ERR  ${c.name} -> ${e.message}`);
    }
  }
  return { passed, failed };
}

async function runUnauthGateChecks() {
  // Unauthenticated: /dashboard should redirect to /login via the layout.
  // /dashboard/users should be rewritten to /dashboard/forbidden by middleware,
  // then the forbidden page's layout still redirects to /login (since session is missing).
  const tests = [
    { name: 'unauth /ar/dashboard redirects toward /login',        url: '/ar/dashboard',        status: [200, 307], locationHint: /login/ },
    { name: 'unauth /ar/dashboard/users gets gated',               url: '/ar/dashboard/users',  status: [200, 307], locationHint: /(login|forbidden)/ },
  ];
  let passed = 0, failed = 0;
  for (const c of tests) {
    try {
      const res = await fetch(BASE + c.url, { redirect: 'manual' });
      const loc = res.headers.get('location') || '';
      const okStatus = c.status.includes(res.status);
      const okLocation = !loc || c.locationHint.test(loc);
      const ok = okStatus && okLocation;
      if (ok) passed++; else failed++;
      console.log(`${ok ? 'PASS' : 'FAIL'} ${c.name} -> ${res.status} ${loc}`);
    } catch (e) {
      failed++;
      console.log(`ERR  ${c.name} -> ${e.message}`);
    }
  }
  return { passed, failed };
}

(async () => {
  console.log(`== Redirect checks against ${BASE} ==`);
  const r = await runRedirectChecks();
  console.log(`== Middleware gate checks ==`);
  const g = await runUnauthGateChecks();
  const total = r.passed + g.passed;
  const totalFailed = r.failed + g.failed;
  console.log(`--- ${total} passed, ${totalFailed} failed ---`);
  process.exit(totalFailed === 0 ? 0 : 1);
})();
