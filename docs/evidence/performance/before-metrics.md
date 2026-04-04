# Performance Baseline — BEFORE Metrics

**Captured**: 2026-04-04  
**Branch**: `002-virtual-meeting-rooms`  
**Commit**: `e6e5699`  

---

## Codebase Size

| Metric | Value |
|--------|-------|
| Total page.tsx files | 169 |
| Total TS/TSX files | 577 |
| Total lines of code | 112,474 |
| Component files | 153 |
| Library/utility files | 62 |
| node_modules size | 2.1 GB |
| Production dependencies | 47 |
| Dev dependencies | 17 |

## Route Counts

| Portal | Routes |
|--------|--------|
| Public pages | 27 |
| Auth pages | 13 |
| Admin portal | 38 |
| Dashboard (legacy) | 32 |
| Teacher portal | 29 |
| Student portal | 15 |
| Parent portal | 11 |
| VR/Eduverse | 9 |
| Utility/Test | 4 |
| Legacy non-locale | 12 |
| **Total** | **190** |

## Runtime Performance (TO BE CAPTURED)

> **Note**: Runtime metrics (page load times, Core Web Vitals, bundle sizes) require 
> browser access. Run the following command to capture:
> 
> ```bash
> npx playwright test tests/e2e/phase0-baseline-capture.spec.ts --config=playwright.phase0.config.ts
> ```
> 
> Then update this section with:
> - First Contentful Paint (FCP) per route
> - Largest Contentful Paint (LCP) per route
> - Total Blocking Time (TBT)
> - Cumulative Layout Shift (CLS)
> - Bundle size analysis from `next build`

## Key Dependencies Impacting Bundle

| Package | Version | Impact |
|---------|---------|--------|
| next | 14.2.35 | Framework core |
| react | 18.3.1 | UI runtime |
| three | 0.171.0 | 3D rendering (VR pages) — heavy |
| @react-three/fiber | 8.18.0 | React Three.js bridge — heavy |
| @react-three/drei | 9.122.0 | Three.js helpers — heavy |
| recharts | 3.8.0 | Charting — moderate |
| sanity | 3.99.0 | CMS — moderate |
| styled-components | 6.1.19 | CSS-in-JS — moderate |
| @supabase/supabase-js | 2.78.0 | DB client |
| googleapis | 169.0.0 | Google API — heavy |
| openai | 6.16.0 | AI API — moderate |
| stripe | 14.14.0 | Payments — moderate |

## Observations

1. **Three.js ecosystem** (three, fiber, drei, xr) is likely the largest bundle contributor and only used on VR pages — candidate for aggressive code splitting.
2. **googleapis** is a heavy package — should be server-side only.
3. **sanity** CMS package adds significant weight — verify it's tree-shaken properly.
4. **styled-components** alongside TailwindCSS is redundant — candidate for removal if not critical.
5. Total 190 routes is substantial — confirms need for route-level code splitting.
