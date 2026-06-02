---
name: Homepage variety and section naming
description: Per-visit artwork variety comes from client-side shuffling of static pools; STYLE/GENRE_SECTIONS names must match the DB exactly
type: project
---

The homepage (`app/page.tsx`) is fully static (`revalidate=false`), so it cannot vary artworks per request server-side without re-introducing per-request DB compute. Variety is therefore **client-side**:

- `app/page.tsx` fetches a larger POOL per row (featured 60, each style/genre section 40), baked into the static page once per deploy.
- `ScrollRow` (a `"use client"` component) takes `shuffleTo={20}`: it renders a random 20-item sample of the pool, reshuffled on every visit via `useEffect` after mount. SSR renders the first 20 (deterministic) so hydration matches, then the client reshuffles. Zero per-request DB.
- `getFeaturedArtworks` uses `TABLESAMPLE SYSTEM (2)` for a cheap random pool — fine because the homepage builds once per deploy, not per request (do NOT copy this to per-request routes).
- `ScrollRow` keys cards by `artwork.id` (NOT `uuid()`, which regenerated keys every render and forced full remounts + image reloads).

**Why:** `revalidate=false` froze the old `Date.now()`-based `hourlyOffset` rotation (now removed), so without client shuffling every visitor saw identical artworks forever.

**How to apply — CRITICAL gotcha:** `STYLE_SECTIONS` / `GENRE_SECTIONS` `name` fields must match `styles.name` / `genres.name` EXACTLY (the section query and the `/browse/.../[slug]` link both look up by them). The DB stores capitalized/pluralized names — e.g. `"Paintings"`, `"Photographs"`, `"Print"`, `"Drawings"`, `"Sculpture"`, `"Ceramics"`, `"Textiles"`. A mismatch makes the row silently render nothing (ScrollRow returns null on empty). The genre sections were ALL blank for this reason until fixed (2026-06-02). `portrait`, `landscape`, and `woodblock print` are NOT genres in this DB. After a sync that adds genres/styles, re-verify these names against the DB. Links: [[Static rendering and cache invalidation]], [[Compute optimizations and query patterns]].
