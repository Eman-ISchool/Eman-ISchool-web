# Reference Component Inventory

| Component family | Reference behavior | Local parity action |
| --- | --- | --- |
| Public header | Sticky top bar, locale toggle, public nav, login/join CTAs, mobile menu | Rebuilt header with locale-path switching, auth-aware CTAs, mobile drawer menu |
| Public footer | Compact link groups and contact information | Rebuilt simplified footer with quick links and contact block |
| Unified auth card | Split hero/form composition with login and join tabs | Added `ReferenceAuthCard` |
| Phone field | Country code plus mobile number entry | Added `PhoneField` with unique IDs and required phone input |
| Password field | Visibility toggle with inline icon | Added RTL-aware toggle placement and input padding |
| Dashboard shell | Sidebar, sticky top header, mobile drawer, account/logout footer | Added `ReferenceDashboardShell` |
| Page title band | Title plus subtitle in dashboard header | Added across `/dashboard` routes |
| Management tables/lists | Filterable tables and list cards | Reused existing admin modules under reference routes |
| Status banners | Success/error callouts in forms | Added `aria-live` feedback in auth/contact/forgot-password flows |
| Empty/loading states | Spinner, empty rows, empty cards | Reused existing admin states and added auth gate spinner |
| Locale switch | Real route-level locale change, not local UI-only state | Switched header language toggle to route replacement |
| Mobile nav patterns | Hamburger on public pages, drawer on dashboard | Implemented both shells |

## Design Approximation System

- Color direction: slate, sky, and white surfaces instead of copying reference branding.
- Density: compact top-level marketing IA with larger auth card and tighter dashboard chrome.
- Radius/shadow: rounded-xl to rounded-3xl surfaces with soft elevation.
- RTL rules: mirrored icon direction where needed, LTR on email/phone inputs, locale-based copy.
