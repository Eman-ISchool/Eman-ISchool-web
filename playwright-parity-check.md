# Playwright Parity Check

## Method

- Browser automation used Playwright over Chrome CDP at `http://127.0.0.1:9222` because sandboxed Chromium launch is not available in this environment.
- Local app target: `http://127.0.0.1:3002`
- Reference app target: `https://futurelab.school`
- Comparison date: 2026-03-09

## Results

| Check | URL | Status | Result |
| --- | --- | --- | --- |
| Reference public join | `https://futurelab.school/ar/join` | 200 | Rendered expected public auth surface |
| Local public join | `http://127.0.0.1:3002/ar/join` | 404 | Rendered Next `404 This page could not be found.` |
| Reference authenticated applications | `https://futurelab.school/ar/dashboard/applications` | 200 | Rendered authenticated dashboard applications list |
| Local authenticated applications | `http://127.0.0.1:3002/ar/dashboard/applications` | 404 | Rendered Next `404 This page could not be found.` |

## Screenshot Artifacts

- `/tmp/reference-join-playwright.png`
- `/tmp/local-join-playwright.png`
- `/tmp/reference-applications-playwright.png`
- `/tmp/local-applications-playwright.png`

## Conclusion

- The current local project is not browser-parity equivalent yet, because the local runtime still fails before UI comparison: locale-prefixed routes return 404 in the browser.
- This is consistent with the earlier local runtime blocker where the dev server routes locale paths through `/_not-found`.
