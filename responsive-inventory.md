# Responsive Inventory

## Observed Reference Patterns

- Public pages keep a compact header and reduce navigation into a mobile menu.
- Auth entry collapses into a single-column card on narrow screens.
- Dashboard shell shifts from permanent sidebar to a bottom-sheet style full-list mobile menu.
- Arabic `dir="rtl"` is preserved on mobile as well as desktop.

## Local Responsive Parity

| Area | Desktop behavior | Mobile behavior | Status |
| --- | --- | --- | --- |
| Public header | Inline nav and CTAs | Toggleable mobile menu with same route set | Implemented |
| Auth card | Two-column hero/form layout | Single-column stacked card | Implemented |
| About/services/contact | Multi-column sections | Single-column stacks and wrapped CTAs | Implemented |
| Dashboard shell | Sidebar + sticky top header | Bottom-sheet route list + header menu button | Implemented |
| Forms | Wide rows and grouped controls | Stacked inputs, large tap targets | Implemented |
| Applications flow | Table/list on large screens | Card stack with preserved filters and detail CTA | Implemented |

## Validation Note

- Reference responsive validation was completed through a live Chrome remote-debug session, including captured mobile screenshots for dashboard, profile, and the mobile navigation sheet.
- Local browser validation remains blocked by the current dev runtime issue where the Next app resolves locale routes to `/_not-found`.
