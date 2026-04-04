# Reference Component Inventory

**Source**: Visual audit of futurelab.school + codebase analysis  
**Date**: 2026-04-04  

---

## Navigation Components

| # | Component | Reference Behavior | Eduverse Status |
|---|-----------|-------------------|-----------------|
| C01 | **Header Nav** | Logo, nav links (About/Services/Contact), language toggle (AR/EN), Login/Join CTAs | Exists — needs marketing link parity |
| C02 | **Footer** | Site links, newsletter form, social links, legal links | Exists — needs section parity |
| C03 | **Sidebar Nav** | Collapsible categories (9), active state highlight, icon + label, badge counts, RTL-aligned | Exists — multiple implementations need consolidation |
| C04 | **Mobile Drawer Nav** | Hamburger trigger, slide-in from correct edge (RTL: right), same items as sidebar | **MISSING** — no unified mobile drawer |
| C05 | **Top Header (Auth)** | Profile avatar, notifications bell, language toggle, search | Exists — partial |
| C06 | **Breadcrumbs** | Path trail on nested pages | Exists — inconsistent across portals |
| C07 | **Tab Bar** | Underline-active style, horizontal scroll on mobile | Exists via shadcn Tabs |

## Content Components

| # | Component | Reference Behavior | Eduverse Status |
|---|-----------|-------------------|-----------------|
| C08 | **KPI Card** | Metric value, label, trend indicator, icon | Exists in admin dashboard |
| C09 | **Course Card** | Title, instructor, status badge, duration, action buttons | Exists — needs status badge |
| C10 | **Data Table** | Sortable columns, pagination, row actions (edit/delete/view), search | Exists — varies by page |
| C11 | **Status Badge** | Colored pill: active (green), upcoming (blue), completed (gray), cancelled (red) | Partial — needs standardization |
| C12 | **Avatar** | User image circle, fallback initials | Exists |
| C13 | **Stats Counter** | Large number, label, optional comparison | Exists in dashboard |

## Form Components

| # | Component | Reference Behavior | Eduverse Status |
|---|-----------|-------------------|-----------------|
| C14 | **Text Input** | Label above, error below, full-width, focus ring, RTL text alignment | Exists via shadcn |
| C15 | **Password Input** | Same + visibility toggle eye icon | **Needs upgrade** — toggle may be missing |
| C16 | **Country Code Selector** | Dropdown with flag + code, search, common countries first | **MISSING** on login |
| C17 | **Phone Input** | Country code selector + number input combined | **MISSING** on login |
| C18 | **Select/Dropdown** | Label, options list, search filter, RTL-aware | Exists via shadcn |
| C19 | **Date Picker** | Calendar popup, range selection | Exists |
| C20 | **Form Error Message** | Red text below field, icon, Arabic message | Exists — needs consistency |
| C21 | **Form Success Toast** | Temporary success notification | Exists via toast system |

## State Components

| # | Component | Reference Behavior | Eduverse Status |
|---|-----------|-------------------|-----------------|
| C22 | **Loading Skeleton** | Placeholder shapes matching content layout | Exists (`skeleton.tsx`) |
| C23 | **Empty State** | Centered icon, title, description, optional CTA button | **MISSING** — no shared component |
| C24 | **Error Panel** | Error icon, message, retry button | **MISSING** — no shared component |
| C25 | **Page Loading** | Full-page skeleton via `loading.tsx` | Partial — not all routes have `loading.tsx` |

## Overlay Components

| # | Component | Reference Behavior | Eduverse Status |
|---|-----------|-------------------|-----------------|
| C26 | **Modal/Dialog** | Centered overlay, close button, title, content, action buttons | Exists via shadcn Dialog |
| C27 | **Drawer/Sheet** | Side-sliding panel, RTL-aware edge | Exists via shadcn Sheet |
| C28 | **Dropdown Menu** | Triggered by button/avatar, positioned correctly in RTL | Exists via shadcn |
| C29 | **Toast/Notification** | Corner-positioned, auto-dismiss, success/error/info variants | Exists |
| C30 | **Confirmation Dialog** | "Are you sure?" pattern with confirm/cancel | Exists — not standardized |

## Interactive Components

| # | Component | Reference Behavior | Eduverse Status |
|---|-----------|-------------------|-----------------|
| C31 | **Status Filter Tabs** | All/Active/Upcoming/Completed with counts | **Needs creation** |
| C32 | **Search Input** | Debounced, icon, clearable, RTL placeholder | Exists — partial |
| C33 | **Pagination** | Page numbers, prev/next, items per page | Exists — varies |
| C34 | **Sort Controls** | Column header click, direction indicator | Partial |
| C35 | **Language Switcher** | AR/EN toggle, layout direction changes | Exists |
| C36 | **Theme Toggle** | Light/dark mode (if applicable) | Partial |

## Layout Components

| # | Component | Reference Behavior | Eduverse Status |
|---|-----------|-------------------|-----------------|
| C37 | **Page Header** | Title + subtitle + action button (e.g., "Create Course") | Exists — not standardized |
| C38 | **Section Header** | Title + optional "View All" link | Exists — not standardized |
| C39 | **Card Grid** | Responsive grid: 3-col desktop, 2-col tablet, 1-col mobile | Exists |
| C40 | **Two-Panel Layout** | List panel + detail panel (e.g., messages) | Exists for messages |

---

## Gap Summary

| Status | Count | Components |
|--------|-------|-----------|
| Exists (full) | 21 | C01-C03, C05, C07-C10, C12-C14, C18-C19, C21-C22, C26-C29 |
| Exists (needs upgrade) | 9 | C06, C11, C15, C20, C25, C30, C32-C34 |
| **MISSING** | 6 | **C04 (MobileDrawerNav), C16 (CountryCodeSelector), C17 (PhoneInput), C23 (EmptyState), C24 (ErrorPanel), C31 (StatusFilterTabs)** |
| Not standardized | 4 | C35, C37, C38, C40 |

**Critical missing components**: MobileDrawerNav, EmptyState, ErrorPanel, CountryCodeSelector, PhoneInput, StatusFilterTabs
