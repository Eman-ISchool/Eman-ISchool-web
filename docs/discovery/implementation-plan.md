# Implementation Plan — FutureLab Full Parity

**Date**: 2026-04-04  
**Branch**: `002-virtual-meeting-rooms`  
**Based on**: Parity matrix (58.75% match, 96.25% route coverage)  

---

## Phase 2: UI System Extraction + Design Approximation

### 2.1 Create Missing Shared Components

| # | Component | File | Priority |
|---|-----------|------|----------|
| 1 | `EmptyState` | `src/components/ui/empty-state.tsx` | P1 |
| 2 | `ErrorPanel` | `src/components/ui/error-panel.tsx` | P1 |
| 3 | `MobileDrawerNav` | `src/components/ui/mobile-drawer-nav.tsx` | P1 |
| 4 | `StatusFilterTabs` | `src/components/ui/status-filter-tabs.tsx` | P1 |
| 5 | `CountryCodeSelector` | `src/components/ui/country-code-selector.tsx` | P2 |
| 6 | `PhoneInput` | `src/components/ui/phone-input.tsx` | P2 |
| 7 | `PageHeader` (standardized) | `src/components/ui/page-header.tsx` | P2 |

### 2.2 Add `loading.tsx` to Major Routes

Add skeleton-based `loading.tsx` files to all data-driven route directories:
- `src/app/[locale]/teacher/courses/loading.tsx`
- `src/app/[locale]/teacher/grades/loading.tsx`
- `src/app/[locale]/teacher/assessments/loading.tsx`
- `src/app/[locale]/student/courses/loading.tsx`
- `src/app/[locale]/admin/home/loading.tsx`
- `src/app/[locale]/admin/students/loading.tsx`
- (All other data-driven routes)

---

## Phase 3: Implementation (Page by Page)

### 3.1 Public Pages

| # | Page | Work Required |
|---|------|--------------|
| 1 | Landing (`/[locale]/page.tsx`) | Add feature cards, service sections, testimonials, partner logos |
| 2 | Join (`/[locale]/join/page.tsx`) | Add hero, 6 feature cards, 4 services, testimonials, stats, FAQ, team, newsletter |
| 3 | Login | Upgrade to phone+country code, add password toggle, add OAuth buttons |
| 4 | About, Services, Contact | Content audit and fill gaps |

### 3.2 Teacher Portal Upgrades

| # | Page | Work Required |
|---|------|--------------|
| 1 | Course list | Add status filter tabs (All/Active/Upcoming/Completed) |
| 2 | Course detail | Implement full 7-tab layout |
| 3 | Grade detail | Verify/complete 7-tab layout |
| 4 | All data pages | Add loading/empty/error states |
| 5 | Dashboard home | Verify widget parity |

### 3.3 Student Portal Upgrades

| # | Page | Work Required |
|---|------|--------------|
| 1 | Dashboard home | Verify widget/section parity |
| 2 | All data pages | Add loading/empty/error states |

### 3.4 Admin Portal Consolidation

| # | Work | Detail |
|---|------|--------|
| 1 | Consolidate dual admin routes | Merge `/admin/` and `/(portal)/admin/` implementations |
| 2 | Consolidate messages route | Move from `/dashboard/messages` to admin portal |
| 3 | All data pages | Add loading/empty/error states |

---

## Phase 4: RBAC Enforcement

| # | Work | Detail |
|---|------|--------|
| 1 | Audit middleware | Verify role-based route protection in `middleware.ts` |
| 2 | Add route guards | Ensure admin routes reject student/teacher, etc. |
| 3 | API protection | Verify API routes check session role |
| 4 | Test unauthorized access | 403 or redirect for wrong role |

---

## Phase 5: Google Meet Real Link Generation

| # | Work | Detail |
|---|------|--------|
| 1 | Verify googleapis setup | Check Google Calendar API credentials |
| 2 | Real Meet link creation | Ensure lessons create actual Google Meet links |
| 3 | Meet link persistence | Store in `lessons` table (`meet_link` column) |
| 4 | Cross-role equality | Same link visible to teacher and student |

---

## Phase 6: Arabic RTL + i18n Excellence

| # | Work | Detail |
|---|------|--------|
| 1 | Replace physical → logical CSS | `ml-`→`ms-`, `mr-`→`me-`, etc. |
| 2 | Fix icon mirroring | Add `rtl:rotate-180` to directional icons |
| 3 | Arabic typography | Set relaxed line-height for Arabic body text |
| 4 | i18n key audit | Find and fix all raw key rendering |
| 5 | Test at all breakpoints | Desktop, tablet, mobile in Arabic |

---

## Phase 7: Performance Optimization

| # | Work | Detail |
|---|------|--------|
| 1 | Lazy-load Three.js | `React.lazy` + `Suspense` for VR components |
| 2 | Lazy-load heavy deps | googleapis server-only, OpenAI server-only |
| 3 | Run `next build` | Capture bundle size analysis |
| 4 | Core Web Vitals | Measure FCP, LCP, TBT, CLS |
| 5 | Compare BEFORE/AFTER | Document deltas |

---

## Phase 8: Playwright E2E Automation

See `docs/discovery/test-plan.md` for full test plan.

---

## Phase 9: Evidence Pack + Final Report

All artifacts listed in the specification's Phase 9 requirements.
