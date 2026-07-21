-- Data-quality cleanup, based on the 2026-07 audit of the production DB.
-- NOT run automatically. Review each section, run the SELECT to preview, then
-- the UPDATE/DELETE. Run against BOTH the scrape (source) DB and the target
-- DB — otherwise the next sync re-imports the junk. Wrap in a transaction.
--
-- Audit numbers (target DB): 89,869 artists / 1,088,370 artworks.

BEGIN;

-- ────────────────────────────────────────────────────────────────────
-- 1. Placeholder "artists" that are really sitter descriptions.
--    "Unidentified Man" (639+ works), "Unidentified Woman", "Unknown".
--    Unlinking (not deleting artworks) is right: the works are real, the
--    attribution isn't. The site now renders artist-less artworks cleanly.
-- Preview:
SELECT ar.id, ar.name, count(aa.artwork_id) AS works
FROM artists ar
LEFT JOIN artwork_artists aa ON aa.artist_id = ar.id
WHERE ar.name IN ('Unknown', 'Unidentified Man', 'Unidentified Woman', 'Unidentified Artist', 'Anonymous')
   OR ar.name ~* '^unidentified'
GROUP BY ar.id, ar.name
ORDER BY works DESC;

-- Apply:
-- DELETE FROM artwork_artists WHERE artist_id IN (
--   SELECT id FROM artists
--   WHERE name IN ('Unknown', 'Unidentified Man', 'Unidentified Woman', 'Unidentified Artist', 'Anonymous')
--      OR name ~* '^unidentified'
-- );
-- DELETE FROM artist_styles WHERE artist_id IN (SELECT id FROM artists WHERE name ~* '^unidentified' OR name IN ('Unknown', 'Anonymous'));
-- DELETE FROM artists
-- WHERE name IN ('Unknown', 'Unidentified Man', 'Unidentified Woman', 'Unidentified Artist', 'Anonymous')
--    OR name ~* '^unidentified';

-- ────────────────────────────────────────────────────────────────────
-- 2. Artist names with catalog dates baked in,
--    e.g. "William Bache, 22 Dec 1771 9 Jul 1845".
-- Preview (verify no legitimate names match before applying):
SELECT id, name,
       regexp_replace(name, ',\s+\d{1,2} [A-Z][a-z]{2} \d{4}.*$', '') AS cleaned
FROM artists
WHERE name ~ ',\s+\d{1,2} [A-Z][a-z]{2} \d{4}';

-- Apply:
-- UPDATE artists
-- SET name = regexp_replace(name, ',\s+\d{1,2} [A-Z][a-z]{2} \d{4}.*$', '')
-- WHERE name ~ ',\s+\d{1,2} [A-Z][a-z]{2} \d{4}';

-- ────────────────────────────────────────────────────────────────────
-- 3. Whitespace hygiene: 564 artwork titles and a handful of artist names
--    with leading/trailing/doubled spaces.
-- Preview:
SELECT count(*) FROM artworks WHERE title <> btrim(regexp_replace(title, '\s+', ' ', 'g'));

-- Apply:
-- UPDATE artworks SET title = btrim(regexp_replace(title, '\s+', ' ', 'g'))
-- WHERE title <> btrim(regexp_replace(title, '\s+', ' ', 'g'));
-- UPDATE artists SET name = btrim(regexp_replace(name, '\s+', ' ', 'g'))
-- WHERE name <> btrim(regexp_replace(name, '\s+', ' ', 'g'));

-- ────────────────────────────────────────────────────────────────────
-- 4. HTML entities in titles (7 rows found).
-- Preview:
SELECT id, title FROM artworks WHERE title ~ '&(amp|lt|gt|quot|#\d+);';

-- Apply:
-- UPDATE artworks SET title = replace(replace(replace(replace(title,
--   '&amp;', '&'), '&lt;', '<'), '&gt;', '>'), '&quot;', '"')
-- WHERE title ~ '&(amp|lt|gt|quot);';

-- ────────────────────────────────────────────────────────────────────
-- 5. Mojibake titles (11 rows found, pattern 'Ã|â€|�') — too few to script
--    safely; fix by hand.
SELECT id, title FROM artworks WHERE title ~ 'Ã|â€|�';

COMMIT;

-- After applying to the TARGET db, revalidate affected pages (or wait out the
-- 30-day window). After applying to the SOURCE db, nothing else needed — the
-- incremental sync only copies new rows.
