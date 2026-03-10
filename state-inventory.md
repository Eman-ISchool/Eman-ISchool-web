# State Inventory

| State | Reference evidence | Local parity |
| --- | --- | --- |
| Public form idle | Visible on login, join, contact, forgot-password | Implemented |
| Public form loading | Button/loading labels observed or inferred from submit surfaces | Implemented on auth/contact/forgot-password |
| Public validation error | Invalid credentials and required-field messaging on auth flows | Implemented |
| Public request error | Contact/reset/auth request failure messaging | Implemented |
| Public success | Join success, contact success, forgot-password success | Implemented |
| Disabled controls | Submit buttons disable while pending | Implemented |
| Auth loading shell | Dashboard HTML showed spinner while nav/data hydrate | Implemented on `/dashboard` gate and existing admin pages |
| Empty tables/lists | Existing admin modules show empty rows or empty cards | Reused under reference routes and added explicitly on `/dashboard/applications` and `/dashboard/messages` |
| No results/filter empty | Live applications list exposed search/filter-driven empty outcomes | Implemented on `/dashboard/applications` |
| Partial data | Dashboard widgets can render while internals hydrate | Preserved by wrapping existing admin pages without new blocking fetches |
| Not found | Invalid paths render a 404 surface | Preserved by App Router and catch-all `notFound()` |
| Authenticated request error | Live admin routes depend on API/database calls | Added explicit error panel and retry state on `/dashboard/applications` |

## Known Gaps

- Forgot-password backend remains email-based, not phone-code based.
- Bundle-only routes were mapped to the nearest live module, so some route-specific empty/success wording still differs from the reference.
