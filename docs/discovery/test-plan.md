# Test Plan — FutureLab Full Parity E2E

**Date**: 2026-04-04  
**Framework**: Playwright 1.58.2  
**Config**: `playwright.config.ts` (main) + `playwright.phase0.config.ts` (no webServer)  

---

## Test Categories

### 1. Route Coverage Tests

Visit every major route; assert page loads (no crash, correct title/H1).

```
tests/e2e/parity/
  routes/
    public-routes.spec.ts          — all public pages
    auth-routes.spec.ts            — login, register, forgot-password
    teacher-routes.spec.ts         — all 29 teacher routes
    student-routes.spec.ts         — all 15 student routes
    admin-routes.spec.ts           — all 38 admin routes
    parent-routes.spec.ts          — all 11 parent routes
```

### 2. Navigation Tests

```
tests/e2e/parity/
  navigation/
    sidebar.spec.ts                — click every sidebar item, verify navigation
    topbar.spec.ts                 — profile menu, notifications, language switch
    tabs.spec.ts                   — grade/course detail tabs (7 tabs)
    mobile-drawer.spec.ts          — hamburger open/close, nav items, RTL edge
    breadcrumbs.spec.ts            — breadcrumb navigation on nested pages
    back-cancel.spec.ts            — back/cancel flows on forms
```

### 3. Button Coverage Tests

```
tests/e2e/parity/
  buttons/
    create-actions.spec.ts         — create course, lesson, assessment, subject
    row-actions.spec.ts            — edit, delete, view on table rows
    auth-actions.spec.ts           — login, register, forgot password, OAuth
    meeting-actions.spec.ts        — join meeting, start meeting
```

### 4. Form Coverage Tests

```
tests/e2e/parity/
  forms/
    login-form.spec.ts             — valid/invalid/empty submissions
    register-form.spec.ts          — valid/invalid submissions
    course-form.spec.ts            — create/edit course
    lesson-form.spec.ts            — create/edit lesson
    assessment-form.spec.ts        — create/edit assessment
    profile-form.spec.ts           — edit profile
```

### 5. Table Coverage Tests

```
tests/e2e/parity/
  tables/
    student-table.spec.ts          — rows, pagination, sort, search
    course-table.spec.ts           — rows, filter tabs, search
    attendance-table.spec.ts       — rows, date filter
```

### 6. State Coverage Tests

```
tests/e2e/parity/
  states/
    loading-states.spec.ts         — verify skeletons appear on data pages
    empty-states.spec.ts           — verify empty state component on empty data
    error-states.spec.ts           — verify error panel on API failure
```

### 7. RBAC Tests

```
tests/e2e/parity/
  rbac/
    unauthorized-access.spec.ts    — wrong role → 403 or redirect
    role-routing.spec.ts           — correct role → correct portal
```

### 8. Meet Link Tests

```
tests/e2e/parity/
  meet/
    meet-link-equality.spec.ts     — same meetLink seen by teacher and student
    meet-link-persistence.spec.ts  — link persists after page refresh
```

### 9. RTL Tests

```
tests/e2e/parity/
  rtl/
    dir-attribute.spec.ts          — `dir="rtl"` present on all Arabic pages
    no-overflow.spec.ts            — no horizontal overflow on any page
    alignment.spec.ts              — text and icons align correctly
```

### 10. Responsive Tests

```
tests/e2e/parity/
  responsive/
    desktop-1440.spec.ts           — key pages at 1440px
    tablet-768.spec.ts             — key pages at 768px
    mobile-390.spec.ts             — key pages at 390px
```

### 11. Visual Regression Tests

```
tests/e2e/parity/
  visual/
    screenshot-comparison.spec.ts  — screenshot all pages, compare to baseline
```

---

## Execution Commands

```bash
# Full suite
npx playwright test tests/e2e/parity/ --reporter=list

# Single category
npx playwright test tests/e2e/parity/routes/ --reporter=list

# With trace on failure
npx playwright test tests/e2e/parity/ --trace on

# Headed (visual debug)
npx playwright test tests/e2e/parity/ --headed

# Update visual baselines
npx playwright test tests/e2e/parity/visual/ --update-snapshots
```

---

## Failure Protocol

1. Trace + screenshot + console log captured automatically (Playwright config)
2. Identify root cause (file + line + why)
3. Fix permanently
4. Add regression test for exact failure
5. Re-run failed spec
6. Re-run full suite
7. Suite must be green before phase completion
