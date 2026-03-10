# Admin Parity Update — 2026-03-10

## Capture-backed reference sources used

- `futurelab-dashboard.png`
- `futurelab-scrape/courses.png`
- `futurelab-scrape/users.png`
- `futurelab-scrape/system-settings.png`
- `futurelab-dashboard.html`
- `futurelab-scrape/courses.html`
- `futurelab-scrape/users.html`
- `futurelab-scrape/system-settings.html`

## Implemented in this pass

- Updated the shared dashboard shell to align more closely with the captured reference IA and chrome:
  - Black active pills
  - Sidebar grouping/order aligned to the capture
  - Install-app banner
  - `reports` route surfaced directly in the shell
- Replaced the alias-only courses surface with a dedicated `/[locale]/dashboard/courses` page:
  - Search
  - Import/export actions
  - Card/table toggle
  - Create/edit/delete/preview flows
- Reworked `/[locale]/dashboard/users` to match the captured list page:
  - Search
  - Two filters
  - Add-user CTA
  - Table columns matching the capture
  - Ellipsis row actions
- Reworked `/[locale]/dashboard/system-settings` to match the captured settings structure:
  - Vertical settings nav
  - General settings form
  - Asset preview cards
  - Additional tabs reflected from the capture, including Google Drive and social/marketing sections
- Added `/dashboard/reports` to the tracked reference route inventory while keeping `/dashboard/admin/reports` compatibility.

## Verification completed

- `npx eslint` passed for the updated shell, routes, and reference inventory files.
- `npx jest src/__tests__/reference-route-inventory.test.ts --runInBand` passed.

## Validation blockers still present

- Headless Playwright launch is blocked in this environment by the Chromium sandbox/Mach port failure.
- Local `next dev` starts, but HTTP validation is unreliable here because the runtime stalls behind watcher/file-limit issues (`EMFILE`) and cache restore failures.
- `next build` did not complete cleanly in this session because the environment stalled on external font fetching and broader runtime instability unrelated to the edited dashboard files.

## Important scope note

- This pass improves only the reference-backed areas that were directly evidenced by the authenticated captures already stored in the repo.
- It does **not** claim 100% parity across every hidden tab, modal, or finance/content/analytics sub-flow in the live reference system.
