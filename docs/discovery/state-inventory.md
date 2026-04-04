# State Inventory

**Date**: 2026-04-04  

---

## Required States Per Page Type

Every data-driven page MUST handle these 4 states:

| State | Trigger | UI Pattern | Component |
|-------|---------|-----------|-----------|
| **Loading** | Initial fetch or navigation | Skeleton placeholder | `loading.tsx` or inline `<Skeleton>` |
| **Empty** | API returns 0 items | Centered message + CTA | `<EmptyState>` (to create) |
| **Error** | API failure / network error | Error message + retry | `<ErrorPanel>` (to create) |
| **Success** | Data loaded | Full page content | Page component |

---

## State Coverage Audit

### Teacher Portal

| Page | Loading | Empty | Error | Success | Score |
|------|---------|-------|-------|---------|-------|
| teacher/home | ? | ? | ? | Yes | 1/4 |
| teacher/courses | ? | ? | ? | Yes | 1/4 |
| teacher/courses/[id] | ? | ? | ? | Yes | 1/4 |
| teacher/subjects | ? | ? | ? | Yes | 1/4 |
| teacher/grades | ? | ? | ? | Yes | 1/4 |
| teacher/grades/[id] | ? | ? | ? | Yes | 1/4 |
| teacher/assessments | ? | ? | ? | Yes | 1/4 |
| teacher/lessons | ? | ? | ? | Yes | 1/4 |
| teacher/calendar | ? | ? | ? | Yes | 1/4 |
| teacher/chat | ? | ? | ? | Yes | 1/4 |
| teacher/materials | ? | ? | ? | Yes | 1/4 |
| teacher/reels | ? | ? | ? | Yes | 1/4 |
| teacher/profile | ? | ? | ? | Yes | 1/4 |

### Student Portal

| Page | Loading | Empty | Error | Success | Score |
|------|---------|-------|-------|---------|-------|
| student/home | ? | ? | ? | Yes | 1/4 |
| student/courses | ? | ? | ? | Yes | 1/4 |
| student/courses/[id] | ? | ? | ? | Yes | 1/4 |
| student/assessments | ? | ? | ? | Yes | 1/4 |
| student/attendance | ? | ? | ? | Yes | 1/4 |
| student/calendar | ? | ? | ? | Yes | 1/4 |
| student/chat | ? | ? | ? | Yes | 1/4 |
| student/profile | ? | ? | ? | Yes | 1/4 |

### Admin Portal

| Page | Loading | Empty | Error | Success | Score |
|------|---------|-------|-------|---------|-------|
| admin/home | ? | ? | ? | Yes | 1/4 |
| admin/students | ? | ? | ? | Yes | 1/4 |
| admin/teachers | ? | ? | ? | Yes | 1/4 |
| admin/grades | ? | ? | ? | Yes | 1/4 |
| admin/grades/[id] | ? | ? | ? | Yes | 1/4 |
| admin/fees | ? | ? | ? | Yes | 1/4 |
| admin/attendance | ? | ? | ? | Yes | 1/4 |
| admin/meetings | ? | ? | ? | Yes | 1/4 |
| admin/support | ? | ? | ? | Yes | 1/4 |
| admin/settings | ? | ? | ? | Yes | 1/4 |

> **Note**: `?` marks require runtime verification. Most pages are expected to be 
> missing loading/empty/error states based on codebase audit. This will be updated 
> during Phase 3 implementation with actual verification.

---

## Implementation Plan for State Coverage

1. **Create `<EmptyState>` component** — `src/components/ui/empty-state.tsx`
2. **Create `<ErrorPanel>` component** — `src/components/ui/error-panel.tsx`
3. **Add `loading.tsx`** to every major route directory
4. **Wrap data fetches** with `DataState<T>` pattern (idle→loading→empty/error/success)
5. **Audit each page** during Phase 3 for all 4 states
