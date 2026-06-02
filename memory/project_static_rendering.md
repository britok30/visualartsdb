---
name: Static rendering and cache invalidation
description: All content routes are revalidate=false (fully static); the live site only updates after a redeploy/cache-bust triggered post-sync
type: project
---

This site is treated as **purely static**: data only changes when the user scrapes and syncs the production DB. So every content route exports `export const revalidate = false` (cache indefinitely) instead of a time-based value. Pages render on-demand on first hit, then serve from cache forever — the DB is touched only on first render and when explicitly invalidated.

Routes set to `false`: `app/artwork/[slug]/page.tsx` (+ its `opengraph-image.tsx`), `app/artist/[slug]/page.tsx` (+ OG + `page/[page]/page.tsx`), `app/page.tsx`, and all `app/browse/**` list/detail pages. `app/sitemap.ts` and `app/robots.ts` are intentionally LEFT at `revalidate = 86400` so crawlers keep discovering newly-synced slugs (those new slugs then render fresh on first visit without any redeploy).

**Why:** Time-based revalidation re-queries the DB on a timer even when nothing changed between syncs — pure wasted Neon compute across a 1M+ page catalog. This was the root cause of the runaway compute bill (≈$360/mo). `revalidate=false` eliminates all timer-driven DB work.

**How to apply:** Keep new content routes at `revalidate = false`. After a scrape+sync, the static cache MUST be busted or the live site won't show changes — both sync scripts now POST `VERCEL_DEPLOY_HOOK_URL` to trigger a Vercel redeploy (fresh ISR cache). See `scripts/trigger-redeploy.ts`. Brand-new slugs appear immediately on first visit; only CHANGED existing pages need the redeploy. Never reintroduce a time-based `revalidate` on content routes to "get fresh data" — redeploy instead. Links: [[Data pipeline and sync strategy]], [[Compute optimizations and query patterns]].
