# Reference Page Inventory

## Public Page Families

| Family | Routes | Purpose | Section order | Mobile notes | States |
| --- | --- | --- | --- | --- | --- |
| Auth entry | `/login`, `/join` | Unified account access | Header, auth hero panel, tabbed form, helper/footer row | Mobile keeps single-column card and compact top controls | Validation, submit loading, auth error, join success |
| About | `/about` | Short brand/trust page | Badge, hero copy, stat cards, feature cards, CTA strip | Cards stack vertically and CTA buttons wrap | Static only |
| Services | `/services` | Explain offering families | Badge, title/body, 2-column card grid, CTA strip | Card grid collapses to single column | Static only |
| Contact | `/contact` | Lead/contact submission | Badge, heading/body, contact info cards, form | Form stacks below content, large inputs preserved | Idle, loading, success, error |
| Forgot password | `/forgot-password` | Reset request start | Header strip, single field form, success state, back link | Card stays centered and narrow | Idle, loading, success, error |

## Authenticated Page Families

| Family | Routes | Purpose | Section order | Repeated components | States |
| --- | --- | --- | --- | --- | --- |
| Dashboard shell | `/dashboard`, `/dashboard/profile`, `/dashboard/system-settings` | Main entry and account/system access | Right-side sidebar, sticky top bar, page title/subtitle, content panel, footer actions | Grouped nav buttons, install banner, account box, bottom-sheet mobile nav | Loading spinner, auth gate |
| Overview/KPI | `/dashboard`, `/dashboard/stats` | Summary metrics and quick actions | Header, stat cards, widgets, links to deeper routes | KPI cards, chart surfaces, bundle cards, date chips | Loading and partial-data tolerant |
| Content/CMS | `/dashboard/announcements`, `/dashboard/blogs`, `/dashboard/categories`, `/dashboard/cms`, `/dashboard/cms/*/edit`, `/dashboard/translations` | Content operations | CMS page list, edit/preview actions, language toggle, multi-section content editor | Cards, tabs, action buttons, language toggle, editor forms | Loading, empty, editor submit |
| Application/reporting | `/dashboard/applications`, `/dashboard/applications/[id]`, `/dashboard/admin/reports` | Enrollment funnel and reporting | Filters, table/list, detail/review actions, analytics tabs | Search, select filters, date filters, badges, pagination, detail CTA, tabs | Loading, empty, no-results, filter refresh |
| Finance utilities | `/dashboard/banks`, `/dashboard/coupons`, `/dashboard/currencies`, `/dashboard/expenses`, `/dashboard/payments`, `/dashboard/payslips`, `/dashboard/salaries` | Finance/admin support | KPI strip or filters, data table/list, action areas | Tables, badges, tabs, cards | Loading, empty, form/modifier states |
| Learning/admin lists | `/dashboard/courses`, `/dashboard/bundles`, `/dashboard/exams`, `/dashboard/quizzes`, `/dashboard/users` | Core academic/admin management | Page header, filters/search, list/table, actions | Lists, filters, cards, detail links | Loading, empty, no-results |
| Teacher drill-down | `/dashboard/teacher/courses`, `/dashboard/teacher/students` | Teacher-specific filtered views | Header, filtered list, teacher context | Reused list components | Filter and empty states |
| Scheduling/utilities | `/dashboard/upcoming-classes`, `/dashboard/backup`, `/dashboard/lookups`, `/dashboard/messages` | Operational/system support | Header, search or settings tabs, utility cards, empty workspace | Settings forms, search, empty states, conversation list | Loading and empty states |

## Local Interpretation Notes

- The reference uses a compact IA: few public pages, then a broad authenticated admin shell.
- Many authenticated routes appear to reuse a shared dashboard layout with route-specific content modules.
- Live browser verification corrected two earlier assumptions: `/dashboard/reports` and `/dashboard/admin/overview` were 404, while `/dashboard/admin/reports` was the real analytics route.
- Several internal route families were only visible in bundles, so local parity uses the nearest live admin surface where the reference could not be confirmed directly.
