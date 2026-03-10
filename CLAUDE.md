# eduverse Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-19

## Active Technologies
- TypeScript 5.x with Next.js 14.2.35 + React 18.3.1, Supabase JS 2.78.0, NextAuth 4.24.13, RunwayML API, Zustand 5.0.9, TailwindCSS 4, next-intl 4.7.0 (024-ai-video-reels-pipeline)
- Supabase (PostgreSQL) + Supabase Storage for video files (024-ai-video-reels-pipeline)
- TypeScript 5.x, Next.js 14.2.35, Capacitor 6.x + @capacitor/core, @capacitor/cli, @capacitor/android, @capacitor/ios, @capacitor/splash-screen, @capacitor/status-bar, @capacitor/network, @capacitor/camera, @capacitor/filesystem (025-capacitor-mobile-wrapper)
- N/A (remote hosted - no local storage changes) (025-capacitor-mobile-wrapper)
- TypeScript 5.x with Next.js 14.2.35, React 18.3.1 + Capacitor 8.x (existing), next-pwa or Workbox for service worker, existing Supabase/NextAuth stack (026-mobile-build-packages)
- N/A (builds are file artifacts; no database changes required) (026-mobile-build-packages)
- TypeScript 5.x with React Native 0.76+ (New Architecture) + React Navigation 7.x, React Native Video, React Native Firebase, Zustand 5.x, react-i18next, react-native-keychain (027-react-native-port)
- AsyncStorage for preferences, Keychain/Encrypted SharedPreferences for tokens, existing Supabase PostgreSQL (via API) (027-react-native-port)
- TypeScript 5.x with Next.js 14.2.35, React 18.3.1 + NextAuth 4.24.13, Supabase JS 2.78.0, Zustand 5.0.9, TailwindCSS 4, next-intl 4.7.0, Capacitor 8.x (028-production-readiness-audit)
- Supabase (PostgreSQL) + Supabase Storage for media files (028-production-readiness-audit)
- TypeScript 5.x with Next.js 14.2.35 + React 18.3.1, NextAuth 4.24.13, Supabase JS 2.78.0, Stripe 14.14.0, TailwindCSS 4, next-intl 4.7.0, lucide-react 0.460.0 (030-education-platform)
- Supabase (PostgreSQL 15) + Supabase Storage (for material files and assignment submissions) (030-education-platform)
- TypeScript 5.x + Next.js 14.2.35 (App Router), Supabase JS 2.78.0, NextAuth 4.24.13, TailwindCSS v4, next-intl 4.7.0 (001-fix-portal-issues)
- Supabase (PostgreSQL 15) — schema unchanged (001-fix-portal-issues)
- TypeScript 5.x with Next.js 14.2.35 + React 18.3.1 + NextAuth 4.24.13, Supabase JS 2.78.0, next-intl 4.7.0, TailwindCSS v4, lucide-reac (001-fix-platform-issues)
- Supabase (PostgreSQL 15) — schema additive change (3 columns on `lessons`) (001-fix-platform-issues)
- TypeScript 5.x with Next.js 14.2.35 (App Router) + `googleapis` (already installed), `@supabase/supabase-js`, `next-auth` 4.24.13, `lucide-react` (001-fix-meet-link)
- Supabase PostgreSQL — `lessons` table (`meet_link`, `google_event_id`) + `meetings` table (lifecycle tracking) (001-fix-meet-link)
- TypeScript 5.x with Next.js 14.2.35 (App Router) + React 18.3.1 + next-intl 4.7.0 (i18n), NextAuth 4.24.13 (auth), Supabase JS 2.78.0 (DB client), TailwindCSS v4 (styling), lucide-react (icons), shadcn/ui (components) (001-teacher-portal-redesign)
- Supabase PostgreSQL 15 (hosted). Tables: `grades`, `subjects`, `courses`, `lessons`, `materials`, `enrollments`. New table: `course_modules` (P3). (001-teacher-portal-redesign)
- TypeScript 5.x + Next.js 14.2.35, React 18.3.1, next-intl 4.7.0, NextAuth 4.24.13, Supabase JS 2.78.0, TailwindCSS v4, lucide-reac (001-fix-tab-perf)
- Supabase (PostgreSQL 15) — schema unchanged; JWT token extended with `role` field (001-fix-tab-perf)
- TypeScript 5.x with Next.js 14.2.35 + React 18.3.1 + NextAuth 4.24.13, Supabase JS 2.78.0, TailwindCSS v4, next-intl 4.7.0, lucide-react, shadcn/ui components (001-lms-grade-hierarchy)
- Supabase (PostgreSQL 15) — schema additive changes only (no destructive drops) (001-lms-grade-hierarchy)
- TypeScript 5.x with Next.js 14.2.35 (App Router) + React 18.3.1 + Supabase JS 2.78.0, NextAuth 4.24.13, googleapis 169.0.0, next-intl 4.7.0, TailwindCSS v4, shadcn/ui, lucide-react, Playwright (E2E) (001-teacher-portal-e2e)
- Supabase PostgreSQL 15 (hosted) — tables: `courses`, `lessons`, `lesson_meetings`, `enrollments`, `attendance`, `users` (001-teacher-portal-e2e)
- TypeScript 5.x with Next.js 14.2.35 + next-intl 4.7.0, NextAuth 4.24.13, Supabase JS 2.78.0, TailwindCSS v4, shadcn/ui (Radix UI), lucide-react 0.460.0, Playwright 1.58.2 (001-futurelab-parity)
- Supabase PostgreSQL 15 (schema unchanged — no migrations) (001-futurelab-parity)
- TypeScript 5.x with Next.js 14.2.35 (App Router) + next-intl 4.7.0, NextAuth 4.24.13, Supabase JS 2.78.0, TailwindCSS v4, shadcn/ui (Radix UI), lucide-react 0.460.0, Recharts (area/bar/pie charts), Playwright 1.58.2 (001-dashboard-parity)
- Supabase PostgreSQL 15 (schema unchanged) + mock data layer (`reference-dashboard-data.ts`, `dashboard-applications.ts`, `mock-auth-store.ts`) (001-dashboard-parity)

- TypeScript 5.x with Next.js 14.2.35 + React 18.3.1, Supabase JS, googleapis 169.0.0, NextAuth 4.24.13, Zustand 5.0.9 (023-multi-session-meet-fix)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x with Next.js 14.2.35: Follow standard conventions

## Recent Changes
- 001-dashboard-parity: Added TypeScript 5.x with Next.js 14.2.35 (App Router) + next-intl 4.7.0, NextAuth 4.24.13, Supabase JS 2.78.0, TailwindCSS v4, shadcn/ui (Radix UI), lucide-react 0.460.0, Recharts (area/bar/pie charts), Playwright 1.58.2
- 001-futurelab-parity: Added TypeScript 5.x with Next.js 14.2.35 + next-intl 4.7.0, NextAuth 4.24.13, Supabase JS 2.78.0, TailwindCSS v4, shadcn/ui (Radix UI), lucide-react 0.460.0, Playwright 1.58.2
- 001-teacher-portal-e2e: Added TypeScript 5.x with Next.js 14.2.35 (App Router) + React 18.3.1 + Supabase JS 2.78.0, NextAuth 4.24.13, googleapis 169.0.0, next-intl 4.7.0, TailwindCSS v4, shadcn/ui, lucide-react, Playwright (E2E)


<!-- MANUAL ADDITIONS START -->

## Speckit Workflow
- Speckit skills (/speckit.specify, /speckit.clarify, /speckit.plan, /speckit.tasks, /speckit.analyze) are custom skills defined in `.claude/skills/`. They do NOT depend on external scripts or framework files in the repo. Always execute them as markdown-based skill instructions, never search for speckit scripts/binaries in the project.
- The standard speckit pipeline order is: specify → clarify → plan → tasks → (optionally) analyze and issues.
- Default spec artifact paths: `specs/<feature-name>/spec.md`, `specs/<feature-name>/tasks.md`, `specs/<feature-name>/plan.md`, etc.

## GitHub & Git
- This project may not have a GitHub remote configured. Before attempting `gh` CLI operations (e.g., creating issues), first verify a remote exists with `git remote -v`. If no remote, skip GitHub operations and inform the user instead of failing.

## Rate Limit Awareness
- When running multi-step pipelines (e.g., specify → clarify → plan → tasks → analyze), prioritize completing each step fully before moving to the next. If approaching conversation length limits, summarize progress and list remaining steps so the user can continue in the next session.
- Do NOT start a new pipeline step if the previous one hasn't been saved to disk.

## Project Context
- This is an Arabic educational platform (Eduverse) built with Next.js/TypeScript.
- When working in git worktrees, always verify which directory the dev server is running from before making API calls. Use `lsof -i :<port>` or check the process to confirm.
- Primary languages: TypeScript, Markdown (for specs). Spec artifacts are written in Markdown.

## Speckit Analysis & Remediation
- When running /speckit.analyze, apply all remediation edits in a single pass and re-run analysis once to verify. Do not loop analysis more than 2-3 times — if LOW-severity issues persist after 2 remediation rounds, report them and stop.
- Always edit the actual spec files (spec.md, tasks.md, plan.md) directly rather than creating separate remediation documents.

<!-- MANUAL ADDITIONS END -->
