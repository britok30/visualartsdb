---
name: Compute optimizations and query patterns
description: Per-render query patterns that keep Neon compute low — cache() dedup, single relational fetch, no per-request ORDER BY RANDOM, no live COUNT(*)
type: project
---

The compute bill is driven by `queries-per-render × renders`. Renders are minimized by static rendering ([[Static rendering and cache invalidation]]); per-render queries are minimized by these patterns — keep them when editing `lib/db/queries.ts` or pages:

- **`React.cache()` on by-slug fetchers.** `getArtworkBySlug` and `getArtistBySlug` are wrapped in `cache()` because `generateMetadata` AND the page body both call them per request, and raw Drizzle calls (unlike `fetch`) are not auto-memoized. cache() is request-scoped → one execution per request. Any helper called by both metadata and body should be cache()-wrapped.
- **One relational query, not N+1.** `getArtworkBySlug` uses a single `db.query.artworks.findFirst({ with: {...} })` (json-aggregated relations) instead of 6 sequential round-trips. Prefer relational `with` over chains of separate selects.
- **No `ORDER BY RANDOM()` on per-request paths.** It full-sorts the table every render. `getRelatedArtworks` uses `orderBy(asc(artworks.year))` instead. RANDOM() is only acceptable in build-time-only queries (see homepage featured, which runs once per deploy).
- **No live `COUNT(*)` for display.** The homepage Hero reads the hardcoded `SITE_STATS` constant (`lib/constants.ts`), not 5 full-table counts. `getStats()` is now a dead export. Update `SITE_STATS` manually after large syncs.

**Why:** Before these changes a single crawled artwork page cost ~13 sequential queries (6 duplicated across metadata+body) and re-ran on a daily timer; the homepage ran 48 queries/regen including 5 full-table counts. Combined with static rendering this dropped a crawled artwork page from ~390 to ~2 DB queries/month.

**How to apply:** When adding a page that fetches in both `generateMetadata` and the body, share one cache()-wrapped function. Favor a single relational query. Never add `ORDER BY RANDOM()` or `COUNT(*)` to a route that renders per request. Verified patterns against prod via throwaway `tsx` scripts under `scripts/` (deleted after). Indexes: slug columns are `.unique()` (already indexed); trigram indexes for search live in `scripts/add-trigram-indexes.sql`.
