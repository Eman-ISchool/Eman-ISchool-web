# Test Plan

## Executed

| Check | Command/result | Status |
| --- | --- | --- |
| Auth helper unit test | `jest src/__tests__/auth-credentials.test.ts` | Passed |
| Mock auth fallback test | `jest src/__tests__/mock-auth-store.test.ts` | Passed |
| Reference route inventory unit test | `jest src/__tests__/reference-route-inventory.test.ts` | Passed |
| Dashboard applications helper test | `jest src/__tests__/dashboard-applications.test.ts` | Passed |
| Combined targeted Jest run | 4 suites, 11 tests | Passed |
| Targeted ESLint on changed web files | No output, exit 0 | Passed |
| Repo-wide TypeScript check | Failed on unrelated `eduverse-mobile` JSX syntax errors | Blocked by existing repo issues |
| Reference browser audit | Live Chrome remote-debug session, authenticated navigation across 25 routes | Passed |
| Reference screenshots | Desktop + mobile screenshots captured for dashboard, profile, applications, and system settings | Passed |
| Local browser validation | Local Next dev server compiles locale routes but resolves them to `/_not-found`; app-paths manifest only contains `/_not-found/page` | Blocked by existing runtime issue |

## Added Tests

- `src/__tests__/auth-credentials.test.ts`
- `src/__tests__/mock-auth-store.test.ts`
- `src/__tests__/reference-route-inventory.test.ts`
- `src/__tests__/dashboard-applications.test.ts`

## Intended Next Validation

1. Fix the local locale-route matcher issue so `/ar/*` and `/en/*` pages render in dev.
2. Run authenticated Playwright coverage for `/dashboard` and mapped routes.
3. Capture desktop/mobile Arabic screenshots for the local login, join, contact, dashboard, and the direct applications flow.
4. Re-run full `tsc --noEmit` after unrelated mobile syntax errors are fixed.
