import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

const BASE_URL = "https://www.visualartsdb.com";
// Artwork sitemaps advertise ~1.5M thin URLs. Crawlers chewing through that
// corpus force on-demand renders around the clock and keep Neon compute from
// ever suspending — so they're opt-in. Artists + browse pages (~150k URLs)
// are the SEO surface worth indexing and stay on by default.
const INCLUDE_ARTWORK_SITEMAPS = process.env.INCLUDE_ARTWORK_SITEMAPS === "1";

// Hardcoded shard counts (avoid expensive count queries during build).
// Each shard covers an equal slice of the random UUID space, so keep enough
// shards that no slice approaches the sitemap protocol's 50k-URL limit.
const ARTIST_SITEMAPS = 3;   // ~36k artists per shard at 110k artists
const ARTWORK_SITEMAPS = 40; // ~36k artworks per shard at 1.45M imaged works

export const revalidate = 86400;

// Shards are sliced by UUID range, not LIMIT/OFFSET: at 1.6M rows an
// `OFFSET 50000` made Postgres walk every skipped row, and the artist shards
// blew past even a 420s build timeout. A range predicate is an index seek.
// UUIDs are uniformly distributed, so equal hex slices give equal shard sizes.
function uuidBoundary(index: number, total: number): string {
  const prefix = Math.floor((index * 0x1_0000_0000) / total)
    .toString(16)
    .padStart(8, "0");
  return `${prefix}-0000-0000-0000-000000000000`;
}

/** Half-open [from, to) range for `shard` of `total`; `to` is null on the last. */
function uuidRange(shard: number, total: number) {
  return {
    from: uuidBoundary(shard, total),
    to: shard === total - 1 ? null : uuidBoundary(shard + 1, total),
  };
}

export async function generateSitemaps() {
  // id 0 = static + styles + genres + museums
  // id 1..ARTIST_SITEMAPS = artist batches
  // id (ARTIST_SITEMAPS+1)..(ARTIST_SITEMAPS+ARTWORK_SITEMAPS) = artwork batches
  const total =
    1 + ARTIST_SITEMAPS + (INCLUDE_ARTWORK_SITEMAPS ? ARTWORK_SITEMAPS : 0);
  return Array.from({ length: total }, (_, i) => ({ id: i }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);

  if (id === 0) {
    const [stylesResult, genresResult, museumsResult] = await Promise.all([
      db.execute(sql`
        WITH counts AS (
          SELECT style_id, count(*) AS n
          FROM artwork_styles GROUP BY style_id
        )
        SELECT s.slug FROM styles s
        INNER JOIN counts c ON c.style_id = s.id
        WHERE c.n >= 5
      `),
      db.execute(sql`
        WITH counts AS (
          SELECT genre_id, count(*) AS n
          FROM artworks WHERE genre_id IS NOT NULL GROUP BY genre_id
        )
        SELECT g.slug FROM genres g
        INNER JOIN counts c ON c.genre_id = g.id
        WHERE c.n >= 5
      `),
      db.execute(sql`
        SELECT DISTINCT m.slug FROM museums m
        INNER JOIN artworks a ON a.museum_id = m.id
      `),
    ]);
    const allStyles = stylesResult.rows as unknown as Array<{ slug: string }>;
    const allGenres = genresResult.rows as unknown as Array<{ slug: string }>;
    const allMuseums = museumsResult.rows as unknown as Array<{ slug: string }>;

    return [
      { url: BASE_URL, changeFrequency: "daily", priority: 1 },
      { url: `${BASE_URL}/browse/styles`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/browse/genres`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/browse/museums`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/browse/artists`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/search`, changeFrequency: "weekly", priority: 0.6 },
      { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
      { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
      ...allStyles.map((s) => ({
        url: `${BASE_URL}/browse/styles/${s.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...allGenres.map((g) => ({
        url: `${BASE_URL}/browse/genres/${g.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...allMuseums.map((m) => ({
        url: `${BASE_URL}/browse/museums/${m.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  }

  if (id <= ARTIST_SITEMAPS) {
    const { from, to } = uuidRange(id - 1, ARTIST_SITEMAPS);
    // EXISTS semi-join instead of DISTINCT ON + INNER JOIN: the join build
    // over 1.2M artwork_artists rows OOM-crashed the 0.25 CU compute during
    // builds; the semi-join streams off the artist_id index.
    const result = await db.execute(sql`
      SELECT ar.slug, ar.updated_at FROM artists ar
      WHERE ar.id >= ${from}::uuid
        ${to ? sql`AND ar.id < ${to}::uuid` : sql``}
        AND EXISTS (
          SELECT 1 FROM artwork_artists aa WHERE aa.artist_id = ar.id
        )
    `);
    const rows = result.rows as unknown as Array<{
      slug: string;
      updated_at: string | Date;
    }>;

    // lastModified is the one sitemap field Google actually uses (it ignores
    // changefreq/priority) — it schedules recrawls off it when accurate.
    return rows.map((a) => ({
      url: `${BASE_URL}/artist/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  }

  const { from, to } = uuidRange(id - (ARTIST_SITEMAPS + 1), ARTWORK_SITEMAPS);
  const result = await db.execute(sql`
    SELECT a.slug, a.updated_at FROM artworks a
    WHERE a.id >= ${from}::uuid
      ${to ? sql`AND a.id < ${to}::uuid` : sql``}
      AND a.image_url IS NOT NULL
  `);
  const rows = result.rows as unknown as Array<{
    slug: string;
    updated_at: string | Date;
  }>;

  return rows.map((a) => ({
    url: `${BASE_URL}/artwork/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));
}
