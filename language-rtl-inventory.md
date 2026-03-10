# Language and RTL Inventory

| Concern | Reference observation | Local parity |
| --- | --- | --- |
| Locale-prefixed routes | `/ar/*` and `/en/*` alternates present | Public/auth routes added or preserved under `[locale]` |
| RTL document direction | Arabic pages render `dir="rtl"` | Existing locale layout preserved; new pages honor locale direction |
| Language toggle | Real route switch, not content-only swap | Header now rewrites locale segment on current path |
| Arabic auth copy | Login, join, forgot-password visible in Arabic | Added Arabic copy to new auth/contact/about/services pages and forgot-password |
| Direction-sensitive icons | Arrows and spacing mirrored in Arabic | Added conditional rotation on CTA/back arrows |
| LTR fields inside RTL | Phone/email/password fields keep usable input direction | Email and phone inputs set `dir="ltr"` where needed |
| Dashboard shell in Arabic | Sidebar/footer/profile/logout visible in Arabic | Implemented |
| CMS editor locale mode | Live editor exposes English and Arabic editing toggle | Implemented with explicit `English`/`العربية` toggle in CMS editors |
| Dashboard detail/list text | Live authenticated routes stay fully Arabic in RTL mode | Reports, messages, CMS, and applications list/detail now use Arabic-first copy instead of placeholder keys |

## Remaining Differences

- Forgot-password semantics remain email-first because the existing API is email-based.
- Some mapped dashboard aliases reuse existing module copy rather than route-specific translated wording from the reference.
