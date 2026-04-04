# Language & RTL Inventory

**Date**: 2026-04-04  
**Primary locale**: Arabic (ar) — RTL  
**Secondary locale**: English (en) — LTR  

---

## RTL Infrastructure

| Item | Status | Detail |
|------|--------|--------|
| `dir="rtl"` on `<html>` | IMPLEMENTED | Set in `src/app/[locale]/layout.tsx` per locale |
| next-intl i18n | IMPLEMENTED | v4.7.0, messages in `/messages/ar.json` + `/messages/en.json` |
| Locale routing | IMPLEMENTED | `[locale]` segment in App Router |
| Language switcher | IMPLEMENTED | Toggle component exists |
| Arabic font (Tajawal) | IMPLEMENTED | Loaded via Google Fonts |

## RTL Issues to Fix

| # | Issue | Location | Fix Required |
|---|-------|----------|-------------|
| R1 | `ml-`/`mr-` usage | Multiple shared components | Replace with `ms-`/`me-` (logical properties) |
| R2 | `text-left`/`text-right` usage | Multiple components | Replace with `text-start`/`text-end` |
| R3 | `left-`/`right-` positioning | Absolute positioned elements | Replace with `start-`/`end-` |
| R4 | `pl-`/`pr-` usage | Multiple components | Replace with `ps-`/`pe-` |
| R5 | Sidebar slide direction | Mobile drawer (to create) | Use RTL-aware edge (right for RTL) |
| R6 | Icon mirroring | Arrow/chevron icons | Add `rtl:rotate-180` for directional icons |
| R7 | Arabic line-height | Body text | Set `leading-relaxed` or `leading-[1.8]` for Arabic |
| R8 | Number formatting | Dates, prices, stats | Verify Arabic numeral display preferences |

## i18n Translation Coverage

| Namespace | ar.json | en.json | Status |
|-----------|---------|---------|--------|
| `common.*` | ? | ? | Needs audit |
| `teacher.*` | ? | ? | Partial — raw keys observed on some pages |
| `student.*` | ? | ? | Needs audit |
| `admin.*` | ? | ? | Needs audit |
| `auth.*` | ? | ? | Needs audit |
| `navigation.*` | ? | ? | Needs audit |

> **Known issue**: Subject creation page renders raw keys like `teacher.subjects.createTitle` instead of translated text (documented in spec.md Issue #2).

---

## RTL Audit Approach (Phase 6)

1. Grep for physical properties (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`)
2. Replace with logical equivalents
3. Test each page in Arabic locale at all 3 breakpoints
4. Verify icon mirroring on directional icons
5. Check no horizontal overflow in RTL mode
