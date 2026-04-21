# EMan School — Roles & Authentication QA Report

**Date:** 2026-04-19
**Target:** `localhost:3000` (dev), Supabase project `cxphxyblhvrupnmcmtoy`
**Scope:** All 5 defined roles (admin, teacher, student, parent, supervisor) — authentication, dashboard access, permission gating, unified-portal refactor.

---

## A. Stack Detection

| Layer | Tech |
|---|---|
| Framework | **Next.js 14.2.35** (App Router, TypeScript 5, React 18.3.1) |
| Auth | **NextAuth v4.24.13** — `CredentialsProvider` (bcryptjs cost 10) + Google OAuth. JWT sessions (30-day). Login via email or phone + country code. |
| Database | **Supabase PostgreSQL 15** (project `cxphxyblhvrupnmcmtoy`) — `users` table w/ `password_hash`, `role` enum, `is_active`, `phone` |
| UI | TailwindCSS v4, shadcn/ui (Radix), next-intl v4.7, lucide-react, Recharts |
| Mobile | Capacitor 8, Android bundle `com.emanISchool.app` |
| Testing | Playwright 1.58.2 (configured at `playwright.config.ts`) |
| Hosting | Dev on `localhost:3000` (Next.js `next dev`) |

---

## B. Final Credentials Matrix

| # | Role | Email | Password | Login ✅ | Dashboard URL (post-refactor) |
|---|---|---|---|---|---|
| 1 | admin | `test.admin@emanschool.test` | `EmanAdmin!QA#2026$K9` | ✅ verified live via MCP | `/en/dashboard` |
| 2 | teacher | `test.teacher@emanschool.test` | `EmanTeach!QA#2026$L3` | ✅ verified live via MCP | `/en/dashboard` |
| 3 | student | `test.student@emanschool.test` | `EmanStud!QA#2026$M7` | ✅ verified live via MCP | `/en/dashboard` |
| 4 | parent | `test.parent@emanschool.test` | `EmanPar!QA#2026$N1` | ✅ created + session valid; pending live nav screenshot | `/en/dashboard` |
| 5 | supervisor | `test.supervisor@emanschool.test` | `EmanSup!QA#2026$P5` | ✅ created; pending live nav screenshot | `/en/dashboard` |

All users created via `POST /api/claude-test-bootstrap` (service-role-key path, bcrypt cost 10, UPSERT on email).

Phone format: `+971500000001…5` (UAE test numbers). Usable via phone-login tab after country selector set to 🇦🇪 +971.

---

## C. Architecture Refactor — Unified Dashboard

**Before:** `routeByRole` sent each role to a separate portal tree: `/dashboard` (admin), `/teacher/home`, `/student/home`, `/parent/home`; supervisor had no dedicated home.

**After:** All five roles land on the shared `/{locale}/dashboard`. The **sidebar** is filtered by role via `filterGroupsByRole()` / `filterItemsByRole()`. Role-specific home body is switched inside the shell (`TeacherHome`, `StudentHome`, `ParentHome`, or `ReferenceDashboardOverview` for admin/supervisor).

### Role → Nav Permissions Matrix

| Group / Item | admin | teacher | student | parent | supervisor |
|---|---|---|---|---|---|
| **Overview** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Academic** — Courses | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Academic** — Categories | ✅ | — | — | — | ✅ |
| **Academic** — Bundles | ✅ | ✅ | — | — | ✅ |
| **Academic** — Exams / Quizzes | ✅ | ✅ | ✅ | — | ✅ |
| **Management** — Users | ✅ | — | — | — | — |
| **Management** — Applications | ✅ | — | — | ✅ | ✅ |
| **Management** — Lookups | ✅ | — | — | — | — |
| **Finance** — Payments | ✅ | — | — | ✅ | — |
| **Finance** — Salaries/Payslips | ✅ | ✅ | — | — | — |
| **Finance** — Banks / Currencies / Expenses / Coupons | ✅ | — | — | — | — |
| **Communication** — Announcements / Messages | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Content** (CMS/Blogs/Translations) | ✅ | — | — | — | — |
| **Analytics** — Reports | ✅ | ✅ | — | — | ✅ |
| **Data management** — Backup | ✅ | — | — | — | — |
| **Footer** — Settings | ✅ | — | — | — | — |
| **Footer** — Profile | ✅ | ✅ | ✅ | ✅ | ✅ |

Defined in `src/components/dashboard/ReferenceDashboardShell.tsx:55-157`. Edit `roles: [...]` on any item/group to change permissions.

### Key files changed

| File | Change |
|---|---|
| `src/components/auth/ReferenceAuthCard.tsx:137` | `routeByRole` returns `/dashboard` for all roles. |
| `src/app/[locale]/dashboard/layout.tsx` | Removed per-role redirects to `/teacher/home` / `/student/home` / `/parent/home`. Only unauth still redirects to `/login`. |
| `src/app/[locale]/dashboard/page.tsx` | Unchanged redirect policy, now hands body off to `TeacherHome` / `StudentHome` / `ParentHome` / `ReferenceDashboardOverview` based on role (admin+supervisor get the full overview). |
| `src/components/dashboard/ReferenceDashboardShell.tsx` | New `DashRole` type, per-item/group `roles: DashRole[]` field, `filterGroupsByRole` / `filterItemsByRole` helpers, sidebar rendered from `visibleGroups` and `visibleFooterItems`. |
| `src/components/dashboard/home/{Teacher,Student,Parent}Home.tsx` | Role-specific overview widgets rendered inside the shared shell. |
| `src/app/[locale]/dashboard/users/page.tsx` | Added `supervisor` to `UserRole` union, `roleOptions`, `roleTone`, `roleLabel`, `roleFilterLabel`, and the Create/Edit role-select `<option>`s. |
| `src/lib/auth.ts:297` | `authOptions.pages.signIn` now points at `/en/login` (was non-existent `/auth/signin`). |

---

## D. Issues & Fixes

### 🔴 Critical — Security

| # | Issue | Fix |
|---|---|---|
| 1 | `GET /api/debug-login` returned all users (email, phone, role, password-hash metadata) to **unauthenticated** callers | Route body replaced with a stub returning **HTTP 410 Gone**. File: `src/app/api/debug-login/route.ts`. You should fully delete the directory in a follow-up commit. |
| 2 | `GET /api/debug-reset-password?email=&password=` allowed **unauthenticated** password reset of any user | Route body replaced with a stub returning **HTTP 410 Gone**. File: `src/app/api/debug-reset-password/route.ts`. Delete the directory in a follow-up commit. |
| 3 | `scripts/seed-database.mjs:9` embeds the Supabase **service-role key** in committed source | ⚠️ **Not auto-fixed.** Move to env (`process.env.SUPABASE_SERVICE_ROLE_KEY`) and rotate the key in Supabase. Key is also embedded in git history. |
| 4 | `/api/claude-test-bootstrap` with default token `claude-eman-bootstrap-2026` lets anyone who reads the source upsert test users & passwords | Remove the directory before production. Useful for QA; dangerous if deployed. |

### 🟠 High — Data integrity

| # | Issue | Fix |
|---|---|---|
| 5 | Live DB `user_role` enum was missing `parent` and `supervisor` — migrations `001_add_parent_role_and_relationships.sql` and `20260306_lms_hierarchy_full.sql` had never been applied. `INSERT` with those roles failed with `invalid input value for enum user_role` | ✅ You ran `ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'parent'` + `'supervisor'` in Supabase SQL editor. Bootstrap now succeeds for all 5 roles. |
| 6 | RLS policy on `public.users` has infinite recursion — any anon/publishable-key `SELECT` returns `500 42P17: infinite recursion detected in policy for relation "users"` | ⚠️ **Not fixed** (needs DDL access). Service-role key path works fine and is what the app uses; publishable-key reads are broken until the recursive policy is rewritten. Recommend auditing `pg_policies` for `users` and removing the self-referencing rule. |

### 🟡 Medium — Architecture / UX

| # | Issue | Fix |
|---|---|---|
| 7 | Each role used a separate portal (`/teacher/home`, `/student/home`, `/parent/home`) rather than the shared `/dashboard` | ✅ `routeByRole` and dashboard layout/page refactored. All roles now land on `/{locale}/dashboard` with role-filtered sidebar. |
| 8 | `dashboard/users/page.tsx` role filter + Create/Edit form omitted `supervisor`, despite it being a first-class DB role | ✅ Added `supervisor` to `UserRole` union (line 12), `roleOptions` (line 37), all three label helpers, and the `<option value="supervisor">` in both add- and edit-user modals. |
| 9 | `teacher/layout.tsx` rendered a "Access denied" card inside `ReferenceTeacherShell` for non-teachers, leaking teacher sidebar + "TEACHER" role badge. Inconsistent with `parent/layout.tsx` (redirect) and `dashboard/layout.tsx` (redirect). | ✅ Obsoleted by unified-dashboard refactor — non-admin non-teacher users no longer route through `/teacher/*`. Old layout left intact as a defensive fallback. |
| 10 | `authOptions.pages.signIn` pointed to `/auth/signin` — a 404 | ✅ Changed to `/en/login`. File `src/lib/auth.ts:297`. |

### 🔵 Low / Informational

| # | Issue | Note |
|---|---|---|
| 11 | `NEXTAUTH_URL` hardcoded to `http://localhost:3000`, so signout `callbackUrl` bounces to that port regardless of which dev-server port the user runs (`npm run dev` picks next free port) | Not a bug per se. Set to deployment URL in production. |
| 12 | Dev server (PID 44778) we found at the start of the session was running under a sandboxed shell and could not reach Supabase (`TypeError: fetch failed`). Fixed by restarting in user-owned shell. | Make sure dev servers are started from the user's normal terminal, not via any automation under a sandbox profile. |
| 13 | `scripts/_claude-inventory-roles.mjs`, `scripts/_claude-ping.mjs` — left over from debugging | Safe to delete. |

---

## E. Test Artifacts

### Reusable regression suite

`tests/e2e/roles-login.spec.ts` — data-driven Playwright spec. For each of 5 roles:
1. Calls `/api/claude-test-bootstrap` to ensure users exist (idempotent UPSERT)
2. Opens **isolated browser context** (`browser.newContext()`)
3. Navigates `/{locale}/login`, switches to email mode, submits
4. Asserts redirect to `/{locale}/dashboard` (unified)
5. Asserts `session.user.role` matches the expected role
6. Asserts `next-auth.session-token` cookie is present + httpOnly
7. Asserts sidebar nav contains the role-allowed groups and excludes the forbidden ones
8. Screenshots `test-results/dashboards/<role>-en.png`
9. Reloads and asserts URL + role persist
10. Probes `/api/admin/users` — expects 200 for admin, 401/403 otherwise
11. Probes `/api/debug-login` and `/api/debug-reset-password` — expects HTTP 410 (verifies security patch)
12. Signs out and asserts session cookie is cleared

Run with:
```
npm run dev    # if not already running
BASE_URL=http://localhost:3000 npx playwright test tests/e2e/roles-login.spec.ts --reporter=list
```

Mobile viewport smoke test included (375×667) on the teacher flow.

### Screenshots captured in this session

- `test-results/dashboards/admin-en.png` — full admin dashboard with role-filtered sidebar ✅
- `test-results/dashboards/teacher-en.png` — teacher post-refactor landing in shared dashboard ✅
- `test-results/dashboards/student-en.png` — student post-refactor landing in shared dashboard ✅
- `test-results/dashboards/parent-en.png` — parent (pre-refactor / old portal) + one post-refactor error frame while HMR settled; regenerate via `npx playwright test` after a fresh `npm run dev`
- `test-results/reference/` — futurelab.school dashboard was server-erroring during the session (`500 /api/dashboard`, `INSUFFICIENT_PATH`), so no reference shot was captured

---

## F. Follow-ups Recommended

1. **Delete** the `src/app/api/debug-login/`, `src/app/api/debug-reset-password/`, and `src/app/api/claude-test-bootstrap/` directories entirely (stubs are safe but clutter).
2. **Rotate** the Supabase service-role key + move out of committed `seed-database.mjs` → env var.
3. **Rewrite** the recursive RLS policy on `public.users` (see issue #6). Verify with `SELECT * FROM public.users LIMIT 1` using the anon key.
4. **Apply all pending migrations** on the live project — the parent/supervisor enum drift suggests other migrations may also be un-applied. Run a `supabase migration list` vs. applied state.
5. **Remove** the legacy `/teacher/home`, `/student/home`, `/parent/home` directories once you've confirmed no external deep-links target them (the unified dashboard has replaced them as entry points).
6. **Wire** the Playwright suite into CI so it runs on every PR.

---

## G. Summary (plain English)

All five role test accounts exist with strong, documented passwords. Admin, teacher, and student logins were verified end-to-end with a real browser; parent and supervisor users were created successfully after you ran the enum fix — their live-browser verification needs a fresh dev-server start (the HMR got stuck during the refactor) and the Playwright suite is the recommended way to confirm.

The main architectural change is that every role now lands on the same `/dashboard` URL and sees a sidebar filtered to only the pages they are allowed to use. This replaces the previous setup of four separate portal trees, and mirrors the reference site's pattern.

The two unauthenticated debug endpoints (`/api/debug-login`, `/api/debug-reset-password`) that would have been a serious production security incident have been neutralized. Service-role-key exposure in `seed-database.mjs` and the users-table RLS recursion bug are flagged as open follow-ups that I could not auto-fix.
