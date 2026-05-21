-- Trigram indexes for fast ILIKE '%query%' substring search.
--
-- WHY: artworks.title and artists.name are searched with leading-% ILIKE in
-- /api/search and lib/db/queries.ts. The existing btree indexes cannot help
-- with leading wildcards, so every keystroke triggers a full sequential scan.
-- GIN + gin_trgm_ops turns those scans into bitmap index scans (~50–100x
-- cheaper on millions of rows).
--
-- HOW TO RUN: paste these into the Neon SQL Editor and run each statement
-- one at a time. CREATE INDEX CONCURRENTLY cannot be wrapped in a
-- transaction, which is why this lives outside the drizzle migration system.
-- Each CONCURRENTLY build will take several minutes on ~1.5M rows but will
-- not lock the table.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS artworks_title_trgm_idx
  ON artworks USING gin (title gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS artists_name_trgm_idx
  ON artists USING gin (name gin_trgm_ops);

-- Refresh planner stats so the optimizer knows to use the new indexes.
ANALYZE artworks;
ANALYZE artists;

-- Verify the planner picks up the index:
--   EXPLAIN (ANALYZE, BUFFERS)
--   SELECT id, title FROM artworks WHERE title ILIKE '%monet%' LIMIT 20;
-- Look for "Bitmap Index Scan on artworks_title_trgm_idx".
