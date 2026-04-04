# Responsive Inventory

**Date**: 2026-04-04  
**Breakpoints**: Desktop (1440px), Tablet (768px), Mobile (390px)  

---

## Expected Responsive Behaviors (from Reference)

| Component | Desktop (1440px) | Tablet (768px) | Mobile (390px) |
|-----------|-----------------|-----------------|----------------|
| **Sidebar** | Always visible, expanded | Collapsed to icons | Hidden — hamburger trigger |
| **Top header** | Full width, all items | Full width, compact | Full width, hamburger + logo |
| **Card grid** | 3 columns | 2 columns | 1 column (stacked) |
| **Data tables** | Full table | Scrollable horizontal | Card/list view transform |
| **Tabs** | All visible | All visible | Horizontal scroll |
| **Forms** | Multi-column where applicable | Single column | Single column |
| **Modals** | Centered overlay | Centered overlay | Bottom sheet / full-screen |
| **Footer** | Multi-column grid | 2-column grid | Single column stacked |
| **Charts/graphs** | Full size | Reduced size | Minimal / scrollable |
| **Touch targets** | N/A | 44px minimum | 44px minimum |

---

## Current Responsive Status (Requires Runtime Verification)

| Route Category | Desktop | Tablet | Mobile | Notes |
|---------------|---------|--------|--------|-------|
| Public landing | ? | ? | ? | Need to verify layout stacking |
| Login/Register | ? | ? | ? | Forms should be single-column on mobile |
| Admin dashboard | ? | ? | ? | Sidebar behavior critical |
| Teacher portal | ? | ? | ? | Sidebar + data tables |
| Student portal | ? | ? | ? | Sidebar + course cards |
| Parent portal | ? | ? | ? | Sidebar + invoices |

---

## Known Responsive Issues (from Research)

1. **No unified mobile drawer navigation** — sidebar doesn't collapse to hamburger menu on mobile
2. **Tables may overflow** on mobile without card transformation
3. **Tab bar scroll** not confirmed on narrow viewports
4. **Touch targets** not audited for 44px minimum compliance

---

## Responsive Test Script

Baseline screenshot capture script at `tests/e2e/phase0-baseline-capture.spec.ts` includes 3 breakpoint captures for key pages. Run manually to populate evidence.
