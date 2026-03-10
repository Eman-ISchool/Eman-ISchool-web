# Interaction Inventory

| Interaction | Reference observation | Local implementation |
| --- | --- | --- |
| Locale toggle | Route-level language switch between Arabic and English | Header rewrites locale segment and preserves current path |
| Public mobile nav | Collapsed menu with same public links and auth CTAs | Implemented mobile menu in header |
| Login submit | Phone + password submit with disabled state and inline error | Implemented with `next-auth` credentials and phone lookup |
| Join submit | Same surface, account creation tab, success return to login | Implemented with `/api/auth/register` and success handoff |
| Password visibility | Inline eye toggle inside password inputs | Implemented with RTL-aware placement |
| Forgot password | Single-field request flow with success confirmation | Existing API reused, UI localized and aliased to `/[locale]/forgot-password` |
| Contact form | Real submit with clear feedback | Added `/api/contact` and loading/success/error feedback |
| Dashboard auth gate | Unauthenticated users are redirected or prompted back to sign in | Added explicit sign-in gate for `/dashboard` |
| Dashboard sidebar | Route navigation, active item, logout, profile/system settings access | Implemented grouped sidebar and bottom-sheet mobile shell |
| Dashboard route drilling | Internal modules link deeper into lists/details | Added direct routes, application detail drill-down, CMS editors, and catch-all route mapper to live admin modules |
| Application list filters | Search, status, bundle, and date filters observed on the live list page | Implemented first-class `/dashboard/applications` filters, pagination, no-results, and detail CTA |
| CMS language toggle | Live editor switches between English and Arabic content modes | Implemented language toggle in `/dashboard/cms/*/edit` with mirrored section fields |
| Logout | Accessible from dashboard shell/footer area | Implemented in header and dashboard shell |

## Inferred Behaviors

- Shared dashboard shell likely powers most authenticated pages.
- Query-param variants such as `?role=` and `?teacherId=` likely filter shared templates rather than different page structures.
- Loading indicators appear before widget/list hydration on authenticated routes.
