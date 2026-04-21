# Unified Dashboard Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate `/student`, `/teacher`, `/temp-teacher`, `/admin`, `/parent` portals into a single `/dashboard` portal with role-based permissions, matching `https://futurelab.school/ar/dashboard` for all roles.

**Architecture:** A single server-side permission map (`ROUTE_ACCESS`) drives both sidebar filtering (already partially built in `ReferenceDashboardShell`) and per-page server gating (`requireAccess`). The dashboard layout stops redirecting non-admin users. Login is unified to `/<locale>/login`, legacy role-portal URLs are redirected via middleware, and the legacy folders are deleted.

**Tech Stack:** Next.js 14 App Router, NextAuth 4.24, TypeScript 5.x, Supabase, Tailwind CSS v4, Playwright, Jest.

**Reference spec:** `docs/superpowers/specs/2026-04-19-unified-dashboard-portal-design.md`

---

## File Structure

**Created**
- `src/lib/dashboard-permissions.ts` — `ROUTE_ACCESS` map, `hasAccess(role, path)`, `LEGACY_REDIRECTS` map, `DashboardRole` type.
- `src/lib/require-access.ts` — server helper `requireDashboardAccess(path)` for App Router pages.
- `src/components/dashboard/AccessDenied.tsx` — server component rendering a 403 inside the dashboard shell.
- `src/components/dashboard/home/TeacherHome.tsx`, `StudentHome.tsx`, `ParentHome.tsx` — role-specific home panels.
- `tests/lib/dashboard-permissions.spec.ts` — unit tests for `hasAccess`.
- `tests/unified-dashboard.spec.ts` — Playwright: login per role → sidebar contents → gated routes → legacy redirects.

**Modified**
- `src/app/[locale]/dashboard/layout.tsx` — drop role-redirect block; keep unauth redirect only.
- `src/app/[locale]/dashboard/page.tsx` — role-aware dispatch to the four home panels.
- `src/components/dashboard/ReferenceDashboardShell.tsx` — read role from server props (via context or prop plumbing) rather than defaulting to `'admin'`.
- `src/lib/auth.ts` — `callbacks.redirect` always returns `/<locale>/dashboard`.
- `src/middleware.ts` — add legacy-portal redirects before locale middleware.
- `src/app/[locale]/(auth)/login/page.tsx` — accept all roles; post-login → `/dashboard`.

**Deleted (Phase 4)**
- `src/app/[locale]/student/**`
- `src/app/[locale]/teacher/**`
- `src/app/[locale]/temp-teacher/**`
- `src/app/[locale]/admin/**`
- `src/app/[locale]/parent/**`
- `src/app/[locale]/(auth)/login/{student,teacher,admin}/**`
- `src/app/[locale]/(portal)/admin/**` (the inner route-group duplicate)
- Unused members of `src/components/{student,teacher,parent}/**`.

---

## Phase 0 — Permission layer

### Task 1: Define the permission module

**Files:**
- Create: `src/lib/dashboard-permissions.ts`
- Test: `tests/lib/dashboard-permissions.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/dashboard-permissions.spec.ts
import { describe, expect, it } from '@jest/globals';
import { hasAccess, legacyRedirectFor, ROUTE_ACCESS } from '@/lib/dashboard-permissions';

describe('hasAccess', () => {
  it('admin can access every listed route', () => {
    for (const route of Object.keys(ROUTE_ACCESS)) {
      expect(hasAccess('admin', route)).toBe(true);
    }
  });

  it('student can access /dashboard/courses but not /dashboard/users', () => {
    expect(hasAccess('student', '/dashboard/courses')).toBe(true);
    expect(hasAccess('student', '/dashboard/users')).toBe(false);
  });

  it('teacher can access /dashboard/quizzes and /dashboard/lessons', () => {
    expect(hasAccess('teacher', '/dashboard/quizzes')).toBe(true);
    expect(hasAccess('teacher', '/dashboard/lessons')).toBe(true);
  });

  it('parent can access /dashboard/payments but not /dashboard/quizzes', () => {
    expect(hasAccess('parent', '/dashboard/payments')).toBe(true);
    expect(hasAccess('parent', '/dashboard/quizzes')).toBe(false);
  });

  it('unlisted route defaults to admin-only', () => {
    expect(hasAccess('teacher', '/dashboard/secret-path-not-listed')).toBe(false);
    expect(hasAccess('admin', '/dashboard/secret-path-not-listed')).toBe(true);
  });

  it('longest-prefix wins: /dashboard/courses/123 inherits /dashboard/courses', () => {
    expect(hasAccess('student', '/dashboard/courses/123')).toBe(true);
  });

  it('unknown role denied', () => {
    expect(hasAccess('guest', '/dashboard')).toBe(false);
    expect(hasAccess(undefined, '/dashboard')).toBe(false);
  });
});

describe('legacyRedirectFor', () => {
  it('maps /student/home to /dashboard', () => {
    expect(legacyRedirectFor('/ar/student/home')).toBe('/ar/dashboard');
  });
  it('maps /teacher/courses to /dashboard/courses', () => {
    expect(legacyRedirectFor('/en/teacher/courses')).toBe('/en/dashboard/courses');
  });
  it('maps /parent/invoices to /dashboard/payments', () => {
    expect(legacyRedirectFor('/ar/parent/invoices')).toBe('/ar/dashboard/payments');
  });
  it('returns null for non-legacy paths', () => {
    expect(legacyRedirectFor('/ar/dashboard/courses')).toBeNull();
    expect(legacyRedirectFor('/ar/about')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/lib/dashboard-permissions.spec.ts`
Expected: FAIL — "Cannot find module '@/lib/dashboard-permissions'".

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/dashboard-permissions.ts
export type DashboardRole = 'admin' | 'teacher' | 'student' | 'parent' | 'supervisor';

const KNOWN_ROLES: DashboardRole[] = ['admin', 'teacher', 'student', 'parent', 'supervisor'];

// Admin is allowed everywhere implicitly; other roles must be listed explicitly.
// Unlisted routes default to admin-only (safe default).
export const ROUTE_ACCESS: Record<string, DashboardRole[]> = {
  '/dashboard':                  ['admin', 'teacher', 'student', 'parent', 'supervisor'],
  '/dashboard/profile':          ['admin', 'teacher', 'student', 'parent', 'supervisor'],
  '/dashboard/messages':         ['admin', 'teacher', 'student', 'parent', 'supervisor'],
  '/dashboard/announcements':    ['admin', 'teacher', 'student', 'parent', 'supervisor'],
  '/dashboard/calendar':         ['admin', 'teacher', 'student', 'parent', 'supervisor'],
  '/dashboard/courses':          ['admin', 'teacher', 'student', 'supervisor'],
  '/dashboard/lessons':          ['admin', 'teacher', 'student', 'supervisor'],
  '/dashboard/classroom':        ['admin', 'teacher', 'student', 'supervisor'],
  '/dashboard/exams':            ['admin', 'teacher', 'student', 'supervisor'],
  '/dashboard/quizzes':          ['admin', 'teacher', 'student', 'supervisor'],
  '/dashboard/live':             ['admin', 'teacher', 'student', 'supervisor'],
  '/dashboard/bundles':          ['admin', 'teacher', 'supervisor'],
  '/dashboard/students':         ['admin', 'teacher', 'parent', 'supervisor'],
  '/dashboard/teachers':         ['admin', 'supervisor'],
  '/dashboard/users':            ['admin'],
  '/dashboard/role-management':  ['admin'],
  '/dashboard/system-settings':  ['admin'],
  '/dashboard/reports':          ['admin', 'teacher', 'supervisor'],
  '/dashboard/admin/reports':    ['admin'],
  '/dashboard/applications':     ['admin', 'supervisor', 'parent'],
  '/dashboard/payments':         ['admin', 'parent'],
  '/dashboard/fees':             ['admin', 'parent'],
  '/dashboard/salaries':         ['admin', 'teacher'],
  '/dashboard/payslips':         ['admin', 'teacher'],
  '/dashboard/expenses':         ['admin'],
  '/dashboard/coupons':          ['admin'],
  '/dashboard/currencies':       ['admin'],
  '/dashboard/banks':            ['admin'],
  '/dashboard/categories':       ['admin', 'supervisor'],
  '/dashboard/cms':              ['admin'],
  '/dashboard/blogs':            ['admin'],
  '/dashboard/translations':     ['admin'],
  '/dashboard/lookups':          ['admin'],
  '/dashboard/backup':           ['admin'],
  '/dashboard/settings':         ['admin', 'teacher', 'student', 'parent', 'supervisor'],
};

function normalizeRole(role: string | undefined): DashboardRole | null {
  if (!role) return null;
  const lower = role.toLowerCase();
  return (KNOWN_ROLES as string[]).includes(lower) ? (lower as DashboardRole) : null;
}

function stripLocale(path: string): string {
  const m = path.match(/^\/(ar|en)(\/.*)?$/);
  return m ? m[2] || '/' : path;
}

function longestPrefixMatch(path: string): string | null {
  const keys = Object.keys(ROUTE_ACCESS).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (path === k || path.startsWith(k + '/')) return k;
  }
  return null;
}

export function hasAccess(role: string | undefined, path: string): boolean {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  const matched = longestPrefixMatch(stripLocale(path));
  const allowed = matched ? ROUTE_ACCESS[matched] : (['admin'] as DashboardRole[]);
  return allowed.includes(normalized);
}

// Legacy portal → unified dashboard URL mapping.
// Key is the legacy prefix (without locale); value is the dashboard destination.
const LEGACY_MAP: Array<{ from: RegExp; to: string }> = [
  // exact home pages
  { from: /^\/student\/home$/,        to: '/dashboard' },
  { from: /^\/teacher\/home$/,        to: '/dashboard' },
  { from: /^\/temp-teacher\/home$/,   to: '/dashboard' },
  { from: /^\/admin\/home$/,          to: '/dashboard' },
  { from: /^\/parent\/home$/,         to: '/dashboard' },

  // parent-specific rebinds
  { from: /^\/parent\/invoices(\/.*)?$/,  to: '/dashboard/payments$1' },
  { from: /^\/parent\/payments(\/.*)?$/,  to: '/dashboard/payments$1' },
  { from: /^\/parent\/courses(\/.*)?$/,   to: '/dashboard/courses$1' },
  { from: /^\/parent\/applications(\/.*)?$/, to: '/dashboard/applications$1' },

  // generic per-portal pass-through: everything else collapses to /dashboard/<rest>
  { from: /^\/student(\/.*)?$/,       to: '/dashboard$1' },
  { from: /^\/teacher(\/.*)?$/,       to: '/dashboard$1' },
  { from: /^\/temp-teacher(\/.*)?$/,  to: '/dashboard$1' },
  { from: /^\/admin(\/.*)?$/,         to: '/dashboard$1' },
  { from: /^\/parent(\/.*)?$/,        to: '/dashboard$1' },
];

export function legacyRedirectFor(fullPath: string): string | null {
  const m = fullPath.match(/^\/(ar|en)(\/.*)?$/);
  if (!m) return null;
  const locale = m[1];
  const rest = m[2] || '/';

  for (const rule of LEGACY_MAP) {
    const match = rest.match(rule.from);
    if (match) {
      const destination = rule.to.replace(/\$(\d+)/g, (_, idx) => match[Number(idx)] ?? '');
      return `/${locale}${destination}`;
    }
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/lib/dashboard-permissions.spec.ts`
Expected: PASS — 11 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/dashboard-permissions.ts tests/lib/dashboard-permissions.spec.ts
git commit -m "feat(dashboard): add role permission map and legacy redirect resolver"
```

---

### Task 2: Add server-side page gate helper

**Files:**
- Create: `src/lib/require-access.ts`
- Create: `src/components/dashboard/AccessDenied.tsx`

- [ ] **Step 1: Write AccessDenied component**

```tsx
// src/components/dashboard/AccessDenied.tsx
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

export default function AccessDenied({ locale }: { locale: string }) {
  const isArabic = locale === 'ar';
  return (
    <ReferenceDashboardShell pageTitle={isArabic ? 'ممنوع الوصول' : 'Access denied'}>
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
        {isArabic
          ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة.'
          : 'You do not have permission to view this page.'}
      </div>
    </ReferenceDashboardShell>
  );
}
```

- [ ] **Step 2: Write requireDashboardAccess helper**

```ts
// src/lib/require-access.ts
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { hasAccess } from '@/lib/dashboard-permissions';
import { withLocalePrefix } from '@/lib/locale-path';

export type AccessResult =
  | { allowed: true; role: string }
  | { allowed: false; role: string };

export async function requireDashboardAccess(
  locale: string,
  path: string,
): Promise<AccessResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(withLocalePrefix('/login', locale));
  }
  const user = await getCurrentUser(session);
  const role = (user?.role || '').toLowerCase();
  return hasAccess(role, path)
    ? { allowed: true, role }
    : { allowed: false, role };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/require-access.ts src/components/dashboard/AccessDenied.tsx
git commit -m "feat(dashboard): add requireDashboardAccess helper and AccessDenied view"
```

---

## Phase 1 — Allow roles into /dashboard and filter sidebar

### Task 3: Remove redirect block from dashboard layout

**Files:**
- Modify: `src/app/[locale]/dashboard/layout.tsx`

- [ ] **Step 1: Replace layout body**

```tsx
// src/app/[locale]/dashboard/layout.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { withLocalePrefix } from '@/lib/locale-path';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function DashboardLayout({
  children,
  params: { locale },
}: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(withLocalePrefix('/login', locale));
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Verify dev build compiles**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/dashboard/layout.tsx
git commit -m "refactor(dashboard): allow all authenticated roles into /dashboard"
```

---

### Task 4: Harden sidebar role source

**Files:**
- Modify: `src/components/dashboard/ReferenceDashboardShell.tsx:192`

The shell currently does `const userRole = ((session?.user as { role?: string } | undefined)?.role || 'admin').toUpperCase();` — defaulting to admin means a student without a populated role sees admin items. Change the default behavior to be minimally permissive and consumed by the filter.

- [ ] **Step 1: Replace the role resolution and filtering**

Find (at `src/components/dashboard/ReferenceDashboardShell.tsx:192`):

```tsx
const userRole = ((session?.user as { role?: string } | undefined)?.role || 'admin').toUpperCase();
```

Replace with:

```tsx
const rawRole = ((session?.user as { role?: string } | undefined)?.role || '').toLowerCase();
const normalizedRole: DashRole = (['admin','teacher','student','parent','supervisor'] as const).includes(rawRole as DashRole)
  ? (rawRole as DashRole)
  : 'student';
const userRole = normalizedRole.toUpperCase();
```

Find (earlier in the file) any place the component calls `filterGroupsByRole` / `filterItemsByRole` and ensure both receive `normalizedRole`. If those calls are missing today, add them where nav groups/items are rendered:

```tsx
const visibleGroups = filterGroupsByRole(navGroups, normalizedRole);
const visibleFooter = filterItemsByRole(footerItems, normalizedRole);
const visibleOverview = dashboardOverviewItem.roles.includes(normalizedRole) ? dashboardOverviewItem : null;
```

Wire `visibleGroups`, `visibleFooter`, and `visibleOverview` into the existing render instead of the raw `navGroups`/`footerItems`/`dashboardOverviewItem`.

- [ ] **Step 2: Verify typecheck**

Run: `npm run lint`
Expected: PASS (no new errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/ReferenceDashboardShell.tsx
git commit -m "fix(dashboard): derive sidebar role from session and filter nav by role"
```

---

### Task 5: Gate every dashboard page with requireDashboardAccess

**Files:**
- Modify each `src/app/[locale]/dashboard/**/page.tsx` that is not already role-aware.

Strategy: do this as a single sweep. For every `page.tsx` under `src/app/[locale]/dashboard/`, add the gate at the top of the default export.

- [ ] **Step 1: Add the gate to every dashboard page**

For each dashboard page file (expand the glob at implementation time), prepend the server-side gate:

```tsx
// Example for src/app/[locale]/dashboard/users/page.tsx
import { requireDashboardAccess } from '@/lib/require-access';
import AccessDenied from '@/components/dashboard/AccessDenied';

export default async function Page({ params }: { params: { locale: string } }) {
  const gate = await requireDashboardAccess(params.locale, '/dashboard/users');
  if (!gate.allowed) return <AccessDenied locale={params.locale} />;

  // ... existing page body
}
```

For client-component pages (`'use client'` at top), wrap them with a server component instead:

```tsx
// src/app/[locale]/dashboard/courses/page.tsx  (server)
import { requireDashboardAccess } from '@/lib/require-access';
import AccessDenied from '@/components/dashboard/AccessDenied';
import CoursesClient from './CoursesClient';

export default async function Page({ params }: { params: { locale: string } }) {
  const gate = await requireDashboardAccess(params.locale, '/dashboard/courses');
  if (!gate.allowed) return <AccessDenied locale={params.locale} />;
  return <CoursesClient />;
}
```

Keep the existing client code and export it as `CoursesClient` from a co-located `CoursesClient.tsx`.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS — all pages type-check.

- [ ] **Step 3: Commit**

```bash
git add src/app/\[locale\]/dashboard
git commit -m "feat(dashboard): gate every dashboard page via requireDashboardAccess"
```

---

### Task 6: Role-aware dashboard home

**Files:**
- Create: `src/components/dashboard/home/TeacherHome.tsx`
- Create: `src/components/dashboard/home/StudentHome.tsx`
- Create: `src/components/dashboard/home/ParentHome.tsx`
- Modify: `src/app/[locale]/dashboard/page.tsx`

- [ ] **Step 1: Scaffold role home panels**

Each home panel keeps the visual grammar of `ReferenceDashboardOverview` (pastel KPI cards, RTL, Arabic default). Until data wiring lands in a follow-up, each panel shows role-appropriate static stubs so the page never blanks.

```tsx
// src/components/dashboard/home/TeacherHome.tsx
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

export default function TeacherHome({ locale }: { locale: string }) {
  const ar = locale === 'ar';
  return (
    <ReferenceDashboardShell pageTitle={ar ? 'لوحة المعلم' : 'Teacher dashboard'}>
      <section className="grid gap-4 md:grid-cols-4">
        <KpiCard title={ar ? 'المواد' : 'Courses'} value="—" tone="indigo" />
        <KpiCard title={ar ? 'الدروس اليوم' : 'Lessons today'} value="—" tone="emerald" />
        <KpiCard title={ar ? 'تسليمات جديدة' : 'New submissions'} value="—" tone="amber" />
        <KpiCard title={ar ? 'رسائل' : 'Messages'} value="—" tone="rose" />
      </section>
    </ReferenceDashboardShell>
  );
}

function KpiCard({ title, value, tone }: { title: string; value: string; tone: 'indigo'|'emerald'|'amber'|'rose' }) {
  const bg = { indigo:'bg-indigo-50', emerald:'bg-emerald-50', amber:'bg-amber-50', rose:'bg-rose-50' }[tone];
  return (
    <div className={`rounded-2xl ${bg} p-5`}>
      <div className="text-sm text-slate-600">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
```

Write `StudentHome.tsx` the same way with titles `المواد | الامتحانات القادمة | الواجبات | الإعلانات` / `Courses | Upcoming exams | Assignments due | Announcements`.

Write `ParentHome.tsx` with `أبنائي | المدفوعات الأخيرة | الحضور | الرسائل` / `My children | Recent payments | Attendance | Messages`.

- [ ] **Step 2: Dispatch home panel by role**

```tsx
// src/app/[locale]/dashboard/page.tsx
import { requireDashboardAccess } from '@/lib/require-access';
import AccessDenied from '@/components/dashboard/AccessDenied';
import ReferenceDashboardOverview from '@/components/dashboard/ReferenceDashboardOverview';
import TeacherHome from '@/components/dashboard/home/TeacherHome';
import StudentHome from '@/components/dashboard/home/StudentHome';
import ParentHome from '@/components/dashboard/home/ParentHome';

export default async function Page({ params }: { params: { locale: string } }) {
  const gate = await requireDashboardAccess(params.locale, '/dashboard');
  if (!gate.allowed) return <AccessDenied locale={params.locale} />;

  switch (gate.role) {
    case 'teacher':    return <TeacherHome locale={params.locale} />;
    case 'student':    return <StudentHome locale={params.locale} />;
    case 'parent':     return <ParentHome locale={params.locale} />;
    case 'admin':
    case 'supervisor':
    default:           return <ReferenceDashboardOverview />;
  }
}
```

- [ ] **Step 3: Verify each role renders the correct home (manual)**

Run: `npm run dev` and log in as each role; visit `/ar/dashboard`.
Expected: admin sees the existing overview; teacher/student/parent see their own KPI panel.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/home src/app/\[locale\]/dashboard/page.tsx
git commit -m "feat(dashboard): role-aware dashboard home for teacher/student/parent"
```

---

## Phase 2 — Login unification

### Task 7: Single login route

**Files:**
- Keep: `src/app/[locale]/(auth)/login/page.tsx` (already exists) — make it accept any role.
- Modify: `src/app/[locale]/(auth)/login/student/page.tsx` → redirect to `/login`.
- Modify: `src/app/[locale]/(auth)/login/teacher/page.tsx` → redirect to `/login`.
- Modify: `src/app/[locale]/(auth)/login/admin/page.tsx` → redirect to `/login`.
- Modify: `src/lib/auth.ts` — add `callbacks.redirect`.

- [ ] **Step 1: Redirect each role-specific login**

Example for `src/app/[locale]/(auth)/login/student/page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';

export default function StudentLoginRedirect({ params }: { params: { locale: string } }) {
  redirect(withLocalePrefix('/login', params.locale));
}
```

Do the same for `teacher` and `admin` variants.

- [ ] **Step 2: Add post-login redirect callback**

In `src/lib/auth.ts`, inside `callbacks: { ... }`, add:

```ts
async redirect({ url, baseUrl }) {
  // Always land authenticated users at /dashboard, preserving locale.
  const parsed = (() => { try { return new URL(url); } catch { return null; } })();
  const localeMatch = parsed?.pathname.match(/^\/(ar|en)(\/|$)/);
  const locale = localeMatch?.[1] ?? 'ar';
  return `${baseUrl}/${locale}/dashboard`;
},
```

- [ ] **Step 3: Verify login flow for each role**

Run: `npm run dev`
Manual: sign in with a student account via `/ar/login`. Expected: lands at `/ar/dashboard` with the student home.

- [ ] **Step 4: Commit**

```bash
git add src/app/\[locale\]/\(auth\)/login src/lib/auth.ts
git commit -m "feat(auth): unify login to /login; always post-auth redirect to /dashboard"
```

---

## Phase 3 — Middleware redirects for legacy portals

### Task 8: Add legacy-portal redirects in middleware

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Replace middleware.ts**

```ts
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';
import { legacyRedirectFor } from './lib/dashboard-permissions';

const intl = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'always',
});

export default function middleware(req: NextRequest) {
  const target = legacyRedirectFor(req.nextUrl.pathname);
  if (target) {
    const dest = req.nextUrl.clone();
    dest.pathname = target;
    return NextResponse.redirect(dest, 301);
  }
  return intl(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

- [ ] **Step 2: Verify redirects**

Run: `npm run dev`
Manual checks:
- Visit `/ar/student/home` → browser URL becomes `/ar/dashboard`.
- Visit `/en/teacher/courses` → browser URL becomes `/en/dashboard/courses`.
- Visit `/ar/parent/invoices` → browser URL becomes `/ar/dashboard/payments`.

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(middleware): redirect legacy role-portal paths to /dashboard equivalents"
```

---

## Phase 4 — Delete legacy portals

### Task 9: Delete legacy portal folders

Do this after Tasks 3–8 have landed and the build is green. The middleware rule runs first, so visiting any legacy path is already redirected; deleting the folders only affects dead code.

**Files (deleted):**
- `src/app/[locale]/student/**`
- `src/app/[locale]/teacher/**`
- `src/app/[locale]/temp-teacher/**`
- `src/app/[locale]/admin/**`
- `src/app/[locale]/parent/**`
- `src/app/[locale]/(portal)/admin/**`

- [ ] **Step 1: Find cross-portal imports first**

Run: `npx grep -rn "from '@/app/\[locale\]/\(student\|teacher\|temp-teacher\|admin\|parent\)" src` (use `Grep` tool).
Expected: zero matches. If any found, update the importer to the dashboard equivalent before deleting.

- [ ] **Step 2: Delete the folders**

```bash
git rm -r "src/app/[locale]/student" \
         "src/app/[locale]/teacher" \
         "src/app/[locale]/temp-teacher" \
         "src/app/[locale]/admin" \
         "src/app/[locale]/parent" \
         "src/app/[locale]/(portal)/admin"
```

- [ ] **Step 3: Build and fix any dangling references**

Run: `npm run build`
For each error: follow the import chain, replace the import with the dashboard equivalent (or delete the importer if unused).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(dashboard): delete legacy role portals (migrated to unified /dashboard)"
```

---

### Task 10: Delete legacy login variants

**Files (deleted):**
- `src/app/[locale]/(auth)/login/student`
- `src/app/[locale]/(auth)/login/teacher`
- `src/app/[locale]/(auth)/login/admin`

The Task 7 redirect shims remain useful for a build cycle to catch any remaining bookmark; delete them now that legacy portals are gone.

- [ ] **Step 1: Delete**

```bash
git rm -r "src/app/[locale]/(auth)/login/student" \
         "src/app/[locale]/(auth)/login/teacher" \
         "src/app/[locale]/(auth)/login/admin"
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore(auth): delete legacy per-role login pages"
```

---

### Task 11: Sweep unused legacy components

**Files:**
- Audit: `src/components/student/**`, `src/components/teacher/**`, `src/components/parent/**`.

- [ ] **Step 1: For each file, check if anything imports it**

For a file `src/components/student/StudentSideNav.tsx`, run `Grep` for `StudentSideNav`. If zero hits outside the file itself, delete it. Keep anything still used by `/dashboard` code.

- [ ] **Step 2: Delete unused files**

Using `git rm` for each confirmed-unused file.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(dashboard): remove unused legacy portal components"
```

---

## Phase 5 — Regression test

### Task 12: Playwright test — per-role unified dashboard

**Files:**
- Create: `tests/unified-dashboard.spec.ts`

- [ ] **Step 1: Write the test**

```ts
// tests/unified-dashboard.spec.ts
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3000';

const roles = [
  { name: 'admin',   email: process.env.ADMIN_EMAIL!,   password: process.env.ADMIN_PASSWORD!,   expectedItems: ['المستخدمون', 'النسخ الاحتياطي والاستعادة'] },
  { name: 'teacher', email: process.env.TEACHER_EMAIL!, password: process.env.TEACHER_PASSWORD!, expectedItems: ['المواد الدراسية', 'الاختبارات'],       forbidden: ['المستخدمون', 'النسخ الاحتياطي والاستعادة'] },
  { name: 'student', email: process.env.STUDENT_EMAIL!, password: process.env.STUDENT_PASSWORD!, expectedItems: ['المواد الدراسية'],                     forbidden: ['المستخدمون', 'البنوك'] },
  { name: 'parent',  email: process.env.PARENT_EMAIL!,  password: process.env.PARENT_PASSWORD!,  expectedItems: ['المدفوعات'],                           forbidden: ['البنوك'] },
];

for (const role of roles) {
  test(`${role.name} lands on /ar/dashboard with correct sidebar`, async ({ page }) => {
    await page.goto(`${BASE}/ar/login`);
    await page.getByLabel('البريد الإلكتروني').fill(role.email);
    await page.getByLabel('كلمة المرور').fill(role.password);
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();

    await expect(page).toHaveURL(/\/ar\/dashboard$/);

    for (const item of role.expectedItems) {
      await expect(page.getByRole('link', { name: item })).toBeVisible();
    }
    for (const item of role.forbidden ?? []) {
      await expect(page.getByRole('link', { name: item })).toHaveCount(0);
    }
  });

  test(`${role.name} gets AccessDenied on a forbidden page`, async ({ page }) => {
    if (role.name === 'admin') return;
    await page.goto(`${BASE}/ar/login`);
    await page.getByLabel('البريد الإلكتروني').fill(role.email);
    await page.getByLabel('كلمة المرور').fill(role.password);
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();

    await page.goto(`${BASE}/ar/dashboard/users`);
    await expect(page.getByText('ليس لديك صلاحية')).toBeVisible();
  });
}

test('legacy /student/home redirects to /dashboard', async ({ page }) => {
  const response = await page.goto(`${BASE}/ar/student/home`);
  expect(page.url()).toMatch(/\/ar\/dashboard$/);
  expect(response?.status()).toBeLessThan(400);
});

test('legacy /teacher/courses redirects to /dashboard/courses', async ({ page }) => {
  await page.goto(`${BASE}/en/teacher/courses`);
  expect(page.url()).toMatch(/\/en\/dashboard\/courses$/);
});
```

- [ ] **Step 2: Run tests**

Run: `npx playwright test tests/unified-dashboard.spec.ts`
Expected: PASS on all role scenarios and redirects (assuming test credentials are provisioned in `.env.test`).

- [ ] **Step 3: Commit**

```bash
git add tests/unified-dashboard.spec.ts
git commit -m "test(dashboard): per-role access, sidebar filtering, and legacy redirect coverage"
```

---

## Final verification

- [ ] `npx jest` — unit tests pass
- [ ] `npm run lint` — no new errors
- [ ] `npm run build` — production build succeeds
- [ ] `npx playwright test tests/unified-dashboard.spec.ts tests/dashboard-parity.spec.ts` — both pass
- [ ] Manual check: log in as each role, confirm sidebar + home render correctly, confirm legacy URLs redirect.

---

## Self-review notes

- **Spec coverage:** Tasks 1–2 = Phase 0 (permission module, gate helper). Tasks 3–6 = Phase 1 (layout, sidebar, page gate, role home). Task 7 = Phase 2 (login unification). Task 8 = Phase 3 (middleware). Tasks 9–11 = Phase 4 (legacy deletion). Task 12 = testing.
- **Type consistency:** `DashboardRole` in `dashboard-permissions.ts` matches `DashRole` used in `ReferenceDashboardShell.tsx`. Both include `'supervisor'`.
- **No placeholders:** Every code step contains runnable code. Credentials for the Playwright test are environment-driven.
- **Sidebar already filters by role** — Task 4 hardens the role source and ensures `filterGroupsByRole` is actually invoked; it does not re-invent the filter.
