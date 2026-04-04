# Phase 0 — Environment & Baseline Capture

**Date**: 2026-04-04  
**Branch**: `002-virtual-meeting-rooms`  
**Status**: COMPLETE (with manual screenshot step pending)

---

## Environment Verified

| Item | Status | Detail |
|------|--------|--------|
| Node.js | 22.22.0 | LTS compatible |
| npm | 10.9.4 | Current |
| Package manager | yarn 1.22.22 | Declared in package.json |
| Dependencies installed | Yes | node_modules present (2.1 GB) |
| Playwright | 1.58.2 | Latest, browsers cached |
| Dev server | Running | Port 3000 (PID 36454) |
| TypeScript | 5.x | Via devDependencies |
| Next.js | 14.2.35 | App Router |
| React | 18.3.1 | Stable |

## Codebase Baseline

| Metric | Count |
|--------|-------|
| Total page.tsx (routes) | 169 |
| Total TS/TSX files | 577 |
| Total lines of code | 112,474 |
| Components | 153 |
| Library files | 62 |
| Production deps | 47 |
| Dev deps | 17 |

## Route Inventory

Full route inventory written to `docs/discovery/discovered-routes.md`.

| Portal | Routes |
|--------|--------|
| Public | 27 |
| Auth | 13 |
| Admin | 38 |
| Dashboard (legacy) | 32 |
| Teacher | 29 |
| Student | 15 |
| Parent | 11 |
| VR | 9 |
| Utility | 4 |
| Legacy | 12 |
| **Total** | **190** |

## Evidence Artifacts Created

| Artifact | Path | Status |
|----------|------|--------|
| Route inventory | `docs/discovery/discovered-routes.md` | Complete |
| Before metrics | `docs/evidence/performance/before-metrics.md` | Complete (static), runtime pending |
| Screenshot capture script | `tests/e2e/phase0-baseline-capture.spec.ts` | Written, needs manual run |
| Phase 0 config | `playwright.phase0.config.ts` | Written |
| Directory structure | `docs/evidence/screenshots/{before,after,reference}` | Created |
| Directory structure | `docs/evidence/performance/` | Created |
| Directory structure | `docs/evidence/playwright/{test-results,traces}` | Created |

## Manual Step Required

The sandbox environment blocks browser launch and localhost HTTP access. To capture baseline screenshots, run:

```bash
npx playwright test tests/e2e/phase0-baseline-capture.spec.ts --config=playwright.phase0.config.ts --reporter=list
```

This will save screenshots to `docs/evidence/screenshots/before/`.

## Existing Specification Landscape

| Spec | Path | Status |
|------|------|--------|
| FutureLab Full Parity | `specs/001-futurelab-full-parity/spec.md` | Draft (today) |
| FutureLab Parity | `specs/001-futurelab-parity/` | Partial implementation |
| Dashboard Parity | `specs/001-dashboard-parity/` | Partial implementation |
| Teacher Portal Redesign | `specs/001-teacher-portal-redesign/` | In progress |
| Teacher Portal E2E | `specs/001-teacher-portal-e2e/` | Test specs written |

## Key Observations

1. **Dual admin systems**: Two separate admin portal implementations exist — `/admin/` routes and `/(portal)/admin/` routes. Needs consolidation.
2. **Legacy dashboard**: 32 routes under `/dashboard/` appear to be an older implementation alongside the newer portal-specific routes.
3. **Heavy VR bundle risk**: Three.js ecosystem (3 packages) loaded globally despite only being needed for VR pages.
4. **Existing E2E infra**: 10+ existing test specs provide a foundation for Phase 8.
5. **i18n ready**: next-intl 4.7.0 with Arabic/English JSON message files in place.

---

## Phase 0 Sign-off

- [x] Dev environment verified and operational
- [x] Route inventory complete (190 routes documented)
- [x] Directory structure for evidence created
- [x] Before performance metrics captured (static analysis)
- [x] Baseline screenshot script written
- [ ] Baseline screenshots captured (requires manual run — sandbox limitation)
- [x] Phase 0 summary document written

**Phase 0 is complete. Proceeding to Phase 1: Deep Reference Discovery.**
