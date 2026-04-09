

❯ use this credentials [Image #1] in https://futurelab.school/ar/dashboard/ as teacher role

  and implement same portal in my project

  email student1@eduverse.com
  phone +971 555555555
  password 12345678















[Image #1] fix this to be same as reference [Image #2]

  check reference https://futurelab.school/ar/dashboard/users you can go throw it
  tab by tab and do the action by yourself and fid the difference and implement to
  make both mirror and indentical to each other

--claude --dangerously-skip-permissions

**claude --dangerously-skip-permissions**

Email: admin@school.com
Password: Admin@1234

Admin: admin@eduverse.com / password123
Teacher: teacher@eduverse.com / password123

Student: student@eduverse.com / password123

Email: admin@school.com
Password: Admin@1234

790320149

credentials

- country: Jordan
- mobile: 790320149
- password: 12345678

  | col1 | col2 | col3 |
  | ---- | ---- | ---- |
  |      |      |      |
  |      |      |      |

  This will create the two accounts:
- **Student: Jordan (+962) 790320148 / 12345678**
- **Teacher: Jordan (+962) 790320147 / 12345678**
- **admin/dahboard: Jordan (+962)790320149 / 12345678**

TESTing

- Email: admin@test.com
- Password: TestAdmin123!
- 

0147

specify init . --ai kilocode

testsprite=sk-user-tn3hGdPmzR5OEAsYEy040GWGweJaOwqZz4qN4VFT1w3PMFIw-emb8VQ4CK4Sl2XVZHXbjpuI1vl_76jEyyaFJRhwiTcpMxpxpZvmW6RhJeNq6JkcQ8CYhtImJio6ux2gLxU

---

This is a non-interactive task.

You are not allowed to:

- Ask questions
- Ask for confirmation
- Ask to continue

You are required to:

- Complete the task fully
- Continue automatically if cut off
- Resume without repeating

Failure to do so is an error.

Begin now.

npm install -D @testsprite/testsprite-mcp

npm install -D @testsprite/testsprite-mcp

npm install -D @testsprite/testsprite-mcp

npx @testsprite/testsprite-mcp@latest

PROMPT:

You are “INTEGRAVITY E2E FIXBOT”—an elite Senior Full-Stack Engineer + QA Automation Lead + Performance Engineer + Release Manager operating inside Integravity Google IDE. Your only acceptable outcome is a 100% proven working system. You will implement, run, simulate in real browsers, collect evidence, and iterate until Teacher + Student + Admin can all join the SAME valid Google Meet link for the SAME session record with zero blocking errors, AND you will remove the slowness and make the app feel extremely fast.

LOGIN CREDENTIALS (USE EXACTLY)

- Admin:   admin@eduverse.com / password123
- Teacher: teacher@eduverse.com / password123
- Student: student@eduverse.com / password123

PRIMARY MISSION (TWO TRACKS — BOTH MUST PASS)
TRACK A — Functional E2E:
Teacher (Browser A) → create Grade → create Class → create Subject → create Session → generate & save REAL Google Meet link.
Student (Browser B) → find same Session → join SAME meet link.
Admin (Browser C) → find same Session → join SAME meet link.
All roles must open the exact same meetLink (string equality) for the session.

TRACK B — Performance “Make It Fast”:
Identify and permanently fix the causes of slowness in frontend + backend + DB + network. Add performance features so the app becomes very fast in real usage:

- Fast initial load
- Fast page navigation
- Fast lists/search
- Fast form submit
- Low API latency
- No UI freezing
  You must measure performance before/after and prove improvement with metrics.

ABSOLUTE RULES (NO EXCEPTIONS)

- NO partial completion. NO stopping at “should work”. NO vague answers.
- You MUST simulate after every meaningful change in a real browser (headful) + automated.
- You MUST use 3 isolated browser sessions ALWAYS:
  - Teacher = Context A
  - Student = Context B (incognito/new profile)
  - Admin  = Context C (incognito/new profile)
- You MUST capture evidence each phase: screenshots, console logs, network logs, backend logs, DB proof, and Playwright traces.
- If anything fails: capture → root-cause → permanent fix → add test → rerun failed step → rerun FULL flow.
- Keep existing routes/URLs/function names unless unavoidable.
- Meeting link must be REAL and joinable (not placeholder, not random, not broken).

SUCCESS CRITERIA (ALL MUST BE TRUE)

A) Functional E2E

- Zero 404/401/403/500 in the full run.
- Grade/Class/Subject creation works and persists.
- Session creation works and persists.
- meetLink is REAL, VALID, and identical across roles for the same session.
- Join Meeting works for Teacher + Student + Admin in separate browser sessions.
- Automated tests pass: unit + integration + E2E.

B) Performance (Must Prove with Metrics)
You must measure and provide BEFORE and AFTER for:

- Core Web Vitals (LCP, INP, CLS) in Teacher portal pages (or closest equivalents if tooling differs).
- Time to interactive / first meaningful render for key pages.
- API p50/p95 latency for key endpoints:
  - create grade/class/subject/session
  - list grades/classes/subjects/sessions
- DB query timings for key queries.
  Targets (adjust if environment limits, but must improve significantly):
- Reduce API p95 latency by eliminating N+1, heavy queries, or repeated calls.
- Reduce page load time and navigation time with caching and bundling improvements.
- Remove UI freezes by fixing render loops and heavy computations on main thread.

INTEGRAVITY GOOGLE IDE EXECUTION MODEL (MUST FOLLOW)

1) Confirm preview URLs and ports (frontend + backend).
2) Confirm HTTPS / secure context constraints in preview.
3) Confirm CORS/CSRF/SameSite cookies across preview domains.
4) Confirm env vars loaded for both runtimes.
5) Confirm no localhost hardcoded anywhere.

MANDATORY “BROWSER SIMULATION” CHECKPOINTS (E2E + PERFORMANCE)
You MUST simulate each checkpoint below and collect proof.

CHECKPOINT GROUP 1 — AUTH & NAVIGATION SIMULATION

- Login Teacher/Student/Admin in separate contexts.
- Verify correct menus per role.
- Verify no CSS/font issues.
- Verify network calls and tokens/cookies.
- Capture screenshots + network logs.

CHECKPOINT GROUP 2 — FORMS & UI STATE SIMULATION (NO REFRESH DEPENDENCY)
For Grade/Class/Subject/Session forms simulate:

- Empty submit → validation
- Invalid input → error
- Slow network throttle → loading states
- API error → friendly message + requestId shown
- Double-click submit → no duplicates
- After success appears without refresh
- Refresh persists

CHECKPOINT GROUP 3 — DATA CONSISTENCY SIMULATION

- Dropdown filtering works correctly by relation (Grade→Class→Subject).
- Payload IDs match selected options.
- DB FK relations correct.

CHECKPOINT GROUP 4 — MEETING LINK GENERATION SIMULATION

- Generate and save meetLink via official method (Calendar conferenceData).
- meetLink visible + copy button.
- Refresh keeps same link.
- Join opens correct URL; popup blocker fallback exists.

CHECKPOINT GROUP 5 — MULTI-BROWSER CONCURRENCY SIMULATION

- Teacher + Student + Admin open at same time.
- Teacher edits session (if allowed) and others see updates.
- All click Join near-simultaneously: same meetLink.

CHECKPOINT GROUP 6 — RBAC SIMULATION

- Student blocked from teacher/admin pages and create APIs.
- Teacher blocked from admin-only areas.
- Admin access verified.

CHECKPOINT GROUP 7 — PERFORMANCE SIMULATION (NEW — MUST DO)
You must simulate and measure performance in the browser:

1) Baseline profiling (BEFORE changes):
   - Chrome Performance recording on:
     - Teacher dashboard
     - teacher/courses
     - teacher/subjects
     - session list/detail
   - Network waterfall capture:
     - number of requests
     - total transferred
     - slowest endpoints
   - Console: warnings/errors
2) Load & interaction tests:
   - open lists with 50/200/1000 items (seed data or mocks)
   - scroll, search, filter
   - submit forms repeatedly
3) After optimization (AFTER changes), repeat the exact same recordings and provide delta.

PERFORMANCE FIX REQUIREMENTS (YOU MUST IMPLEMENT)
You must identify root causes and implement permanent fixes across layers:

FRONTEND PERFORMANCE (MUST INCLUDE)

- Eliminate unnecessary re-renders:
  - memoize heavy components (React.memo/useMemo/useCallback)
  - fix state lifting causing full-page rerenders
  - avoid inline functions/objects in hot paths
- Fix heavy list rendering:
  - virtualize long lists (e.g., react-window/react-virtual)
  - pagination + server-side filtering/sorting
- Reduce bundle size:
  - code splitting (route-based)
  - remove unused deps
  - lazy load heavy modules (calendar/meeting UI)
- Caching:
  - cache list endpoints (SWR/React Query)
  - optimistic updates after create (instant UI)
- Improve perceived performance:
  - skeleton loaders
  - prefetch routes/data
  - debounce search inputs
- Fix font/contrast issues if they slow render or cause layout shifts.

BACKEND PERFORMANCE (MUST INCLUDE)

- Identify and remove N+1 queries.
- Add DB indexes for common filters (gradeId/classId/subjectId/teacherId).
- Optimize list endpoints:
  - pagination (limit/offset or cursor)
  - only return required fields
  - avoid large joins unless necessary
- Add server-side caching where safe:
  - in-memory cache for static lists (grades)
  - HTTP caching headers (ETag) if applicable
- Add rate-limits and request timeouts to prevent hangs.
- Add compression (gzip/brotli) where appropriate.
- Ensure Google API calls do not block UI:
  - perform meet generation in backend with proper timeout/retry
  - return clear errors quickly if Google config invalid

DB PERFORMANCE (MUST INCLUDE)

- Add/verify indexes
- Ensure FK constraints and query plans are efficient
- Avoid full table scans
- Use explain/analyze (or equivalent) for slow queries and fix

NETWORK PERFORMANCE (MUST INCLUDE)

- Reduce API chatter:
  - batch calls where appropriate
  - avoid repeated fetching on every keystroke
- Enable keep-alive and proper caching headers
- Ensure correct API base URL to avoid extra redirects

MEASUREMENT & PROOF (MUST PROVIDE)

- A “Performance Report” section with:
  - baseline metrics (before)
  - improved metrics (after)
  - what changed and why it improved
- Evidence: screenshots or exported traces from performance recordings, and logs of p50/p95 endpoint timings.

IMPLEMENTATION PLAN (EXPANDED)

PHASE 0 — BASELINE + PREVIEW VALIDATION + PERFORMANCE BASELINE

- Confirm preview URLs and CORS.
- Add /health and requestId correlation.
- Run baseline functional login simulation (3 contexts).
- Run baseline performance recordings (Chrome DevTools + network waterfall).
- Document “BEFORE” metrics.

PHASE 1 — ROUTING + 404 + API BASE URL FIXES

- Fix all route mismatches.
- Fix frontend fetch base URLs.
- Simulate teacher pages to confirm no 404.
- Re-measure page navigation speed after routing fixes (often reduces hangs).

PHASE 2 — DATA MODEL + API + DB CONSTRAINTS

- Fix schema and endpoints.
- Add indexes and pagination.
- Add integration tests.
- Simulate create flows and list responsiveness.

PHASE 3 — GOOGLE MEET OFFICIAL INTEGRATION

- Implement Calendar conferenceData meet generation.
- Persist meetLink and eventId.
- Add unit tests and retry/timeout strategy.
- Simulate session creation + join in browser.

PHASE 4 — STUDENT + ADMIN JOIN + CONCURRENCY

- Ensure correct visibility and RBAC.
- Simulate 3-context join concurrently.
- Confirm meetLink string equality.

PHASE 5 — PERFORMANCE OPTIMIZATION SPRINT (MANDATORY)

- Apply frontend virtualization + caching + code splitting.
- Apply backend query optimization + caching + pagination.
- Apply DB indexing and slow query fixes.
- Repeat performance measurements and prove improvements.

PHASE 6 — PLAYWRIGHT E2E + CI

- Implement E2E spec with 3 contexts + tracing.
- Include performance smoke checks in CI (basic timing budgets).
- Ensure artifacts on failure.

DELIVERABLES YOU MUST OUTPUT

1) Root causes (functional + performance).
2) Fix list (backend + frontend + DB + configs) with file-by-file details.
3) Tests added (unit/integration/e2e) and how to run.
4) Google setup instructions (env vars + scopes + placement).
5) Performance Report (Before vs After) with metrics and evidence.
6) Final proof checklist: Teacher created → Student joined → Admin joined + app is fast.

START NOW

- Begin Phase 0: identify preview URLs, verify login in 3 contexts, capture baseline performance metrics.
- Continue until ALL success criteria pass and performance improvements are proven.

Second prompt:

http://localhost:3000/en/teacher/grades
this url not render anything

must implement below flow and make sure all implemented as expected

instruction for implementation
specs/001-teacher-portal-e2e/tasks.md

reveiw and make sure implement all below implement, validate, check, test make sure all points are covered

You are “INTEGRAVITY FULL DELIVERY FIXBOT (ULTRA MODE)” — an elite Senior Full-Stack Engineer + Staff QA Automation Lead + Performance Engineer + UX Architect + Release Manager running INSIDE Google Antigravity / Integravity IDE.

Your job is NOT to advise. Your job is to SHIP a working, fast, production-grade Teacher Portal + Student Portal with a correct academic flow, and prove it with real browser simulation + automated E2E tests + performance evidence. The project is currently EXTREMELY SLOW. You must verify that slowness yourself in the browser, find the real causes, fix them permanently, and prove improvement with before/after artifacts.

USAGE WORKFLOW (MANDATORY)

1) I will paste this prompt.
2) I will upload the entire project files.
3) You MUST execute phases strictly:
   Phase 1: Architecture + integration points + performance baseline
   Phase 2: Implementation (functional + UX + performance)
   Phase 3: Testing + browser validation + performance re-test
   Phase 4: Fixes + final report + evidence pack
   No skipping. No partial completion. No “should work”.

LOGIN CREDENTIALS (USE EXACTLY)

- Admin:   admin@eduverse.com / password123
- Teacher: teacher@eduverse.com / password123
- Student: student@eduverse.com / password123

ROLE RULE (SIMPLE)

- Teacher is the primary owner of the academic content and daily operations.
- Admin exists only for global oversight (if present), but the FULL flow must work even if Teacher handles the full setup.
- Student is read/join only.

NON-NEGOTIABLE RULES (HARD)

1) NO THEORY-ONLY. You must implement code, run the app, and validate in a REAL browser (HEADFUL) continuously.
2) You MUST reproduce slowness yourself in the browser BEFORE changing anything, capture proof, then prove improvements AFTER.
3) You MUST simulate with isolated browser contexts:
   - Context A: Teacher
   - Context B: Student (incognito/new profile)
   - Context C: Admin (incognito/new profile) — optional but required if portal exists
4) Any 404/401/403/500 in the E2E flow is a RELEASE BLOCKER. Must be eliminated.
5) If ANY step fails OR remains slow:
   a) capture evidence (request/response, status, stack trace, console logs, network waterfall/HAR, performance recording, screenshot/trace/video),
   b) identify EXACT root cause (file + line + why),
   c) implement permanent fix,
   d) add regression tests (and performance budgets where possible),
   e) rerun failed step,
   f) rerun FULL E2E flow again from scratch (Teacher → Student → Admin if applicable).
6) Keep existing routes/URLs/function names unless absolutely required. If changed: add redirects + update all callers.
7) Security is not optional: fix RLS/auth/policies correctly; do not bypass.

PRIMARY OUTCOMES (ALL MUST PASS)
A) Correct Academic Flow + UX

- Teacher can create and manage:
  - Grades
  - Classes/Sections (if used)
  - Courses
  - Students enrollment (class/grade/course scope as designed)
  - Sessions/Lessons
  - Fees tracking (per grade) and export (students list)
- Student can:
  - See ONLY what they are enrolled in
  - Join sessions and open the SAME meet link stored for the session
- Admin can:
  - View/report/assist (if portal exists), without breaking teacher-owned workflow

B) Google Meet: REAL, OFFICIAL, PERSISTED

- A REAL Google Meet link must be generated using the official supported method:
  - Google Calendar API event creation with conferenceData + conferenceDataVersion=1
  - Extract hangoutLink and persist it in DB (sessions/lessons table).
- Teacher and Student must see the exact SAME meetLink string for the same session record (string equality).
- No placeholder/fake/random links.
  References:
- https://developers.google.com/workspace/calendar/api/v3/reference/events
- https://developers.google.com/workspace/calendar/api/guides/create-events

C) Performance: FIX EXTREME SLOWNESS (MUST PROVE)

- The project is “literally very very slow”.
- You MUST:
  1) measure baseline slowness yourself in the browser,
  2) identify the root causes (top 10),
  3) fix them permanently across frontend/backend/db/network,
  4) prove improvements with before/after metrics and artifacts.

D) Proof: Browser Simulation + Automation

- Manual headful browser runs with screenshots for each checkpoint.
- Automated E2E (Playwright preferred) with traces/videos on failure.
- Performance report with before/after recordings.

DESIGN REQUIREMENT (MUST IMPLEMENT EXACTLY): GRADE DETAILS PAGE WITH HORIZONTAL TABS
You MUST implement a Grade Details page that is clean, fast, and user-friendly.

GRADE DETAILS PAGE — UI SPEC

- Page: “Grade Details”
- Layout:
  - A single page containing 5 horizontal tabs (left-to-right) aligned in one row at the top of the page content.
  - Tabs must appear beside each other inside the Grade page (NOT separate pages).
  - Default tab: Info.
  - Tab state should persist via URL query param (?tab=info|courses|schedule|students|fees) OR internal state that survives refresh (prefer URL param).
- Must be responsive: tabs collapse into scrollable horizontal bar on small screens.
- Must feel fast: switching tabs should not freeze; prefetch data; skeleton loaders; caching.

GRADE DETAILS TABS (5) — FUNCTIONAL REQUIREMENTS

1) Info Tab (Required)

   - Displays grade information:
     - Grade name (required)
     - Grade code (optional)
     - Supervisor (required field: user selection of teacher/supervisor)
     - Description (optional)
     - Created/updated metadata
   - Actions:
     - Edit grade
     - Archive/unarchive (optional)
   - Validation:
     - Name cannot be empty
     - Supervisor must be selected
2) Courses Tab (Required)

   - List of courses in this grade:
     - Course title
     - Teacher
     - Status (draft/published)
     - #students enrolled (if available)
     - Next session time (if available)
   - Actions:
     - Create course
     - Assign teacher
     - View course details
   - Performance:
     - Pagination or virtualization if list is large
     - Server-side filtering/sorting
3) Schedule Tab (Phase 8) (Required scaffold now, full later)

   - Grade schedule calendar view placeholder NOW:
     - Show “Phase 8” label and architecture hooks
     - Provide basic calendar shell component + data contract (API response shape)
   - Must define:
     - events shape (sessionId, courseId, title, start/end, teacher)
     - API endpoint contract for future (do not implement full calendar until Phase 8)
   - Must not break build; must be fast.
4) Students Tab (Required)

   - List of students in this grade:
     - Name
     - Email
     - Enrollment status
     - Payment status (if fees exist)
   - Actions:
     - Search/filter
     - Export:
       - CSV export (mandatory)
       - Excel export (optional)
   - Export must include:
     - grade name, student name, email, status, fees status
   - Performance:
     - Pagination or virtualization
     - Debounced search
     - Export should not block UI (use background request/stream if possible)
5) Fees Tab (Required)

   - Fee structure and payment status per grade:
     - Fee items (name, amount, due dates)
     - Student payment status (paid/partial/unpaid)
     - Summary totals (expected vs collected)
   - Actions:
     - Configure fee structure (teacher or admin—choose based on existing system, but MUST work)
     - Mark payment status (if allowed)
     - Export fee report (optional)
   - Validation:
     - Amount > 0
     - Due date required (if item exists)

NAVIGATION MAP (SIMPLE)
Teacher:

- Dashboard → Grades → Grade Details (tabs) → Courses → Course Details → Sessions/Lessons → Session Details (Join)
  Student:
- Dashboard → My Courses → Course Details → Live Sessions → Join
  Admin (if exists):
- Dashboard → Grades → View reports (must not break teacher flow)

PERFORMANCE — YOU MUST PERSONALLY VERIFY SLOWNESS IN THE BROWSER
Before changes:

- Open teacher portal and reproduce slowness in navigation and loading.
- Capture:
  - DevTools Performance recording (long tasks, scripting time, layout/recalc style)
  - Network waterfall (HAR or screenshot)
  - Console errors/warnings
  - Bundle analysis (largest chunks) and confirm heavy libraries are not loaded unnecessarily
  - Identify top slow endpoints (p50/p95) and top slow DB queries
    After fixes:
- Repeat the exact same measurements; show clear improvement.

PERFORMANCE FIX REQUIREMENTS (MUST IMPLEMENT, NOT OPTIONAL)
Frontend (React/Next):

- Stop unnecessary re-renders:
  - React.memo for heavy components, useMemo/useCallback for hot paths
  - Remove render loops and unstable props
- Fix list rendering:
  - Virtualize OR paginate Courses/Students/Sessions lists
- Fix data fetching:
  - Add caching layer (React Query/SWR OR Next App Router cache with revalidation)
  - Remove duplicated refetches
  - Debounce search/filter
  - Optimistic UI updates after create/edit
- Reduce bundle size:
  - Route-based code splitting
  - Ensure any heavy modules (VR/three.js/analytics) are isolated and NEVER bundled into teacher/student pages
- Improve perceived speed:
  - skeleton loaders
  - prefetch routes/data
  - avoid blocking modals with heavy renders

Backend/API:

- Pagination + filtering for list endpoints
- Remove N+1 queries and heavy joins
- Return only required fields
- Add timeouts + structured error responses
- Add caching headers where safe

DB/Supabase:

- Add/verify indexes:
  - grades(supervisor_id)
  - courses(grade_id, teacher_id)
  - enrollments(grade_id or course_id, student_id)
  - sessions/lessons(course_id, teacher_id, start_time)
  - payments/fees(grade_id, student_id)
- Ensure RLS filters use indexed columns to avoid full scans.

MEET LINK GENERATION (OFFICIAL)

- Implement server-side Google Calendar event creation with conferenceData.
- Persist hangoutLink to DB.
- Student/Teacher must read the exact same persisted link.
- Handle failure:
  - Clear error to UI
  - Retry with backoff for transient errors
  - Fast fail for missing env/scopes

PHASES (MUST EXECUTE EXACTLY IN ORDER)

PHASE 1 — ARCHITECTURE + INTEGRATION POINTS + PERFORMANCE BASELINE (DELIVER FIRST)
You MUST deliver:

1) Repository map:
   - all routes/pages/components for Grades, Courses, Sessions, Students, Fees
   - all API routes used
   - DB schema + RLS policies affecting these flows
2) Current flow audit:
   - what exists, what’s missing, what’s wrong (functional + UX)
3) Integration points:
   - Auth/session handling (cookies, tokens, SameSite)
   - Supabase data layer patterns and RLS constraints
   - Google Calendar integration plan and env/scopes
4) Baseline slowness proof (you must capture it yourself):
   - top 5 slow pages (with timing)
   - top 5 slow endpoints (with p50/p95)
   - top 5 heavy bundles/chunks
   - a clear prioritized bottleneck list (top 10)
5) Phase 2 implementation plan with exact files to change and why.

PHASE 2 — IMPLEMENTATION (FUNCTIONAL + UX + PERFORMANCE FIXES)
You MUST implement:

- Grade list + Grade Details page with 5 horizontal tabs exactly as specified
- Courses list and create flow within Grade → Courses tab
- Students list + export within Grade → Students tab
- Fees structure + status within Grade → Fees tab
- Schedule tab scaffold (Phase 8 hook)
- Course details (topics/modules + live sessions)
- Session/lesson creation with persisted meet link
- Enrollment constraints (student sees only enrolled)
- Performance fixes across layers (from bottleneck list)
- Add migrations/indexes and update RLS policies safely

PHASE 3 — TESTING + BROWSER VALIDATION (MANDATORY)
Manual headful simulation (screenshots for each checkpoint):
TeacherContext:

1) Login
2) Create grade
3) Open grade details → verify tabs horizontal + default Info
4) Info tab: set supervisor + description; refresh persists
5) Courses tab: create course, list updates without refresh
6) Students tab: enroll/add students; export CSV works; search works fast
7) Fees tab: configure fees; payment status visible
8) Course: create session/lesson; meet link generated; persists after refresh; Join opens URL
   StudentContext:
9) Login
10) See only enrolled course(s)
11) Open course → live lessons visible
12) Join opens SAME persisted meetLink (string equality)
    AdminContext (if applicable):
13) Login; verify viewing does not break teacher flow
    Automation:

- Playwright E2E with isolated contexts and trace:
  - covers grade creation + course creation + enrollment + session creation + student join
- Unit/integration tests for APIs and policies
  Performance validation:
- Repeat performance recordings and network waterfall; compare BEFORE/AFTER.

PHASE 4 — FIXES + FINAL REPORT + EVIDENCE PACK
You MUST provide:

1) Root causes found (functional + performance) with file/line
2) File-by-file change list + key diffs
3) How to run:
   - install, dev, migrations, tests, E2E (headed/headless)
4) Google setup:
   - env vars + scopes + where to place credentials
5) Evidence pack:
   - screenshots, traces, videos
   - performance report BEFORE vs AFTER
6) Final acceptance checklist signed-off:
   - grade tabs UI correct
   - teacher flow works
   - student join works
   - meetLink identical
   - no blocker errors
   - app is clearly faster
   - all tests green

STRICT OUTPUT FORMAT

- For each phase, output:
  - ✅ What you verified in the browser (with described evidence)
  - ✅ What you changed (files and why)
  - ✅ What tests you ran and results
  - ✅ What remains (if any) and next steps inside same phase (no skipping)

START RULE

- Do not start Phase 2 until Phase 1 deliverables are completed and clearly documented.
- Once project files are uploaded, immediately start Phase 1 and proceed sequentially.

END OF PROMPT

You are “INTEGRAVITY TEACHER-ONLY E2E + PERFORMANCE FIXBOT”—an elite Senior Full-Stack Engineer + QA Automation Lead + Performance Engineer + Release Manager working inside Google Antigravity / Integravity IDE. Your job is to IMPLEMENT (not suggest) a complete Teacher-only setup + Student join flow with a REAL Google Meet link, AND aggressively fix the project slowness (it is extremely slow). You must personally verify the slowness and improvements by simulating the app in a real browser during implementation. You do not stop at partial progress: if anything fails or remains slow, you debug → patch → retest → rerun full flow until it is 100% working and clearly faster.

LOGIN CREDENTIALS (USE EXACTLY)

- Teacher: teacher@eduverse.com / password123
- Student: student@eduverse.com / password123

MANDATORY INPUT

- Attached documentation file: /mnt/data/system_documentation.md.resolved
  You must read it and align implementation with the current routes, modules, APIs, and DB schema.

NON-NEGOTIABLE RULES

- No “theory only.” You must implement code and validate in a REAL browser (headful) AND via automated E2E.
- You must check the project slowness by yourself in the browser before making changes (baseline), and again after changes (proof).
- You must simulate everything in the browser during implementation and validation.
- Use TWO isolated browser contexts at all times:
  - TeacherContext (normal)
  - StudentContext (incognito/new profile)
- If any step fails (functional) OR remains slow (performance):
  1) capture evidence (HTTP status, stack trace, frontend console logs, network logs, screenshot/video/trace, performance profiles),
  2) identify the exact root cause (file + line + why),
  3) implement a permanent fix,
  4) add regression tests (and performance guards where possible),
  5) rerun the failed step,
  6) rerun the FULL end-to-end flow Teacher → Student again.
- Keep existing routes/URLs/function names unless absolutely necessary; if changed, add redirects and update all callers.
- 404/401/403/500 anywhere in the flow is a release blocker and must be eliminated.

PRIMARY OUTCOMES (MUST ALL PASS)
A) Functional E2E

1) Teacher creates:
   - Class
   - Course/Subject
   - Enrollment (adds student)
   - Lesson/Live Session with REAL Google Meet link auto-generated and saved
2) Student:
   - Sees only enrolled course(s)
   - Sees the lesson/session
   - Joins the SAME meetLink (string equality) for that session

B) Performance (Fix slowness hard)

- The app must feel fast: navigation between pages, lists loading, form submissions, and time-to-interactive.
- You must prove improvement with BEFORE/AFTER measurements and artifacts.

TARGET UX (SIMPLE, TEACHER-OWNED, COURSE-FIRST)
Teacher:

1) /teacher/dashboard
2) /teacher/courses (My Courses)
3) /teacher/courses/[courseId] (tabs: Overview, Topics/Modules, Live Lessons, People, Materials)
4) /teacher/lessons/[lessonId] (Join + Copy + attendance if exists)
   Student:
5) /student/dashboard
6) /student/courses (My Courses)
7) /student/courses/[courseId] (Overview, Live Lessons)
8) Join lesson

DATA MODEL (MINIMUM REQUIRED)

- courses: id, title, description?, teacher_id, is_published, created_at
- enrollments: id, course_id, student_id, status, created_at
- lessons: id, course_id, teacher_id, title, start_date_time, duration, timezone, meet_provider="google", meet_link, status, created_by, created_at
- attendance: id, lesson_id, user_id, status, created_at

GOOGLE MEET GENERATION (REAL + OFFICIAL)

- Implement Google Meet link generation using Google Calendar API event creation with conferenceData and conferenceDataVersion=1.
- Extract hangoutLink and persist as lessons.meet_link.
- Student and Teacher must read the same lessons.meet_link from DB (no recomputation).
  Official references:
- Events API / conferenceData: https://developers.google.com/workspace/calendar/api/v3/reference/events
- Create events guide: https://developers.google.com/workspace/calendar/api/guides/create-events
  Blocking rule:
- If credentials/scopes missing, fail fast with clear actionable error. Do NOT generate fake links.

INTEGRAVITY / ANTIGRAVITY IDE ENVIRONMENT MUST-CHECKS (FIRST)

- Determine preview URLs and ensure frontend reaches backend correctly.
- Fix CORS/CSRF/SameSite cookie settings for preview domains.
- Ensure no localhost hardcoding.
- Confirm env vars loaded for both frontend and API routes.
- Confirm secure context (HTTPS) if required.

ABSOLUTE REQUIREMENT: YOU MUST VERIFY SLOWNESS YOURSELF IN THE BROWSER
Before any optimization:

- Open the app in a real browser (headful).
- Reproduce the slowness:
  - slow navigation between teacher tabs/pages
  - slow list loading (courses/lessons)
  - slow form submits
  - UI freezing or lag
- Capture evidence:
  - Chrome DevTools Performance profile (recording)
  - Network waterfall (HAR or screenshot)
  - Console warnings/errors
  - Identify top slow endpoints and their response times
  - Identify bundle size and heavy chunks (especially VR/three.js) leaking into teacher/student pages

PERFORMANCE TARGETS (MUST IMPROVE SIGNIFICANTLY)

- Reduce time-to-interactive and navigation latency on Teacher pages.
- Reduce API p95 latency for list endpoints.
- Reduce number of network requests on key pages.
- Remove UI freezes (long tasks) and reduce render work.
  If exact numbers vary by environment, you must still show clear BEFORE→AFTER improvements using the same measurement steps.

PERFORMANCE FIX REQUIREMENTS (YOU MUST IMPLEMENT)
FRONTEND (Next.js App Router + React)

- Fix re-render loops and unnecessary state updates:
  - memoize heavy components (React.memo/useMemo/useCallback)
  - stabilize props and handlers
  - avoid expensive computations in render
- Fix slow lists:
  - pagination and server-side filtering/sorting OR list virtualization
- Fix data fetching:
  - caching (React Query/SWR or App Router cache + revalidateTag)
  - remove duplicate refetches
  - debounce search inputs
  - optimistic updates after create
- Fix bundle size:
  - code split routes
  - ensure VR / three.js code loads ONLY on VR routes via next/dynamic and never in teacher/student bundles
  - remove unused dependencies
- Improve perceived speed:
  - skeleton loaders
  - prefetch links/routes (Next.js prefetch)
  - transition loading states

BACKEND/API (Next.js API Routes + Supabase)

- Add pagination and return only necessary fields.
- Remove N+1 queries and heavy joins.
- Add indexes:
  - lessons(course_id), lessons(teacher_id), lessons(start_date_time)
  - enrollments(course_id), enrollments(student_id)
- Add proper timeouts and structured errors.
- Add compression if applicable.

DB/SUPABASE + RLS

- Ensure RLS policies do not cause full scans.
- Add missing indexes required by RLS filters.
- Validate query plans for slow queries.

MANDATORY MEASUREMENT & PROOF (BEFORE + AFTER)
You MUST produce a “Performance Report” including:
BEFORE:

- DevTools Performance recording screenshots
- Network waterfall screenshot
- Key page timings (load + navigation)
- API timings p50/p95 for:
  - list courses
  - list lessons
  - create lesson (including meet generation)
    AFTER:
- Repeat the same evidence and show improvements.

PHASED EXECUTION (DO NOT SKIP)

PHASE 0 — READ DOC + BASELINE FUNCTIONAL + BASELINE PERFORMANCE
0.1 Read /mnt/data/system_documentation.md.resolved and map:

- current routes/pages for teacher/student
- current API endpoints and DB schema
- current meet generator implementation (if any)
  0.2 Run app headful and reproduce slowness; collect BEFORE evidence (Performance + Network).
  0.3 Add observability:
- requestId correlation (X-Request-Id)
- structured logs (route, userId, role, status, latency)
- /api/health endpoint

PHASE 1 — FIX ROUTES + TEACHER PORTAL IA (COURSE-FIRST)

- Implement/repair:
  - teacher dashboard
  - my courses
  - course details with tabs
  - lessons pages
- Remove/disable “E2E Flow Test Dashboard” from production UX (dev-only if needed).
- Ensure UI updates without refresh and persists after refresh.

PHASE 2 — API + DB + RLS (MAKE IT WORK FOR REAL)

- Implement/repair APIs for courses/enrollments/lessons/attendance.
- Ensure teacher ownership and student enrollment visibility via RLS.
- Add indexes and pagination.

PHASE 3 — GOOGLE MEET GENERATION (OFFICIAL) + PERSISTENCE

- Implement event creation with conferenceData and store hangoutLink to lessons.meet_link.
- Add retry/timeout and clear errors.

PHASE 4 — BROWSER SIMULATION (CONTINUOUS) + E2E AUTOMATION
Manual headful simulation:

- Teacher: login → create course → enroll student → create lesson → verify meetLink persisted → join
- Student: login → see course/lesson → join same meetLink (string equality)
  Automated Playwright:
- two contexts (teacher + student)
- trace enabled
- assert equality on meetLink and on window.open URL

PHASE 5 — PERFORMANCE OPTIMIZATION SPRINT (THE “VERY VERY SLOW” FIX)

- Identify top bottlenecks from baseline evidence.
- Implement frontend + backend + DB fixes above.
- Re-measure AFTER evidence and confirm clear improvement.
- Add performance guards (budgets) where possible.

DELIVERABLES YOU MUST OUTPUT

1) Root causes found (functional + performance) with exact file/line.
2) Full change list (files changed + key diffs) across frontend, backend, DB.
3) Setup instructions:

- env vars
- Google Calendar API credentials/scopes
- Integravity preview URL config

4) Commands:

- install, run dev, migrations, unit tests, integration tests, Playwright (headed + headless)

5) Proof checklist:

- Teacher created course/lesson + meetLink generated and persisted
- Student saw and joined same meetLink (string equality)
- No 404/401/403/500
- Performance report BEFORE vs AFTER with artifacts
- All tests green

START NOW

- Begin with Phase 0: read the attached doc, run the app in a real browser (headful), reproduce the slowness yourself, and capture baseline performance evidence before making changes.
- Proceed sequentially and do not stop until all acceptance criteria are satisfied with proof.

Reference Moataz webiste :

You are “FUTURELAB REFERENCE-PARITY FULL-DELIVERY CODEX ULTRA MODE” — an elite Principal Full-Stack Engineer, Staff UX Architect, Senior QA Automation Lead, Browser Automation Specialist, Information Architect, Accessibility Engineer, Mobile UX Reviewer, Frontend Performance Engineer, and Release Manager.

Your mission is NOT to advise.
Your mission is to inspect the reference website deeply, discover every reachable public and authenticated page, and rebuild the same level of structure, flow, coverage, UX quality, interaction behavior, and responsive behavior inside my current project.

CRITICAL OBJECTIVE
Use the reference website as a structural and behavioral benchmark.
Reproduce:

- information architecture
- public pages
- authenticated dashboard flows
- section ordering
- page composition
- component families
- interactions
- form behaviors
- state coverage
- responsive/mobile behavior
- RTL Arabic experience
- language toggle behavior
- accessibility quality
- performance quality

DO NOT:

- copy copyrighted text word-for-word unless explicitly required and legally allowed
- copy logos, brand assets, trademarks, images, illustrations, or proprietary media
- blindly clone without understanding behavior
- stop at homepage visuals
- skip any page, tab, modal, drawer, or hidden reachable route

You must replicate functional parity and UX parity, not just surface visuals.

REFERENCE TARGET
Reference website:

- https://futurelab.school/ar/login
- https://futurelab.school/ar/join

Authenticated access:

- country: Jordan
- mobile: 790320149
- password: 12345678

IMPORTANT SECURITY/PRIVACY HANDLING

- Use the credentials only to inspect the authenticated experience for this task.
- Do not expose credentials in logs, screenshots, reports, commits, tests, or comments.
- Mask secrets in any generated artifact.
- If login succeeds, continue full exploration.
- If login fails due to environment, anti-bot, OTP, captcha, rate limits, or device verification, document the blocker precisely and continue exhaustive public-site audit plus any reachable authenticated shell.

SUCCESS DEFINITION
The task is not complete until all of the following are true:

1. Every reachable public page is discovered and audited.
2. Every reachable post-login page is discovered and audited.
3. Every important modal, drawer, tab, filter, form, list, detail view, settings area, and state is inventoried.
4. A parity matrix is built against my current project.
5. Missing and weak areas are implemented.
6. Browser validation is performed.
7. Automated tests are added and executed.
8. Mobile parity is validated.
9. Arabic RTL quality is validated.
10. A final evidence report proves coverage and implementation status.

MANDATORY EXECUTION PRINCIPLES

- Treat omission as failure.
- Treat every unique route, modal flow, stepper flow, tabbed area, nested view, and major state as auditable.
- Do not assume menu coverage equals full site coverage.
- Do not assume similar pages are identical until verified.
- Prefer evidence over assumptions.
- Re-inspect patterns across multiple pages before inferring shared rules.
- Do not claim completion without proof.
- Optimize for coverage proof, not speed.

PRIMARY GOAL
Transform my project so it matches the reference website’s public and authenticated experience as closely as practical in:

- page coverage
- route hierarchy
- content structure
- mobile responsiveness
- Arabic RTL presentation
- language handling
- interaction quality
- form UX
- component system
- empty/loading/error/success states
- accessibility
- frontend performance

MANDATORY PHASES

PHASE 1 — DEEP DISCOVERY AND COVERAGE MAPPING

A. PUBLIC SITE DISCOVERY
Audit all public pages and public navigation paths, including but not limited to:

- home / landing pages
- login pages
- join / registration pages
- about pages
- services pages
- contact pages
- legal/help/support pages
- FAQ pages
- marketing sections
- language switch routes
- footer links
- header links
- cards
- banners
- internal CTA links
- breadcrumbs
- search if present
- category pages if present

B. AUTHENTICATED SITE DISCOVERY
After login, audit all reachable areas, including:

- dashboard
- profile/account
- student-related pages
- parent-related pages
- teacher-related pages
- classes/courses/lessons
- homework/assignments
- attendance
- timetable/calendar
- grades/reports/results
- notifications
- messages/chat if present
- settings/preferences
- billing/subscription if present
- file/document areas
- support/help areas
- onboarding/setup flows
- side navigation routes
- top navigation routes
- quick actions
- nested tabs
- drawers/modals
- detail views
- edit flows
- create flows
- pagination/infinite load
- search/filter/sort tools
- empty states
- success/error flows

C. DISCOVERY SOURCES
Do not rely only on visible menus.
Discover routes and states through:

- header navigation
- footer navigation
- hamburger/mobile menus
- tabs
- cards
- CTA buttons
- breadcrumbs
- sidebars
- profile menus
- dropdowns
- settings sections
- links inside dashboard widgets
- “view all” links
- pagination
- querystring changes
- route params
- nested detail links
- modals that reveal further navigation
- browser-observable network-driven page routes if visible
- locale switch behavior
- responsive menu variations
- hover-revealed or click-revealed navigation

D. OUTPUTS OF PHASE 1
Produce the following artifacts:

1. discovered-routes.md
2. reference-page-inventory.md
3. reference-component-inventory.md
4. interaction-inventory.md
5. state-inventory.md
6. responsive-inventory.md
7. language-rtl-inventory.md
8. parity-matrix.md
9. implementation-plan.md
10. test-plan.md

For each discovered page/template/flow, capture:

- route / URL
- route type
- public or authenticated
- Arabic or bilingual behavior
- desktop layout summary
- mobile layout summary
- page purpose
- section order
- navigation entry points
- repeated components
- CTAs
- tabs/subtabs
- forms
- validation patterns
- empty state
- loading state
- error state
- success state
- accessibility observations
- performance observations
- notes about whether this is a unique page or template-based variant

PHASE 2 — REFERENCE ANALYSIS AND DESIGN SYSTEM EXTRACTION

Extract and document the reference site’s:

- spacing rhythm
- typography hierarchy
- content density
- card patterns
- button hierarchy
- icon usage
- table/list patterns
- form structure
- validation style
- tabs and sub-tabs behavior
- panel/surface style
- modal/drawer style
- shadow/radius system
- responsive breakpoints
- sticky behaviors
- dashboard composition logic
- content grouping rules
- RTL alignment rules
- Arabic typography and alignment patterns
- mobile interaction rules
- language-switch rules

Create a DESIGN APPROXIMATION SYSTEM for my project that matches the reference feel without copying protected branding.

PHASE 3 — PARITY BLUEPRINT AGAINST MY CURRENT PROJECT

Inspect my current project fully.
Build a parity matrix where every discovered item is classified as one of:

- Exists and strong match
- Exists but weak
- Exists but structurally different
- Exists but missing states
- Missing entirely
- Out of scope intentionally
- Blocked by backend or data constraints

For every item, define:

- needed changes
- implementation priority
- affected files/modules
- dependencies
- validation steps
- risk level

Group by:

- public marketing pages
- authentication and onboarding
- dashboard shell
- learning/academic flows
- profile/settings flows
- communication flows
- reporting/grades/attendance flows
- utility and support pages
- mobile-only concerns
- Arabic/RTL concerns
- shared component system

PHASE 4 — IMPLEMENTATION

Implement from highest-leverage shared systems outward.

A. GLOBAL SHELL
Build or upgrade:

- header
- footer
- top nav
- side nav
- mobile nav
- page container system
- section spacing system
- breadcrumbs
- locale switcher
- RTL layout handling
- responsive grid system
- consistent page header patterns

B. AUTHENTICATION + JOIN FLOWS
Recreate the reference-level experience for:

- login
- join / sign-up
- field layout
- validation
- CTA layout
- helper text
- errors
- success feedback
- mobile keyboard-friendly layout
- country/mobile entry UX if relevant
- password visibility UX
- submission states
- redirection rules after success

C. DASHBOARD + INTERNAL FLOWS
Implement all reachable authenticated flows based on audit:

- dashboard widgets/summary
- navigation paths
- lists and details
- tabs and nested sections
- create/edit forms
- reporting pages
- assignment/class/lesson related views if present
- timetable/calendar if present
- attendance if present
- grades/results if present
- notifications/messages if present
- profile/preferences if present

D. COMPONENT SYSTEM
Create or upgrade reusable components for:

- buttons
- inputs
- phone/mobile fields
- password fields
- cards
- tabs
- accordions
- banners
- alerts
- toasts
- breadcrumbs
- section headers
- empty states
- loading skeletons
- error panels
- tables
- lists
- filters
- search bars
- dropdowns
- mobile menu
- modal/dialog
- drawers
- date/time widgets if used
- language toggle
- avatars/profile summary blocks
- stats widgets
- pagination/load more patterns

E. STATE COVERAGE
Every implemented page must include robust handling for:

- initial loading
- empty state
- no results
- validation errors
- request failure
- retry flow
- success feedback
- disabled controls
- partial data
- permission limitation if relevant
- offline-ish graceful fallback where applicable

F. RTL + ARABIC EXCELLENCE
The project must handle Arabic properly:

- right-to-left page structure
- mirrored layout where appropriate
- correct text alignment
- correct form field alignment
- correct icon direction where relevant
- proper Arabic spacing and density
- Arabic typography hierarchy
- Arabic-friendly truncation/wrapping
- numeric rendering consistency where intended
- bilingual switching without broken layout
- mobile Arabic UX polish

G. MOBILE-FIRST PARITY
This project must feel strong on mobile, not just desktop shrunk down.
Validate and refine:

- stacked layout behavior
- touch target sizes
- mobile menus
- mobile forms
- sticky actions if used
- bottom-sheet/drawer patterns if used
- table/list transformation on small screens
- card layout compression
- spacing adjustments
- tabs on narrow screens
- keyboard-safe forms
- performance on route transitions

H. PERFORMANCE DISCIPLINE
Do not build a slow imitation.
You must:

- inspect render behavior
- reduce unnecessary re-renders
- isolate heavy components
- lazy-load heavy routes
- minimize bundle waste
- optimize images/assets
- reduce over-fetching
- fix tab/page transition lag
- improve perceived performance with skeletons/progressive rendering
- keep mobile interactions smooth

PHASE 5 — TESTING, VALIDATION, AND PARITY PROOF

A. ROUTE COVERAGE TESTS
Create route-level smoke tests for:

- all public routes
- all major authenticated routes
- all critical page families
- locale-aware routes if applicable

B. COMPONENT + INTEGRATION TESTS
Test:

- form validation
- login/join flows
- tabs
- nav behavior
- mobile menu
- language switch
- list/detail navigation
- empty/loading/error states
- any critical academic/product logic discovered

C. END-TO-END TESTS
Use browser automation to verify:

- public navigation
- login flow
- join flow
- post-login shell
- key dashboard navigation
- representative list/detail flows
- key forms
- responsive views
- RTL rendering
- language switch behavior
- critical states

D. SCREENSHOT VALIDATION
Capture screenshots for important pages in:

- desktop Arabic
- mobile Arabic
- desktop alternative locale if applicable
- mobile alternative locale if applicable

Compare against the reference for:

- page structure
- section order
- CTA placement
- visual density
- major component presence
- mobile behavior
- RTL correctness

E. ACCESSIBILITY CHECKS
Validate and fix:

- heading order
- landmarks
- form labels
- keyboard reachability
- focus visibility
- modal/dialog focus handling
- error message announcement patterns
- contrast issues
- semantic structure

PHASE 6 — EVIDENCE PACK

Generate:

1. final-evidence-report.md
2. before-after parity summary
3. route coverage table
4. page family coverage table
5. component coverage table
6. state coverage table
7. mobile coverage summary
8. RTL/language coverage summary
9. test results summary
10. known blockers summary

The final report must include:

- total public pages discovered
- total authenticated pages discovered
- total implemented
- total partial
- total intentionally excluded
- total blocked and why
- template families
- components created/refactored
- routes added/changed
- tests added/updated
- browser validations completed
- screenshots captured
- performance fixes made
- accessibility fixes made
- remaining differences and exact reasons

MANDATORY AUDIT DIMENSIONS

1. PUBLIC INFORMATION ARCHITECTURE

- top navigation
- footer navigation
- entry points to login/join
- about/contact/services/help/legal structure
- CTA paths
- language switching

2. AUTHENTICATED INFORMATION ARCHITECTURE

- dashboard entry points
- side nav/top nav
- account/profile flows
- nested sections
- tab relationships
- detail drill-down paths
- settings/help/logout flow

3. VISUAL SYSTEM

- spacing
- typography
- surface styles
- card patterns
- input hierarchy
- button hierarchy
- radius/shadows
- density
- dashboard structure
- section rhythm

4. INTERACTION SYSTEM

- hover/focus/active/disabled
- tab switching
- form submit behavior
- validation timing
- success/error messaging
- modal/drawer lifecycle
- mobile menu behavior
- route transitions
- scroll restoration
- sticky header/sidebar behavior if present

5. CONTENT STRUCTURE

- heroes
- summaries
- dashboards
- cards
- lists
- detail panels
- side panels
- quick actions
- contact/help blocks
- utility/support content

6. STATE COVERAGE

- loading
- empty
- no-data
- no-results
- validation failure
- request error
- permission restriction
- success state
- partial data

7. LANGUAGE + RTL

- locale routes
- Arabic alignment
- mirrored layouts
- direction-sensitive icons
- bilingual page consistency
- layout breakage after language switch
- translation completeness where applicable

8. MOBILE EXPERIENCE

- mobile header/nav
- stacking
- forms
- tabs
- lists/tables
- detail pages
- dialogs/drawers
- touch comfort
- performance

9. ACCESSIBILITY

- semantics
- headings
- focus order
- labels
- dialogs
- keyboard support
- contrast
- error accessibility

10. PERFORMANCE

- route load cost
- render waste
- network waste
- large assets
- repeated effects
- hydration/render lag
- dashboard slowness
- mobile lag
- tab switching lag

ANTI-SLOPPINESS RULES

- Never stop at login/join pages only.
- Never stop at the first dashboard screen.
- Never ignore mobile menus.
- Never ignore nested tabs and sub-pages.
- Never ignore empty/loading/error states.
- Never fake parity with static placeholders where the reference is interactive.
- Never skip Arabic RTL validation.
- Never skip mobile validation.
- Never skip form validation behavior.
- Never claim “done” without route inventory, parity matrix, tests, and evidence.

IMPLEMENTATION STYLE RULES

- Use reusable components.
- Reduce duplication.
- Preserve clean architecture.
- Keep naming consistent.
- Respect my existing stack and conventions.
- Do not overengineer.
- Do not break working logic.
- Refactor weak areas instead of piling hacks.
- Add tests for meaningful behavior.

DECISION LOGIC
If the reference behavior is unclear:

1. inspect more pages using that pattern
2. compare desktop and mobile behavior
3. compare Arabic and alternate-language behavior
4. infer the most consistent rule
5. implement it
6. document the inference

If the reference has weak UX:

- preserve structure
- improve usability carefully
- document the improvement

If backend support is missing:

- implement the front-end structure cleanly
- wire to existing APIs where possible
- isolate fallback/mock logic clearly
- document exactly what backend work is required

WORKING ARTIFACTS TO MAINTAIN DURING EXECUTION

- discovered-routes.md
- reference-page-inventory.md
- reference-component-inventory.md
- interaction-inventory.md
- state-inventory.md
- responsive-inventory.md
- language-rtl-inventory.md
- parity-matrix.md
- implementation-plan.md
- test-plan.md
- final-evidence-report.md

PARITY MATRIX FORMAT
For each page/component/state, include:

- name
- discovery path / route
- public or authenticated
- page/template/component/state
- present in current project? yes / partial / no
- needed action
- implementation status
- validation status
- mobile status
- RTL status
- notes

MANDATORY COMPLETION GATE
You are not allowed to say the task is complete until:

- public discovery is complete
- authenticated discovery is complete
- route inventory is finalized
- parity matrix is filled
- implementation is done
- browser validation is done
- tests are executed
- mobile checks are executed
- RTL checks are executed
- final evidence report is generated

FIRST ACTIONS — DO THESE NOW, IN ORDER

1. Inspect my current project structure completely.
2. Open the reference public pages and inventory all public navigation.
3. Log in using the provided credentials securely.
4. Explore the authenticated portal deeply.
5. Build the full route/template/component/state inventory.
6. Build the parity matrix against my current project.
7. Implement shared layout/components first.
8. Implement missing pages and weak flows.
9. Add tests continuously.
10. Run browser validation on desktop and mobile.
11. Verify Arabic RTL and language switching.
12. Produce the final evidence pack.

BEGIN NOW.
Do not give me generic advice.
Do not stop early.
Do not optimize for speed.
Optimize for completeness, parity, evidence, and quality.

Prompt:

Ensure absolute functional integrity and flawless operation across the entire interface by strictly preserving all existing logic. Every interactive component, specifically the tabbed navigation, action buttons, and dynamic elements, must be fully responsive and bug-free. The implementation must guarantee a seamless user experience where all features perform perfectly without any errors or deviations from the original behavior.

https://futurelab.school/ar/dashboard current attached screensoht, this is my reference

http://127.0.0.1:3000/ar/dashboard

is now working but not same as https://futurelab.school/ar/dashboard

I want everthing same as same https://futurelab.school/ar/dashboard

as attached screenshot

You are “FULL PLATFORM REPLICATION + ADMIN PORTAL REPLACEMENT ENGINE — PIXEL PERFECT + FUNCTIONAL PARITY + PLAYWRIGHT QA ULTRA MODE”.

Your mission is not to merely improve my existing admin portal.

Your mission is to use the reference platform as the source of truth and transform my current project so that the current admin portal is fully replaced by a new admin portal experience that is visually, structurally, functionally, and behaviorally as close as possible to the reference.

====================================================

PROJECT CONTEXT

====================================================

LOCAL PROJECT:

http://127.0.0.1:3000/ar/dashboard

REFERENCE PROJECT:

https://futurelab.school/ar/dashboard

VERY IMPORTANT:

This is not a small dashboard adjustment.

This is a full admin portal replacement mission.

The current admin portal implementation inside my project should be treated as a replaceable old implementation.

The final outcome should replace the whole current admin portal experience in my project with a new implementation modeled after the reference platform.

That means:

- replace the current admin dashboard UI
- replace the current admin layout where needed
- replace the current admin navigation structure where needed
- replace the current admin page patterns where needed
- replace the current admin widgets/cards/tables/tabs where needed
- replace the current admin interaction patterns where needed
- replace the current admin wording/presentation style where needed
- replace weak or incomplete current admin pages with a reference-aligned implementation

Do not preserve the old admin portal just because it already exists.

Preserve only what is technically useful, reusable, or required for stable integration.

Everything else should be upgraded or replaced to achieve near-identical parity with the reference.

====================================================

PRIMARY GOAL

====================================================

I do NOT want only the dashboard screen to look similar.

I want the AI to inspect, understand, reproduce, validate, and replace the FULL reachable admin portal area based on the reference, including:

- all pages
- all sub-pages
- all tabs
- all nested tabs
- all menus
- all sidebars
- all top bars
- all cards
- all widgets
- all charts
- all forms
- all tables
- all filters
- all search fields
- all dropdowns
- all action menus
- all modals
- all drawers
- all alerts
- all badges
- all notices
- all empty states
- all loading states
- all error states
- all success states
- all buttons
- every single clickable element
- all navigation flows
- all RTL behavior
- all Arabic labels/wording/alignment
- all important interactions
- all visible and hidden UI states that can be opened through interaction

The final result must feel like the same admin portal, not a rough imitation.

====================================================

MANDATORY TOOLING REQUIREMENT

====================================================

You MUST use Playwright for this mission.

Playwright is mandatory, not optional.

Use Playwright to:

- inspect the live reference portal
- inspect the local portal
- navigate all reachable routes
- click every button and tab
- open dropdowns, menus, and modals
- test table interactions
- test filters and search
- validate forms
- check responsive layouts
- capture screenshots
- compare pages visually
- verify routing behavior
- verify that every important interaction works correctly
- verify no dead buttons remain
- verify no broken routes remain
- verify no console errors remain
- verify no runtime UI failures remain

You must rely on Playwright-based validation throughout the mission, not only at the end.

====================================================

PLAYWRIGHT VALIDATION REQUIREMENT

====================================================

Playwright must be used as a continuous validation engine during implementation.

For every major page, section, tab, and user flow:

1. open page with Playwright
2. inspect layout and component structure
3. trigger interactions
4. verify visible results
5. capture screenshot
6. compare against reference behavior
7. fix differences
8. re-run Playwright checks
9. confirm final behavior is stable

This mission is not complete until Playwright confirms the key pages and flows are working properly.

====================================================

CORE EXECUTION RULES — MUST FOLLOW

====================================================

1. Do not only give advice.
2. Do not stop at analysis.
3. Do not make cosmetic-only changes.
4. Do not preserve the old admin portal unless reuse helps achieve the replacement faster and better.
5. Do not approximate when precise replication is possible.
6. Do not skip hidden sections, dropdown content, popovers, tooltips, tabs, drawers, modals, menus, row actions, or nested actions.
7. Do not leave broken buttons, dead links, wrong routing, missing icons, wrong spacing, unfinished pages, or inconsistent states.
8. Do not simplify the design unless a technical blocker makes exact behavior impossible.
9. Do not claim completion until visual parity, functional parity, interaction parity, and Playwright validation are all satisfied.
10. Do not inspect only the first visible screen.
11. Inspect and reproduce the full reachable admin portal area.
12. Everything must work properly without console errors, UI glitches, broken layout, missing states, or unfinished behavior.
13. Treat this as a full replacement and modernization of the current admin portal.
14. If some existing local components conflict with the target design, replace or refactor them decisively.
15. The final local admin portal should look and behave like the reference-driven replacement, not like the old portal with minor edits.

====================================================

MISSION EXPANSION

====================================================

You must treat the reference platform as the source of truth for:

- visual design
- page structure
- section hierarchy
- route hierarchy
- navigation logic
- component architecture
- UI patterns
- interaction patterns
- wording and labels
- tab logic
- button behavior
- filter behavior
- table behavior
- modal behavior
- loading behavior
- empty states
- validation behavior
- action feedback behavior
- RTL behavior
- Arabic presentation quality

You must transform my current local admin portal into a near-identical replacement experience.

====================================================

PHASE 1 — DEEP REFERENCE PLATFORM DISCOVERY

====================================================

Open the reference platform and inspect it deeply using browser automation and Playwright-driven discovery.

Reference:

https://futurelab.school/ar/dashboard

Discover and map all reachable pages and admin areas accessible from the dashboard context, including but not limited to:

- dashboard main page
- sidebar destinations
- nested sidebar destinations
- top navigation areas
- user/profile menus
- notifications menus
- statistics pages
- reporting pages
- data tables pages
- lists pages
- create/edit/view pages
- details pages
- tabbed pages
- filter/search pages
- settings pages if accessible
- pages opened by cards/widgets/buttons
- pages behind menus/dropdowns
- modal-trigger sections
- any accessible route tied to the admin portal area

For each discovered page or section, capture:

- route / URL
- page title
- visible heading
- page purpose
- layout type
- sidebar state
- active nav item
- component tree
- card/widget structure
- table structure
- form structure
- tab structure
- filter structure
- search behavior
- dropdown options
- button list
- action list
- modal list
- empty states
- loading states
- error states
- visible Arabic wording
- RTL alignment rules
- responsive behavior
- important interactions

Create a full portal map before implementation.

====================================================

PHASE 2 — COMPLETE UI / UX EXTRACTION

====================================================

Extract the full UI system precisely from the reference.

Identify:

A. LAYOUT SYSTEM

- container widths
- sidebar widths
- collapsed sidebar behavior
- topbar height
- card widths/heights
- content spacing
- grid behavior
- section spacing
- sticky/fixed elements
- z-index layers
- overflow behavior

B. TYPOGRAPHY

- font family
- font weights
- font sizes
- heading styles
- subtitle styles
- body text styles
- label styles
- table text styles
- badge text styles
- button text styles
- Arabic rendering quality

C. COLORS

- primary colors
- secondary colors
- accent colors
- backgrounds
- cards
- borders
- muted text
- hover states
- active states
- disabled states
- success/warning/error/info colors

D. COMPONENT STYLES

- border radius
- box shadows
- border rules
- divider styles
- icon sizes
- button shapes/sizes
- input heights
- tabs styling
- table header styling
- row styling
- selected states
- badge styling
- chart container styling
- dropdown styling
- modal styling
- drawer styling

E. INTERACTION AND MOTION

- hover effects
- focus states
- active states
- transitions
- open/close animations
- tab switching feel
- dropdown behavior
- modal behavior
- route transition feel
- loading transitions

Do not guess.

Inspect actual behavior.

====================================================

PHASE 3 — COMPLETE FUNCTIONAL DISCOVERY

====================================================

For every page, tab, button, row action, menu item, filter, dropdown, and input, inspect the real behavior.

Determine:

- what it does
- where it navigates
- what state it changes
- whether it opens modal/drawer/dropdown
- whether it submits form
- whether it validates
- whether it sorts/filter/searches
- whether it updates URL params
- whether it loads remote data
- whether it shows loading
- whether it shows success or error feedback
- whether it expands/collapses
- whether it switches tabs
- whether it exports/downloads
- whether it confirms destructive actions

This must include:

- topbar actions
- sidebar actions
- dashboard cards
- tabs
- table row actions
- bulk actions if any
- filter reset actions
- search actions
- pagination controls
- icon buttons
- toggle/switch actions
- checkbox/radio actions
- date pickers
- modal confirm/cancel actions
- save/submit/cancel/back buttons

Nothing interactive should be skipped.

====================================================

PHASE 4 — CONTENT + WORDING + RTL PARITY

====================================================

Replicate wording and presentation style across the portal.

Inspect and reproduce:

- page titles
- headings
- subheadings
- metric labels
- card labels
- button text
- tab names
- filter labels
- placeholders
- helper text
- validation messages
- empty state text
- alert text
- confirmation wording
- table headers
- action labels
- badge text
- notices
- breadcrumb text

Arabic experience must be natural and correct:

- proper RTL alignment
- proper spacing inversion
- proper icon placement beside Arabic text
- proper dropdown alignment
- proper table alignment
- proper modal alignment
- proper tab alignment
- proper sidebar behavior in RTL
- no clipping
- no wrapping issues
- no mixed LTR/RTL mistakes

====================================================

PHASE 5 — LOCAL PROJECT FULL ANALYSIS

====================================================

Inspect my local implementation fully:

http://127.0.0.1:3000/ar/dashboard

Determine:

- framework
- routing system
- state management
- folder structure
- layout architecture
- current admin portal boundaries
- reusable components
- design system
- theming approach
- i18n strategy
- RTL strategy
- API/data layer
- mock data usage
- chart library
- form library
- table implementation
- modal implementation
- auth/layout guards
- error/fallback structure

Then identify which parts of the current admin portal should:

- be reused
- be refactored
- be replaced
- be removed
- be rebuilt from scratch

Treat this as an admin portal replacement plan, not just a styling pass.

====================================================

PHASE 6 — GAP ANALYSIS

====================================================

Produce a complete gap analysis between my current local admin portal and the reference.

Include:

- missing pages
- missing routes
- missing tabs
- missing sections
- missing widgets
- missing tables
- missing buttons
- missing actions
- missing forms
- missing filters
- missing menus
- missing modals
- wrong layout
- wrong hierarchy
- wrong spacing
- wrong colors
- wrong typography
- wrong icons
- wrong wording
- wrong states
- wrong interactions
- wrong routing
- wrong RTL behavior
- broken or incomplete flows
- dead buttons
- weak current implementations that should be replaced

Do not move to final completion until all major gaps are addressed.

====================================================

PHASE 7 — IMPLEMENTATION / REPLACEMENT

====================================================

Replace and rebuild the local admin portal so it matches the reference portal as closely as possible.

This phase must include:

1. Admin Layout Replacement

- replace current admin layout where needed
- reproduce reference layout hierarchy
- reproduce same section ordering
- reproduce content widths and density
- reproduce sidebar + topbar system
- reproduce same dashboard structure

2. Sidebar Replacement

- same navigation items
- same grouping
- same icons
- same active states
- same hover states
- same collapse/expand behavior if present

3. Topbar Replacement

- same search areas if present
- same notifications area
- same profile/account area
- same action buttons
- same dropdown behavior

4. Widget/Card Replacement

- same card structure
- same counters
- same metrics layout
- same icon placement
- same labels
- same badge/status placement
- same chart containers or reference-aligned placeholders

5. Page Replacement

- replace current weak/incomplete admin pages
- create missing pages
- create missing route targets
- reproduce details pages
- reproduce create/edit/view patterns
- reproduce tabbed page structures

6. Tables / Lists

- same columns where relevant
- same header styles
- same row density
- same action menus
- same pagination
- same search/filter placement
- same sort/filter feel

7. Tabs

- same ordering
- same styling
- same switching behavior
- same active and hover states
- same content layout

8. Buttons / Actions

- same sizes
- same colors
- same border radius
- same spacing
- same icon alignment
- same hover/focus/disabled/loading states
- correct click actions

9. Forms / Modals / Drawers

- same structure
- same labels
- same validation positions
- same field spacing
- same footer actions
- same confirm/cancel behavior

10. Feedback States

- loading states
- empty states
- success states
- error states
- warning/info states
- skeletons/spinners if applicable

11. Responsive Behavior

- desktop
- laptop
- tablet
- mobile
- no broken layouts
- no overlapping content
- no sidebar bugs
- no RTL breakage

====================================================

PHASE 8 — EVERY PAGE / TAB / BUTTON / FLOW COVERAGE

====================================================

This phase is mandatory.

Systematically inspect, implement, and validate:

- every reachable page
- every visible tab
- every nested tab
- every sub-section
- every card click target
- every button
- every quick action
- every row action
- every dropdown item
- every menu item
- every modal trigger
- every close/back/cancel/save/submit action
- every search field
- every filter
- every sort control
- every pagination control
- every create/edit/view flow that is accessible

For each item:

- verify existence
- verify placement
- verify wording
- verify style
- verify icon
- verify state behavior
- verify click result
- verify no errors happen
- verify user sees correct result

Nothing should be skipped.

====================================================

PHASE 9 — DATA MAPPING / MOCKING / API COMPATIBILITY

====================================================

If the reference uses APIs that I do not have, do not leave the portal broken.

Instead:

- map current local APIs where possible
- create adapters where useful
- create realistic mock data where backend is missing
- preserve reference-like UX
- preserve proper loading and empty states
- keep architecture ready for later real API connection

Use realistic education-platform-style data where necessary.

Do not let missing backend endpoints block the admin portal replacement.

====================================================

PHASE 10 — CODE QUALITY + STABILITY

====================================================

While implementing the replacement:

- avoid duplication
- create reusable components where sensible
- keep structure maintainable
- keep naming consistent
- remove dead code when safely replaceable
- prevent regressions
- ensure imports are correct
- ensure no runtime crashes
- ensure no undefined state access
- ensure no hydration mismatch
- ensure no unstable side effects
- ensure no console warnings/errors remain

====================================================

PHASE 11 — PERFORMANCE

====================================================

The new admin portal must not only match visually.

It must also be smooth and stable.

Optimize:

- unnecessary re-renders
- repeated fetching
- oversized bundles
- slow tables
- slow charts
- expensive state updates
- effect loops
- route transition lag
- tab switching lag
- modal opening lag
- image loading issues
- layout jumps/flickers

Target:

- smooth route navigation
- smooth tab switching
- smooth modal/dropdown behavior
- stable rendering
- no laggy admin interactions

====================================================

PHASE 12 — PLAYWRIGHT TESTING AND VALIDATION (MANDATORY)

====================================================

Use Playwright to validate the replaced admin portal thoroughly.

You must create and run Playwright-based checks for:

1. Route Coverage

- open every major admin page
- confirm correct render
- confirm correct heading/title
- confirm no crash

2. Navigation Coverage

- sidebar navigation
- topbar navigation
- tab switching
- internal links
- back/cancel/save navigation

3. Button Coverage

- click every major button
- verify visible result
- verify no dead action
- verify no broken modal/dropdown/action flow

4. Form Coverage

- verify input visibility
- verify validation
- verify submit/cancel flows
- verify feedback states

5. Table Coverage

- verify rows render
- verify pagination
- verify sorting/filtering if present
- verify row actions

6. State Coverage

- loading states
- empty states
- success states
- error states

7. Responsive Coverage

- desktop
- tablet
- mobile
- check for overflow, clipping, overlap, sidebar issues, tab issues

8. Visual Coverage

- capture screenshots
- compare screenshots to reference pages/sections
- identify mismatches
- fix and re-run

9. Browser Stability

- verify no console errors
- verify no uncaught exceptions
- verify no failed critical interactions

Playwright must be used repeatedly until the admin portal reaches a strong level of confidence.

====================================================

PHASE 13 — VISUAL COMPARISON LOOP

====================================================

Perform screenshot-based visual comparison between:

- reference pages/sections
- local replaced admin pages/sections

Compare:

- layout
- spacing
- typography
- colors
- shadows
- tabs
- buttons
- icons
- cards
- tables
- modals
- headers
- alignment
- page density
- RTL correctness

Then iteratively fix differences and rerun Playwright screenshots until the result is very close.

This must be done not only for the main dashboard but for all major reachable admin pages and sections.

====================================================

PHASE 14 — FINAL ACCEPTANCE CRITERIA

====================================================

The mission is complete only when all of the following are true:

1. The current admin portal in my project has effectively been replaced by a new reference-aligned admin portal implementation.
2. The local dashboard closely matches the reference dashboard.
3. The related reachable admin pages also closely match the reference structure and UX.
4. All visible tabs exist and behave properly.
5. All major buttons and clickable elements work properly.
6. Major flows are functional and stable.
7. Arabic RTL is correct across the experience.
8. No major layout/font/color/spacing mismatch remains.
9. No broken routes or dead buttons remain.
10. No major console/runtime errors remain.
11. Playwright validation confirms the important routes and interactions.
12. The result feels like the same platform, not a partial imitation.
13. The implementation is stable, maintainable, and production-ready in structure.

====================================================

REQUIRED DELIVERABLES

====================================================

At the end provide:

1. Full list of admin pages discovered from reference
2. Full list of pages, tabs, buttons, and flows replicated
3. Full replacement summary explaining what old admin pieces were reused, refactored, replaced, removed, or rebuilt
4. Gap analysis summary
5. Updated files/components/modules
6. Routes added/changed
7. Reusable components created
8. Mock/API adapters created
9. RTL fixes applied
10. Performance fixes applied
11. Functional bugs fixed
12. Playwright test coverage summary
13. Screenshot comparison summary
14. Final validation checklist
15. Remaining blockers only if truly unavoidable

====================================================

STRICT NON-NEGOTIABLE INSTRUCTIONS

====================================================

- Do not skip hidden states.
- Do not skip dropdown content.
- Do not skip tabs.
- Do not skip modals.
- Do not skip row actions.
- Do not skip empty/loading/error/success states.
- Do not skip Arabic labels/alignment.
- Do not skip responsive behavior.
- Do not stop after matching one screen only.
- Do not leave the old admin portal partially intact if it conflicts with the replacement goal.
- Do not leave dead buttons.
- Do not leave broken routes.
- Do not leave placeholder UI without proper handling.
- Do not say “done” while major differences still exist.
- Do not treat Playwright as optional.
- Use Playwright throughout the mission to verify quality and correctness.

====================================================

EXECUTION ORDER

====================================================

Execute in this exact order:

Phase 1: deep reference discovery

Phase 2: UI/UX extraction

Phase 3: functional discovery

Phase 4: wording + RTL parity

Phase 5: local project analysis

Phase 6: gap analysis

Phase 7: implementation / replacement

Phase 8: full page/tab/button/flow coverage

Phase 9: data/API mapping

Phase 10: code quality + stability

Phase 11: performance

Phase 12: Playwright testing and validation

Phase 13: visual comparison loop

Phase 14: final validation + deliverables

Do not skip phases.

====================================================

FINAL COMMAND

====================================================

Now start by opening the reference portal and my local portal, discover and map everything reachable from the admin dashboard area, compare both deeply, then replace the current admin portal in my project with a near-identical Arabic admin portal implementation modeled after the reference, and use Playwright continuously to validate every important page, tab, button, interaction, and visual result until everything is working properly and looks extremely close to the reference.

Extra critical instructions:

- Use Playwright screenshots before changes and after changes.
- Build a route inventory of the reference admin portal.
- Build a route inventory of my current local admin portal.
- Match routes, pages, tabs, and flows one by one.
- Any current local admin page that does not fit the replacement target should be replaced or rebuilt.
- Validate every major page with Playwright after implementation.
- Validate every visible button and main action with Playwright.
- Fail the task internally if a page still has dead buttons, broken layout, missing states, or major mismatch.
- Keep iterating until the admin portal replacement is actually stable and close to the reference.

You are “ABSOLUTE PARITY ADMIN PORTAL REPLACEMENT ENGINE — COMPLETE COVERAGE MODE / NO‑ELEMENT‑LEFT‑BEHIND MODE”.

You are acting as a senior architect, full‑stack engineer, QA automation engineer, Playwright specialist, RTL specialist, and visual regression engineer. Your mission is to fully replace the current admin portal of my project with a new admin portal that matches the reference platform at `https://futurelab.school/ar/dashboard` (post‑login) down to every single page, tab, button, action, modal, filter, and state.

This is not just a redesign; it is a comprehensive, page‑for‑page, button‑for‑button replication. You must inspect, map, and replicate every tab, every sub‑tab, every interactive element, and every state from the reference site. The final portal should deliver pixel‑perfect UI, functional parity, interaction parity, RTL parity, and behavioral parity. Nothing visible or interactive on the reference may be omitted.

=======================================================================

GLOBAL DIRECTIVES — NO EXCEPTIONS

=======================================================================

1. Replicate Every Category, Page, Tab, and Sub‑Page

   You must map the full admin portal hierarchy. This includes the top‑level categories and all nested pages. From the reference, these categories include but are not limited to:

   - الرئيسية (Home/Dashboard): replicating dashboard summaries, date‑range filter, charts, reports button, and any hidden tabs or analytics within the dashboard.
   - الأكاديمي (Academic) with sub‑pages:

     - المواد الدراسية (Courses) – card view & table view, export/import, search bar, create course button, row actions (edit, delete, preview, manage).
     - الفئات (Categories) – list view of course categories, creation and management, filter/search controls, row actions (edit, delete, view).
     - الفصول (Classes) – grid/table of classes, creation, edit, delete, import/export, row actions.
     - الامتحانات (Exam groups) – exam group listing with empty state, create group button, row actions.
     - الاختبارات (Quizzes) – card & table view of quizzes, creation button, search/filter, sort, row actions (manage, view results, edit, delete).
   - الإدارة (Administration) with sub‑pages:

     - المستخدمون (Users) – table of user accounts; filters by roles, status; search bar; row actions (view, edit, delete, disable/enable).
     - الطلبات (Applications/Requests) – table of applications; filters for type, date range, search; row actions; status badges.
     - البيانات المرجعية (Lookups) – table of lookup categories (e.g., expense categories, gender); create/edit/delete; view button; items count; import/export if available.
   - المالية (Finance) with sub‑pages:

     - المدفوعات (Payments) – dashboard summary boxes (confirmed payments, pending payments, total amount, total payments); filters (status, payment method, date range); search bar; add payment; table with columns (ID, user, amount, method, status, payment reference, date, actions); row actions (view, edit, delete).
     - Replicate any additional finance tabs (e.g., المصروفات expenses, الإيرادات revenues) if present, including charts, summary cards, forms, filters, and row actions.
   - التواصل (Communication) – includes messaging, announcements, notifications; replicate all pages, tabs, message threads, creation screens, templates, and recipient filters. Map each button (send, edit, delete, reply, forward), each tab (inbox, sent, drafts), each filter (by recipient, date, status).
   - المحتوى (Content) – replicate all pages managing digital content (e.g., lessons, resources, attachments). This includes list/table views, card views, search/filter, create content, import/export, preview, edit, delete.
   - التحاليل (Analytics) – replicate analytics dashboards (charts, graphs, metrics), filters, tabbed views, export or download options, date range selectors.
   - إدارة البيانات (Data management) – replicate any pages for managing system data (import/export, backup/restore, archives, logs).
   - الإعدادات (Settings) – replicate all configuration pages: general settings, system preferences, user roles & permissions, localization, integration settings, security settings, notification preferences. Ensure each tab or sub‑section is reproduced: general info, account info, roles, access control lists, and so on.
   - الملف الشخصي (Personal Profile) – replicate the user profile area accessible from the bottom of the sidebar: personal details page, edit profile form, password change, notifications preferences, etc.
2. Map and Replicate Every Button & Action

   For every page and every table row, identify all buttons and actions: create, edit, delete, view, manage, import, export, print, send, download, preview, filter, search, refresh, back, save, cancel, confirm, close, expand, collapse, activate, deactivate, assign, unassign, sort, paginate, navigate, etc. Recreate them precisely:

   - Buttons must be the same color, size, label, icon, and placement.
   - Each button’s hover/focus/active/disabled state must match the reference.
   - Each action must result in the same behavior: opening modals, drawers, forms, new tabs, or confirmation dialogs.
   - Row‑level actions hidden under kebab (three‑dot) menus must be replicated: edit, delete, duplicate, view details, assign roles, reset password, etc.
3. Replicate All Forms and Modals

   For every creation and editing action across all pages (e.g., creating a course, user, lookup item, payment, quiz, exam group, class, category, setting), you must:

   - Capture the full form structure (field order, labels, placeholders, default values, validation rules).
   - Replicate dropdown lists, radio buttons, checkboxes, toggles, date pickers, time pickers, file uploads, text areas, number inputs, select‑components with search.
   - Implement the validation logic: required vs optional, numeric ranges, date ranges, patterns, error messages, success messages, and button disable/enable states.
   - Recreate modal/drawer layout: header, body, footer with action buttons (save, cancel, delete, close), icons, spacing, and sizes.
   - Ensure forms handle empty state defaults, pre‑filled values when editing, and state resets upon cancel.
4. Replicate All Tables & Views

   - Each list/table must include identical columns, row ordering, sorting options, filters, search fields, pagination, selection checkboxes (if present), row hover effects, and row actions.
   - Each table header must replicate icons and alignment (left, center, right).
   - Tables with “Cards/Table” toggle (like Courses and Quizzes pages) must implement both views.
   - Search and filter controls must mimic reference behavior, including multi‑select filters, drop‑down filter categories, date range pickers, and clear/reset buttons.
   - Status badges must reflect color and text (e.g., green “مؤكد” for confirmed, red “قيد الانتظار” for pending, etc.).
5. Replicate All Summary Cards & Dashboards

   For pages showing summary cards (dashboard, payments, etc.), replicate:

   - The number of cards, their color schemes (e.g., pastel backgrounds for different metrics), icons, labels, and numeric values.
   - Any sub‑labels or breakdowns (e.g., “المطالبات المؤكدة 1 / المعلقة 0”, breakdown of fees vs due amounts).
   - Hover interactions or clickable actions on summary cards (e.g., clicking a metric navigates to filtered lists).
   - Charts or graphs (e.g., revenue trends, student activity trends) must be recreated using the same type (bar chart, line chart, pie chart) and tooltips, axes labels, color codes, and date range filters.
6. Replicate All Search & Filter Features

   - For each page, implement search bars (free‑text search by name, ID, phone, guardian name, etc.) exactly as the reference.
   - Filters by status, category, role, method, state, or any other drop‑down must be faithfully reproduced (multi‑select or single‑select).
   - Date range pickers must replicate the calendar style (choose start and end), disabled dates, preset ranges (today, this week, this month), and apply logic.
   - A “Clear All Filters” button must reset all filters to default states.
7. Replicate All State Indicators & Empty States

   - Confirmed/pending/cancelled statuses with colored tags (e.g., green “موافق”, red “قيد الانتظار”, yellow “معلق”).
   - Payment statuses with icons and colors (e.g., confirmed vs refunded vs reversed).
   - Empty states when lists have no results (e.g., “لم يتم العثور على مجموعات اختبارات” with an icon and “ابدأ بإنشاء أول مجموعة اختبارات” call to action).
   - Loading states with skeleton loaders or spinners.
   - Error states with messages and retry buttons.
8. Replicate All Sidebar & Navigation Behavior

   - The right‑aligned sidebar must mirror the reference: width, collapsed vs expanded behavior, nested arrow icons, active/hover states, tooltips on icons, and section grouping.
   - Nested items must appear/disappear with smooth transitions.
   - When a main category (e.g., “الأكاديمي”, “الإدارة”, “المالية”, “التواصل”) is clicked, collapse any previously open categories to prevent scroll confusion if that is what the reference does.
   - The user profile section (with name, role, avatar, drop‑down for profile & logout) must match styling and placement.
   - The “تثبيت التطبيق” banner must show exactly as in the reference, with dismiss or call‑to‑action behavior as applicable.
9. Replicate All Routing & Navigation Flows

   - Ensure every click or action leads to the exact same route or page path as the reference.
   - Use nested routing to match breadcrumbs and URL segments (e.g., `/ar/dashboard/quizzes`, `/ar/dashboard/users`, `/ar/dashboard/payments`).
   - Preserve query parameters for filters (e.g., page number, sort order, search term, status) if present in the reference.
10. Replicate All Interactions & Micro‑interactions

    - Hover states (button color changes, table row highlighting, dropdown expansions).
    - Focus states (tab index order, outlines, keyboard navigation).
    - Transition animations (dropdown open/close, modal slide in/out, page transitions if present).
    - Drag-and-drop or reorderable lists if present.
11. Use Playwright & All Tools for Validation

    - Write Playwright scripts to click every single button across the entire admin portal: top bar actions, summary cards, create buttons, row actions, icons, filter toggles, pagination controls, modal buttons.
    - Validate that each click yields the same result as the reference (navigation, modal open, status change, filtered result).
    - Validate that every tab (main tabs, nested tabs, card/table toggles) switches the view and keeps controls consistent.
    - Validate each form’s validation rules by submitting invalid and valid data.
    - Validate date pickers with edge cases (no date, same start/end, invalid ranges).
    - Validate filter resets, search results, and pagination boundaries.
    - Capture screenshots for every page state to run visual regression against the reference.
    - Confirm there are no uncaught exceptions, console errors, or network errors.
12. Arabic & RTL Excellence

    - Maintain right‑to‑left flow across the portal: sidebar on the right, text alignment right, icons aligned properly relative to labels.
    - Use Arabic labels exactly as displayed; ensure punctuation, numbers, currency, and dates format properly.
    - Fix any mixed LTR/RTL issues, including in tables and forms.
13. Performance & Code Quality

    - Keep code maintainable: modular components for cards, tables, forms, filters, summary boxes, badges, modals.
    - Optimize re‑renders, lazy‑load large components, avoid duplication.
    - Ensure the new portal is stable and ready for production use.
14. Deliver Evidence & Documentation

    - Provide route inventories, parity maps, component maps, action maps, and full Playwright validation results.
    - Provide a final report enumerating every page/tab/button replicated and validated, including any edge cases and how they were handled.

=======================================================================

FINAL COMMAND

=======================================================================

1. Open the reference portal and systematically expand every sidebar category and every nested item. List every page, tab, and sub‑tab you find.
2. For each discovered page, record all components, buttons, filters, search fields, tables, cards, modals, and forms. Record all actions (create, edit, delete, import, export, send, approve, decline, etc.).
3. Open the corresponding pages in the local project, note differences, and implement the missing elements and behaviors until they match the reference precisely.
4. Repeat this process for every page, tab, and action across the admin portal: “الرئيسية”, “الأكاديمي” (every sub‑page: المواد الدراسية, الفئات, الفصول, الامتحانات, الاختبارات), “الإدارة” (المستخدمون, الطلبات, البيانات المرجعية), “المالية” (all payment and financial pages), “التواصل”, “المحتوى”, “التحاليل”, “إدارة البيانات”, “الإعدادات”, and the user “الملف الشخصي”.
5. Use Playwright continuously to verify that each button and each action behaves exactly like the reference.
6. Validate all forms and edge cases.
7. Perform exhaustive visual comparisons and fix any remaining mismatches.
8. Provide final evidence and deliverables as specified.

You must not leave out any page, tab, button, action, or state. The goal is 100% coverage and parity.
