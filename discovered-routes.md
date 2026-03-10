# Discovered Routes

## Method

- Public discovery used direct HTTP fetches of `https://futurelab.school/ar/*` plus alternate locale links.
- Authenticated discovery used secure NextAuth credential login, session inspection, dashboard HTML, route extraction from shipped JS bundles, and a live Chrome remote-debug session after manual user login.
- Evidence levels below are `confirmed-html`, `confirmed-auth-session`, `confirmed-browser`, or `bundle-discovered`.

## Public Route Families

| Route family | Locale | Access | Evidence | Key notes | Local status |
| --- | --- | --- | --- | --- | --- |
| `/login` | `/ar`, `/en` | Public | confirmed-html | Unified entry card, phone-first login, locale toggle, mobile menu | Implemented |
| `/join` | `/ar`, `/en` | Public | confirmed-html | Same auth surface as login, join tab, CTA parity | Implemented |
| `/about` | `/ar`, `/en` | Public | confirmed-html | Short marketing page, trust blocks, CTA pair | Implemented |
| `/services` | `/ar`, `/en` | Public | confirmed-html | Service cards, compact section order, CTA footer band | Implemented |
| `/contact` | `/ar`, `/en` | Public | confirmed-html | Contact hero plus form submission state | Implemented |
| `/forgot-password` | `/ar`, `/en` | Public | confirmed-html | Password reset request page, back-to-login link | Implemented, partial backend parity |

## Authenticated Route Families

| Route family | Evidence | Key notes | Local status |
| --- | --- | --- | --- |
| `/dashboard` | confirmed-auth-session | Primary post-login shell | Implemented |
| `/dashboard/profile` | confirmed-html | Profile/account entry in shell footer/menu | Implemented |
| `/dashboard/admin/reports` | confirmed-browser | Live analytics route reached from the dashboard CTA | Implemented |
| `/dashboard/announcements` | bundle-discovered | Content/announcement management | Implemented via route mapper |
| `/dashboard/applications` | confirmed-browser | Enrollment/application list with search, filters, pagination, and detail CTA | Implemented |
| `/dashboard/applications/[id]` | confirmed-browser | Detail drill-down reached from the application row action | Implemented |
| `/dashboard/backup` | bundle-discovered | System utility route | Implemented via route mapper |
| `/dashboard/banks` | bundle-discovered | Finance-related utility route | Implemented via route mapper |
| `/dashboard/blogs` | bundle-discovered | CMS/blog management | Implemented via route mapper |
| `/dashboard/bundles` | bundle-discovered | Course/package grouping route | Implemented via route mapper |
| `/dashboard/categories` | bundle-discovered | Taxonomy/content categories | Implemented via route mapper |
| `/dashboard/cms` | confirmed-browser | CMS surface listing managed pages with edit/preview actions | Implemented |
| `/dashboard/coupons` | bundle-discovered | Finance/discount management | Implemented via route mapper |
| `/dashboard/courses` | bundle-discovered | Course or lesson list | Implemented |
| `/dashboard/currencies` | bundle-discovered | Currency management | Implemented via route mapper |
| `/dashboard/exams` | bundle-discovered | Assessment management | Implemented via route mapper |
| `/dashboard/expenses` | bundle-discovered | Expense management | Implemented via route mapper |
| `/dashboard/lookups` | bundle-discovered | System lookup data | Implemented via route mapper |
| `/dashboard/messages` | bundle-discovered | Messages/audit area | Implemented |
| `/dashboard/payments` | bundle-discovered | Payments/fees route | Implemented via route mapper |
| `/dashboard/payslips` | bundle-discovered | Payroll-related route | Implemented via route mapper |
| `/dashboard/quizzes` | bundle-discovered | Quiz/exam area | Implemented |
| `/dashboard/salaries` | bundle-discovered | Payroll-related route | Implemented via route mapper |
| `/dashboard/stats` | bundle-discovered | KPI/stats route, role query param observed | Implemented via route mapper |
| `/dashboard/system-settings` | confirmed-browser | Settings route with multi-tab configuration forms | Implemented |
| `/dashboard/teacher/courses` | bundle-discovered | Teacher drill-down route, `teacherId` query observed | Implemented via route mapper |
| `/dashboard/teacher/students` | bundle-discovered | Teacher drill-down route, `teacherId` query observed | Implemented via route mapper |
| `/dashboard/translations` | bundle-discovered | Translation management | Implemented via route mapper |
| `/dashboard/upcoming-classes` | bundle-discovered | Calendar/upcoming classes route, role query observed | Implemented via route mapper |
| `/dashboard/users` | bundle-discovered | User management | Implemented |
| `/dashboard/cms/home/edit` | confirmed-browser | Landing-page CMS editor | Implemented |
| `/dashboard/cms/about/edit` | confirmed-browser | About-page CMS editor | Implemented |
| `/dashboard/cms/services/edit` | confirmed-browser | Services-page CMS editor | Implemented |
| `/dashboard/cms/contact/edit` | confirmed-browser | Contact-page CMS editor | Implemented |

## Route Totals

- Confirmed public route families: 6
- Confirmed authenticated browser routes: 11
- Bundle-discovered authenticated route families: 24
- Total authenticated route families tracked: 32
