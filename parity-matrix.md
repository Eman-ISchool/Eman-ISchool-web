# Parity Matrix

| Name | Discovery path / route | Type | Present before | Needed action | Implementation status | Validation status | Mobile | RTL | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Public header/footer shell | All public routes | Shared component | Partial | Replace cart-oriented shell with reference-style marketing shell | Done | Targeted lint passed | Good | Good | Real locale switching added |
| Login page | `/login` | Page | Weak | Replace role-card login with unified phone auth | Done | Jest + lint | Good | Good | Uses phone credential flow |
| Join page | `/join` | Page | Weak | Align join with same auth surface | Done | Jest + lint | Good | Good | Separate route kept, same component reused |
| Forgot-password route | `/forgot-password` | Page | Partial | Add direct locale route and Arabic copy | Done, partial | Lint | Good | Good | Backend still email-based |
| About page | `/about` | Page | Missing | Add compact marketing page | Done | Lint | Good | Good | Reference-inspired structure |
| Services page | `/services` | Page | Missing | Add services marketing page | Done | Lint | Good | Good | CTA strip added |
| Contact page | `/contact` | Page | Missing | Add direct form route with real submit states | Done | Lint | Good | Good | `/api/contact` added |
| Locale switching | Public shell | Interaction | Weak | Route-level switch instead of client-only toggle | Done | Lint | Good | Good | Preserves active path |
| Phone credential normalization | Auth backend | Shared logic | Missing | Support phone-based auth/register parity | Done | Jest passed | N/A | N/A | Added helper library |
| Registration API phone support | `/api/auth/register` | API | Weak | Accept country code, normalize phone, allow simpler password rule | Done | Jest helper coverage + lint | N/A | N/A | Still stores role as parent |
| Dashboard shell | `/dashboard` | Shared layout | Missing | Add reference-style shell and auth gate | Done | Lint | Good | Good | Admin users stay in `/dashboard` family |
| Dashboard overview | `/dashboard` | Page | Structurally different | Replace weak wrapper with a closer KPI/dashboard composition | Done | Lint | Good | Good | Custom overview now mirrors the reference card rhythm more closely |
| Dashboard profile | `/dashboard/profile` | Page | Missing in route family | Add tabbed personal/security/danger profile editor | Done | Lint | Good | Good | Stronger form parity |
| Messages workspace | `/dashboard/messages` | Page | Weak | Replace audit table view with conversation-list + empty-state workspace | Done | Lint | Good | Good | Much closer to the reference |
| System settings | `/dashboard/system-settings` | Page | Weak | Add tabbed settings studio matching the reference structure | Done | Lint | Good | Good | `/dashboard/settings` now aliases here |
| Analytics reports | `/dashboard/admin/reports` | Page | Missing | Add live browser-confirmed analytics route | Done | Lint | Good | Good | Replaces the earlier incorrect `/dashboard/reports` assumption |
| Applications list | `/dashboard/applications` | Page | Weak | Replace alias-only route with filterable list and detail CTA | Done | Jest + lint | Good | Good | Search, status, grade, date, pagination, and error states added |
| Core dashboard routes | `/dashboard/users`, `/dashboard/courses`, `/dashboard/quizzes` | Route family | Missing in reference path | Alias existing admin modules | Done | Lint | Good | Good | Reuses interactive existing pages |
| CMS landing | `/dashboard/cms` | Page | Weak | Add page list with edit/preview actions | Done | Lint | Good | Good | Aligns with the live browser CMS index |
| CMS editors | `/dashboard/cms/*/edit` | Page family | Missing | Add editor surfaces for home/about/services/contact | Done | Lint | Good | Good | Interactive front-end editors with Arabic/English toggle; persistence still backend-dependent |
| Application detail | `/dashboard/applications/[id]` | Page | Missing | Add first-class detail screen | Done | Lint | Good | Good | Driven by Supabase data where available |
| Secondary dashboard routes | `/dashboard/applications`, `/dashboard/blogs`, `/dashboard/categories` | Route family | Missing in reference path | Add catch-all mapper to live admin modules | Done | Jest inventory + lint | Good | Good | Mapped to the nearest existing modules |
| Finance dashboard routes | `/dashboard/banks`, `/dashboard/coupons`, `/dashboard/currencies`, `/dashboard/expenses`, `/dashboard/payments`, `/dashboard/payslips`, `/dashboard/salaries` | Route family | Missing in reference path | Add catch-all mapper to finance/admin modules | Done | Jest inventory + lint | Good | Good | Semantic mapping, not 1:1 bespoke pages |
| Teacher drill-down routes | `/dashboard/teacher/courses`, `/dashboard/teacher/students` | Route family | Missing in reference path | Add filtered-route family mapping | Done | Jest inventory + lint | Good | Good | Query-param variants documented |
| System utility routes | `/dashboard/backup`, `/dashboard/lookups`, `/dashboard/system-settings`, `/dashboard/translations`, `/dashboard/upcoming-classes` | Route family | Missing in reference path | Add catch-all mapper | Done | Jest inventory + lint | Good | Good | Routed to closest live modules |
| Auth feedback accessibility | Auth/contact/reset forms | State/a11y | Weak | Add `aria-live`, required inputs, unique IDs | Done | Lint | Good | Good | Improved without changing APIs |

## Classification Summary

- Exists and strong match: public header/footer shell, login, join, contact, dashboard shell, core dashboard routes
- Exists but weak before work: login, register, locale switching, registration API, forgot-password
- Missing entirely before work: about, services, contact, `/dashboard/*` reference route family
- Blocked by backend/data constraints: phone-based forgot-password reset, richer CMS persistence, some finance/report deep data
- Blocked by local runtime: browser validation against the local app is currently prevented by a dev route-matcher failure where locale routes resolve to `/_not-found`
