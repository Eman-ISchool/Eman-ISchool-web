# Performance — AFTER Metrics

**Captured**: 2026-04-04  
**Branch**: `002-virtual-meeting-rooms` (post-parity work)  

---

## Build Output

| Metric | Value |
|--------|-------|
| Build directory size | 1.8 GB |
| Static chunks total | 18 MB |
| Total JS chunk files | ~80 |

## Largest Chunks

| Chunk | Size | Notes |
|-------|------|-------|
| sanity-vendor | 3.5 MB | Sanity CMS — candidate for removal or lazy-load |
| Unknown (91b53649) | 2.0 MB | Needs investigation |
| three-vendor | 1.8 MB | Three.js — now lazy-loaded on VR pages only |
| Unknown (3fccc00d) | 1.4 MB | Needs investigation |
| Chunk 268 | 1.0 MB | Shared chunk |
| recharts-vendor | 302 KB | Charting library — reasonable |

## Key Improvements Applied

| Optimization | Before | After |
|-------------|--------|-------|
| VR lazy-loading | 4 pages with static Three.js imports | All VR pages use `dynamic()` with `ssr: false` — three-vendor only loaded on VR routes |
| Loading skeletons | 1 `loading.tsx` | 13 `loading.tsx` — instant visual feedback on route transitions |
| googleapis | Already server-only | Confirmed — not in client bundle |
| Duplicate route | `/[locale]/(auth)/join` + `/[locale]/join` | Removed duplicate — fixed build error |

## Build Warnings

- `sanity-vendor-*.js` is 3.66 MB — exceeds PWA precache limit
- `next-intl` dynamic import parsing warning — non-blocking
- Prerender errors for DB-dependent pages — expected (no DB at build time)

## Recommendations for Further Optimization

1. **Sanity CMS** (3.5 MB): If Sanity Studio is only used by admins, load it lazily or move to separate route group
2. **Three.js** (1.8 MB): Already lazy-loaded ✅ — only loads on `/vr-*` routes
3. **Unknown large chunks**: Run `npx @next/bundle-analyzer` to identify contents
4. **Image optimization**: Ensure `next/image` is used everywhere instead of `<img>`
