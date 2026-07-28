// Precomputes the homepage into lib/home-snapshot.json so the page renders
// with ZERO database queries at build time.
//
// Why: the homepage needs 43 section pools. Querying them live cost ~2 minutes
// of build time and, once the catalog passed 1.5M rows, the only query shape
// fast enough (unordered index scan) always returned the physically-oldest
// rows — so none of the 490k newly imported works ever appeared. Sampling
// properly is too slow to do during a build, but perfectly fine to do once,
// here, offline.
//
//   npx tsx scripts/build-home-snapshot.ts
//
// Re-run after a sync to refresh the homepage, then commit the JSON.

import { writeFileSync } from "fs";
import { neon } from "@neondatabase/serverless";
import { STYLE_SECTIONS, GENRE_SECTIONS } from "../lib/home-sections";
import type { HomeArtwork } from "../lib/db/queries";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}
const sql = neon(url);

const POOL_SIZE = 40;
const FEATURED_SIZE = 60;
const OUT = "lib/home-snapshot.json";

async function q<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  for (let a = 1; ; a++) {
    try {
      return (await sql.query(text, params)) as T[];
    } catch (e) {
      if (a >= 5) throw e;
      console.log(`    retry ${a}: ${(e as Error).message.slice(0, 60)}`);
      await new Promise((r) => setTimeout(r, 3000 * a));
    }
  }
}

/**
 * Hydrate artwork rows from ids. Ids come from an index scan above; these are
 * primary-key lookups, so this stays fast no matter how large the table gets.
 */
async function hydrate(ids: string[]): Promise<HomeArtwork[]> {
  if (ids.length === 0) return [];
  const rows = await q<HomeArtwork>(
    `SELECT a.id, a.title, a.slug, a.year,
            a.image_url AS "imageUrl",
            a.thumbnail_url AS "thumbnailUrl",
            (SELECT ar.name FROM artists ar
              INNER JOIN artwork_artists aa ON aa.artist_id = ar.id
              WHERE aa.artwork_id = a.id LIMIT 1) AS "artistName",
            (SELECT ar.slug FROM artists ar
              INNER JOIN artwork_artists aa ON aa.artist_id = ar.id
              WHERE aa.artwork_id = a.id LIMIT 1) AS "artistSlug"
     FROM artworks a
     WHERE a.id = ANY($1) AND a.image_url IS NOT NULL`,
    [ids],
  );
  return rows;
}

/** Random window into an index scan: cheap, and unbiased across import dates. */
function randomOffset(total: number, want: number): number {
  if (total <= want) return 0;
  return Math.floor(Math.random() * (total - want));
}

async function styleSection(name: string): Promise<HomeArtwork[]> {
  const [{ n }] = await q<{ n: string }>(
    `SELECT count(*) n FROM artwork_styles ast
     INNER JOIN styles s ON s.id = ast.style_id WHERE s.name = $1`,
    [name],
  );
  const total = Number(n);
  if (total === 0) return [];
  // Offset walks the style_id index only — far cheaper than offsetting the
  // 1.6M-row artworks table, and it reaches works from every import era.
  const offset = randomOffset(total, POOL_SIZE * 2);
  const ids = await q<{ artwork_id: string }>(
    `SELECT ast.artwork_id FROM artwork_styles ast
     INNER JOIN styles s ON s.id = ast.style_id
     WHERE s.name = $1 LIMIT $2 OFFSET $3`,
    [name, POOL_SIZE * 2, offset],
  );
  const rows = await hydrate(ids.map((r) => r.artwork_id));
  return rows.slice(0, POOL_SIZE);
}

async function genreSection(name: string): Promise<HomeArtwork[]> {
  const [{ n }] = await q<{ n: string }>(
    `SELECT count(*) n FROM artworks a
     INNER JOIN genres g ON g.id = a.genre_id WHERE g.name = $1`,
    [name],
  );
  const total = Number(n);
  if (total === 0) return [];
  const offset = randomOffset(total, POOL_SIZE * 2);
  const ids = await q<{ id: string }>(
    `SELECT a.id FROM artworks a
     INNER JOIN genres g ON g.id = a.genre_id
     WHERE g.name = $1 LIMIT $2 OFFSET $3`,
    [name, POOL_SIZE * 2, offset],
  );
  const rows = await hydrate(ids.map((r) => r.id));
  return rows.slice(0, POOL_SIZE);
}

async function featured(): Promise<HomeArtwork[]> {
  // TABLESAMPLE reads a random slice of pages; ORDER BY random() over that
  // small sample (rather than LIMITing it directly) avoids favouring the
  // earliest sampled pages, which is what hid new imports from this row.
  const ids = await q<{ id: string }>(
    `SELECT a.id FROM artworks a TABLESAMPLE SYSTEM (1)
     WHERE a.image_url IS NOT NULL
     ORDER BY random() LIMIT $1`,
    [FEATURED_SIZE * 2],
  );
  const rows = await hydrate(ids.map((r) => r.id));
  return rows.slice(0, FEATURED_SIZE);
}

function summarize(rows: HomeArtwork[]) {
  const src = (s: string) =>
    s.startsWith("vam-") ? "vam" : s.startsWith("pm-") ? "paris" : s.startsWith("fng-") ? "fng" : "original";
  const c: Record<string, number> = {};
  for (const r of rows) c[src(r.slug)] = (c[src(r.slug)] ?? 0) + 1;
  return Object.entries(c).map(([k, v]) => `${k}:${v}`).join(" ");
}

async function main() {
  console.log("Building homepage snapshot…");

  const t0 = Date.now();
  const featuredRows = await featured();
  console.log(`  featured: ${featuredRows.length} (${summarize(featuredRows)})`);

  const styles: Record<string, HomeArtwork[]> = {};
  for (const s of STYLE_SECTIONS) {
    const rows = await styleSection(s.name);
    styles[s.slug] = rows;
    console.log(`  style ${s.slug}: ${rows.length} (${summarize(rows)})`);
  }

  const genres: Record<string, HomeArtwork[]> = {};
  for (const g of GENRE_SECTIONS) {
    const rows = await genreSection(g.name);
    genres[g.slug] = rows;
    console.log(`  genre ${g.slug}: ${rows.length} (${summarize(rows)})`);
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    featured: featuredRows,
    styles,
    genres,
  };
  writeFileSync(OUT, JSON.stringify(snapshot, null, 1));
  const empty = [
    ...Object.entries(styles),
    ...Object.entries(genres),
  ].filter(([, v]) => v.length === 0);
  console.log(`\nWrote ${OUT} in ${Math.round((Date.now() - t0) / 1000)}s`);
  if (empty.length) {
    console.log(`WARNING: ${empty.length} empty sections: ${empty.map(([k]) => k).join(", ")}`);
  }
}

main().catch((e) => {
  console.error("FAILED:", (e as Error).message);
  process.exit(1);
});
