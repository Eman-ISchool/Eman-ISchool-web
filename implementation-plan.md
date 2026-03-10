# Implementation Plan

## Completed

1. Reworked public marketing shell to match the reference IA more closely.
2. Replaced the role-card auth entry with a unified login/join surface.
3. Added phone-aware auth helpers and registration normalization.
4. Added missing public routes: about, services, contact, forgot-password alias, join alias.
5. Added a reference-style dashboard shell at `/[locale]/dashboard`.
6. Aliased core admin modules into direct `/dashboard/*` routes.
7. Added a catch-all `/dashboard/*` mapper for the remaining discovered route families.
8. Added route inventory and auth helper tests.
9. Added first-class applications list/detail coverage, CMS editors, reports, messages, and system settings parity passes.
10. Wrote the audit and evidence markdown artifacts.

## Remaining/Blocked

1. Local browser validation is blocked by the current Next dev runtime issue: locale routes compile but still resolve to `/_not-found`, and `.next/server/app-paths-manifest.json` only contains `/_not-found/page`.
2. Repo-wide `tsc --noEmit` is blocked by unrelated syntax errors in `eduverse-mobile`.
3. Some reference admin routes are only bundle-discovered, so current parity uses nearest live modules rather than bespoke one-to-one pages.
4. Forgot-password backend parity is limited by the existing email-reset API contract.
5. Production `next build` did not complete in a usable window during this pass, so local browser validation could not be recovered through `next start`.

## Follow-up Priority Order

1. Resolve the local route-matcher/runtime issue so `/ar/*` and `/en/*` pages render again in development.
2. Fix `eduverse-mobile` syntax errors so repo-wide typecheck is meaningful again.
3. Run local browser validation and screenshots against both desktop and mobile once the local route tree renders.
4. Replace mapped finance/content aliases with route-specific screens if backend/data requirements become available.
5. Add phone-code reset support if the backend API is extended beyond email reset.
